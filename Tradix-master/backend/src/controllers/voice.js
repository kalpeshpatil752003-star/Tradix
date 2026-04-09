import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a voice command parser for a trading journal app called Star Tradix.
The user will give you a voice transcript. You must determine the intent and return a JSON object only.

Two possible intents:

1. NAVIGATE — user wants to go to a page
Return: { "intent": "navigate", "route": "<route_name>" }
Valid routes: dashboard, analytics, journal, calendar, trades, add trade, new trade, import trade, settings, library, backtester, tracking, statistics

// In SYSTEM_PROMPT, replace the log_trade line with this:
2. LOG_TRADE — user wants to log a trade
Return: { "intent": "log_trade", "tradeData": { "symbol": "", "action": "buy|sell", "quantity": 0, "entryPrice": 0, "stopLoss": 0, "takeProfit": 0, "notes": "" } }
- quantity: how many shares/units (e.g. "100 shares" → 100)
- entryPrice: the buy/entry price (after "at", "entry", "price")
- stopLoss: the stop loss price. Triggered by "stop loss", "SL", "stop at", "stoploss", "with a stop", "stop". ALWAYS extract this if mentioned. Never leave it 0 if the user said a stop value.
- takeProfit: the target/exit price. Triggered by "target", "TP", "take profit", "profit at".
- Only include fields clearly mentioned. action defaults to "buy" if unclear.

3. UNKNOWN — command not understood
Return: { "intent": "unknown", "message": "Brief friendly error message" }

RULES:
- Return ONLY valid JSON. No explanation, no markdown, no backticks.
- For symbols, convert company names to tickers (Tesla → TSLA, Apple → AAPL, etc.)
- Be flexible with phrasing ("go to", "open", "show me", "navigate to" all mean navigate)
- "bought", "buy", "long" mean action: "buy". "sold", "sell", "short" mean action: "sell"
- ALL numeric values (quantity, entryPrice, stopLoss, takeProfit) MUST be plain integers or decimals. NEVER use colon-separated format. If you see "1:20" treat it as 120, "2:30" as 230, "14:50" as 1450. No exceptions.`;

// ─── Normalize transcript before sending to AI ────────────────────────────────
// Fixes: speech-to-text sometimes writes "150" as "1:50" or "2400" as "24:00"
// We detect time-like patterns that are NOT real times (i.e. the minute part > 59
// OR they appear right after price/quantity keywords) and flatten them.
function normalizeTranscript(text) {
  let normalized = text;

  // Normalize stop loss shorthands so AI recognizes them
  normalized = normalized.replace(/\bexit price\b/gi, "take profit");
  normalized = normalized.replace(/\bexit at\b/gi, "take profit");
  normalized = normalized.replace(/\bclose at\b/gi, "take profit");
  normalized = normalized.replace(/\bsell at\b/gi, "take profit");
  normalized = normalized.replace(/\bsl\b/gi, "stop loss");
  normalized = normalized.replace(/\bstoploss\b/gi, "stop loss");
  normalized = normalized.replace(/\bstop at\b/gi, "stop loss");
  normalized = normalized.replace(/\bwith a stop\b/gi, "stop loss");
  normalized = normalized.replace(/\btp\b/gi, "take profit");

  // Pass 1: X:YY where minutes > 59 — definitely not a real time
  normalized = normalized.replace(/\b(\d{1,3}):(\d{2})\b/g, (match, h, m) => {
    if (parseInt(m) > 59) return h + m;
    return match;
  });

  // Pass 2: financial keywords ANYWHERE in the sentence → flatten ALL X:YY in it
  const financialKeywords = /\b(buy|sell|bought|sold|long|short|at|for|price|entry|exit|stop|target|quantity|qty|shares|lots|units|trade|order)\b/i;
  if (financialKeywords.test(normalized)) {
    // If this looks like a trading command, flatten every X:YY unconditionally
    normalized = normalized.replace(/\b(\d{1,3}):(\d{2})\b/g, (_, h, m) => h + m);
  }

  return normalized;
}

export const parseVoiceCommand = async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: "No transcript provided" });
    }

    // ✅ Normalize before sending to AI
    const cleanedTranscript = normalizeTranscript(transcript.trim());

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      `Voice transcript: "${cleanedTranscript}"`
    );

    const raw = result.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(200).json({
        intent: "unknown",
        message: "Couldn't understand that command. Try again.",
      });
    }

    // ✅ Post-process: fix any time-like numbers the AI still returned
    if (parsed.intent === "log_trade" && parsed.tradeData) {
      const td = parsed.tradeData;
      const numericFields = ["quantity", "entryPrice", "stopLoss", "takeProfit"];
      for (const field of numericFields) {
        if (td[field] !== undefined) {
          const val = String(td[field]);
          // If AI returned "1:50" style, flatten it
          const fixed = val.replace(/^(\d{1,3}):(\d{2})$/, (_, h, m) => h + m);
          td[field] = parseFloat(fixed) || td[field];
        }
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Voice parse error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};