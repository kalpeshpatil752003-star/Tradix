import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a voice command parser for a trading journal app called Star Tradix.
The user will give you a voice transcript. You must determine the intent and return a JSON object only.

Today's date will be provided in the transcript as context.

1. NAVIGATE — user wants to go to a page
Return: { "intent": "navigate", "route": "<route_name>" }
Valid routes: dashboard, analytics, journal, calendar, trades, add trade, new trade, import trade, import trades, pdf import, import pdf, settings, library, backtester, tracking, statistics

2. LOG_TRADE — user wants to log a trade
Return: { "intent": "log_trade", "tradeData": { "symbol": "", "action": "buy|sell", "quantity": 0, "entryPrice": 0, "stopLoss": 0, "takeProfit": 0, "entryDate": "", "exitDate": "", "account": "", "notes": "" } }
- quantity, entryPrice, stopLoss, takeProfit: plain numbers only, never time format
- entryDate / exitDate: output as YYYY-MM-DD format. Use today's date for "today", yesterday's date for "yesterday". If only month+day given, assume current year.
- account: the account name the user mentions (e.g. "kalpesh account" → "kalpesh", "use zerodha" → "zerodha"). Lowercase.
- Only include fields clearly mentioned. action defaults to "buy" if unclear.
- entryPrice: price after "at", "entry", "price", "bought at"
- stopLoss: price after "stop loss", "SL", "stop at", "with a stop"
- takeProfit: price after "exit", "exit at", "target", "TP", "take profit", "sell at", "close at"

3. SELECT_ACCOUNT — user only wants to select/switch account, no trade
Return: { "intent": "select_account", "account": "<account_name_lowercase>" }
Triggered by: "use X account", "switch to X", "select X account", "set account to X", "open X account"

4. UNKNOWN — command not understood
Return: { "intent": "unknown", "message": "Brief friendly error message" }

RULES:
- Return ONLY valid JSON. No explanation, no markdown, no backticks.
- For symbols, convert company names to tickers (Tesla → TSLA, Apple → AAPL, Reliance → RELIANCE, etc.)
- Be flexible with phrasing ("go to", "open", "show me", "navigate to" all mean navigate)
- "bought", "buy", "long" mean action: "buy". "sold", "sell", "short" mean action: "sell"
- ALL numeric values MUST be plain integers or decimals. NEVER use colon-separated format. If you see "1:20" treat it as 120, "2:30" as 230, "14:50" as 1450. No exceptions.
- For dates: "today" = use today's date from context, "yesterday" = one day before, "10th January" / "January 10" = that date in current year. Always output YYYY-MM-DD.`;

// ─── Get today's date as YYYY-MM-DD ──────────────────────────────────────────
function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Normalize transcript ─────────────────────────────────────────────────────
function normalizeTranscript(text) {
  let normalized = text;

  // Normalize stop loss / take profit shorthands
  normalized = normalized.replace(/\bsl\b/gi, "stop loss");
  normalized = normalized.replace(/\bstoploss\b/gi, "stop loss");
  normalized = normalized.replace(/\bstop at\b/gi, "stop loss");
  normalized = normalized.replace(/\bwith a stop\b/gi, "stop loss");
  normalized = normalized.replace(/\btp\b/gi, "take profit");
  normalized = normalized.replace(/\bexit price\b/gi, "take profit");
  normalized = normalized.replace(/\bexit at\b/gi, "take profit");
  normalized = normalized.replace(/\bclose at\b/gi, "take profit");
  normalized = normalized.replace(/\bsell at\b/gi, "take profit");

  // Pass 1: X:YY where minutes > 59
  normalized = normalized.replace(/\b(\d{1,3}):(\d{2})\b/g, (match, h, m) => {
    if (parseInt(m) > 59) return h + m;
    return match;
  });

  // Pass 2: if financial sentence, flatten ALL X:YY unconditionally
  const financialKeywords = /\b(buy|sell|bought|sold|long|short|at|for|price|entry|exit|stop|target|quantity|qty|shares|lots|units|trade|order)\b/i;
  if (financialKeywords.test(normalized)) {
    normalized = normalized.replace(/\b(\d{1,3}):(\d{2})\b/g, (_, h, m) => h + m);
  }

  return normalized;
}

// ─── Post-process AI response ─────────────────────────────────────────────────
function postProcess(parsed) {
  if (parsed.intent === "log_trade" && parsed.tradeData) {
    const td = parsed.tradeData;

    // Fix any time-like numbers AI still returned
    const numericFields = ["quantity", "entryPrice", "stopLoss", "takeProfit"];
    for (const field of numericFields) {
      if (td[field] !== undefined) {
        const val = String(td[field]);
        const fixed = val.replace(/^(\d{1,3}):(\d{2})$/, (_, h, m) => h + m);
        td[field] = parseFloat(fixed) || td[field];
      }
    }

    // Validate date format — if AI returned something weird, clear it
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (td.entryDate && !dateRegex.test(td.entryDate)) td.entryDate = "";
    if (td.exitDate && !dateRegex.test(td.exitDate)) td.exitDate = "";

    // Lowercase account name
    if (td.account) td.account = td.account.toLowerCase().trim();
  }

  if (parsed.intent === "select_account" && parsed.account) {
    parsed.account = parsed.account.toLowerCase().trim();
  }

  return parsed;
}

export const parseVoiceCommand = async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: "No transcript provided" });
    }

    const cleanedTranscript = normalizeTranscript(transcript.trim());
    const today = getTodayStr();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // ✅ Inject today's date so AI can resolve "today" / "yesterday"
    const result = await model.generateContent(
      `Today's date: ${today}\nVoice transcript: "${cleanedTranscript}"`
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

    parsed = postProcess(parsed);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Voice parse error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};