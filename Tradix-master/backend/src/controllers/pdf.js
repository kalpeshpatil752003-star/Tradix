import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

import dotenv from "dotenv";
import TradeDetails from "../models/tradeDetails.js";
import Accounts from "../models/accounts.js";
import { CalculateTradeStats } from "../utils/calculate.js";
import { AddUpdateTradeStats } from "./tradeStats.js";
import { AddTradeJournal } from "./tradeJournal.js";
import { calculateFeesByExchange } from "../helpers/fees.js";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add this helper function at the top
const callGeminiWithRetry = async (model, content, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(content);
    } catch (err) {
      if (err.message.includes("503") && i < retries - 1) {
        console.log(`Gemini busy, retrying in ${(i+1) * 2}s...`);
        await new Promise(r => setTimeout(r, (i+1) * 2000));
      } else {
        throw err;
      }
    }
  }
};

const SYSTEM_PROMPT = `You are a trading statement parser for an app called Star Tradix.
The user will upload a broker trade statement PDF. Extract ALL trades from it.

Return ONLY a valid JSON object in this exact format:
{
  "trades": [
    {
      "symbol": "AAPL",
      "action": "buy",
      "quantity": 10,
      "entryPrice": 150.00,
      "exitPrice": 160.00,
      "date": "2024-01-15",
      "fees": 0,
      "notes": ""
    }
  ],
  "summary": "Found 5 trades from January 2024. Total buys: 3, Total sells: 2."
}

RULES:
- action must be "buy" or "sell" (lowercase)
- symbol must be the ticker symbol (e.g. RELIANCE, AAPL, BTCUSDT)
- date format: YYYY-MM-DD
- entryPrice is the buy/average price
- exitPrice is the sell price (0 if still open)
- quantity is always a positive number
- fees: extract if available, else 0
- summary: brief human-readable summary of what was found
- Return ONLY valid JSON. No markdown, no backticks, no explanation.
- If no trades found, return: { "trades": [], "summary": "No trades found in this document." }`;

export const parsePdf = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const { broker } = req.body;
    filePath = req.file.path;

    // Read PDF as base64
    const pdfBuffer = fs.readFileSync(filePath);
    const base64Pdf = pdfBuffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Pdf,
        },
      },
      {
        text: `${SYSTEM_PROMPT}\n\nBroker: ${broker || "Unknown"}. Extract all trades from this statement.`,
      },
    ]);

    const raw = result.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(200).json({
        trades: [],
        summary: "Could not parse the PDF. Make sure it is a valid trade statement.",
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("PDF parse error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const importPdfTrades = async (req, res) => {
  try {
    const { trades, accountId } = req.body;
    const { UserId } = req.body;

    if (!trades || trades.length === 0) {
      return res.status(400).json({ error: "No trades to import" });
    }

    const AccountId = parseInt(accountId);

    // Check account exists
    const accountDetails = await Accounts.findOne({ AccountId });
    if (!accountDetails) {
      return res.status(400).json({
        success: false,
        error: "Account not found. Please go to Settings and create an account."
      });
    }

    let successCount = 0;
    let failCount = 0;

    for (const t of trades) {
      try {
        const Action = t.action?.toUpperCase() === "SELL" ? "SELL" : "BUY";
        const Symbol = t.symbol || "UNKNOWN";
        const EntryPrice = parseFloat(t.entryPrice) || 0;
        const ExitPrice = parseFloat(t.exitPrice) || 0;
        const Quantity = parseFloat(t.quantity) || 0;
        const Fees = parseFloat(t.fees) || calculateFeesByExchange("Unknown", EntryPrice, ExitPrice, Quantity);
        const EntryDate = t.date ? new Date(t.date) : new Date();
        const ExitDate = t.date ? new Date(t.date) : new Date();
        const TradeStatus = ExitPrice > 0 ? "Closed" : "Open";
        const TradeName = `${Symbol} ${Action}`;

        // Get next TradeId
        let lastId = await TradeDetails.findOne().sort('-TradeId');
        const TradeId = lastId ? lastId.TradeId + 1 : 1;

        // Save trade
        const newTrade = new TradeDetails({
          TradeId, TradeName, Market: "Stocks", Broker: "PDF Import",
           // ✅ Fix
          Setup: "PDF Import", TradeStatus, Action, Symbol,
          EntryDate, ExitDate, EntryPrice, ExitPrice,
          StopLoss: 0, Quantity, AccountId,
          UserId, CreatedBy: UserId,
        });

        const saved = await newTrade.save();

        if (saved && TradeStatus === "Closed") {
          // Calculate and save stats
          const Stats = await CalculateTradeStats(Action, EntryPrice, ExitPrice, 0, Quantity, Fees, AccountId);

          // Mock req/res for reusing existing controllers
          const mockReq = {
            body: {
              TradeId, UserId, AccountId, Action, Symbol,
              EntryPrice, ExitPrice, StopLoss: 0, Quantity,
              Fees, TradeStatus, EntryDate, ExitDate,
              Market: "Stocks", Broker: "PDF Import",
              Stats, TradeState: false, IsImport: true,
            }
          };
          const mockRes = { status: () => ({ json: () => {} }) };
          const mockNext = () => {};

          await AddUpdateTradeStats(mockReq, mockRes, mockNext);
          await AddTradeJournal(mockReq, mockRes, mockNext);
        }

        successCount++;
      } catch (tradeErr) {
        console.error("Error saving trade:", tradeErr.message);
        failCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `${successCount} trades imported successfully${failCount > 0 ? `, ${failCount} failed` : ""}!`,
    });

  } catch (err) {
    console.error("Import trades error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};