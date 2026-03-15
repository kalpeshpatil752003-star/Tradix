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

2. LOG_TRADE — user wants to log a trade
Return: { "intent": "log_trade", "tradeData": { "symbol": "", "action": "buy|sell", "quantity": 0, "entryPrice": 0, "stopLoss": 0, "takeProfit": 0, "notes": "" } }
Only include fields that are clearly mentioned. action defaults to "buy" if unclear.

3. UNKNOWN — command not understood
Return: { "intent": "unknown", "message": "Brief friendly error message" }

RULES:
- Return ONLY valid JSON. No explanation, no markdown, no backticks.
- For symbols, convert company names to tickers (Tesla → TSLA, Apple → AAPL, etc.)
- Be flexible with phrasing ("go to", "open", "show me", "navigate to" all mean navigate)
- "bought", "buy", "long" mean action: "buy". "sold", "sell", "short" mean action: "sell"`;

export const parseVoiceCommand = async (req, res) => {
  console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: "No transcript provided" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      `Voice transcript: "${transcript.trim()}"`
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

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Voice parse error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};