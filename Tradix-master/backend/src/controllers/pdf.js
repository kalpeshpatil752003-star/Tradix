import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawn } from "child_process";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
import TradeDetails from "../models/tradeDetails.js";
import Accounts from "../models/accounts.js";
import { CalculateTradeStats } from "../utils/calculate.js";
import { AddUpdateTradeStats } from "./tradeStats.js";
import { AddTradeJournal } from "./tradeJournal.js";
import { calculateFeesByExchange } from "../helpers/fees.js";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const TRADE_NLP_MODEL_PATH = process.env.TRADE_NLP_MODEL_PATH || "C:\\Users\\kalpe\\trade_model3";
const TRADE_NLP_PYTHON_PATH = process.env.TRADE_NLP_PYTHON_PATH || "C:\\Users\\kalpe\\anaconda3\\python.exe";
const TRADE_NLP_SCRIPT_PATH = fileURLToPath(new URL("../ml/tradeNlpParser.py", import.meta.url));

// Add this helper function at the top
const callGeminiWithRetry = async (model, content, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(content);
    } catch (err) {
      if (err.message.includes("503") && i < retries - 1) {
        console.log(`Gemini busy, retrying in ${(i + 1) * 2}s...`);
        await new Promise(r => setTimeout(r, (i + 1) * 2000));
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

const getLocalLLMResponse = async (text, broker) => {
  if (process.env.PREFER_LOCAL_LLM !== "true") return null;

  try {
    console.log("Attempting Local LLM extraction (RTX 5060)...");
    const response = await fetch(process.env.LOCAL_LLM_URL || "http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.LOCAL_LLM_MODEL || "llama3",
        prompt: `${SYSTEM_PROMPT}\n\nBroker: ${broker || "Unknown"}.\n\nText Content:\n${text}`,
        stream: false,
        format: "json"
      }),
      signal: AbortSignal.timeout(60000) // 60s timeout for local (allows for cold start model loading)
    });

    if (response.ok) {
      const data = await response.json();
      return data.response;
    }
  } catch (err) {
    console.log(`Local LLM Error: ${err.message}. Falling back to Gemini Cloud.`);
  }
  return null;
};

const getGeminiResponse = async (model, base64Pdf, broker) => {
  const result = await callGeminiWithRetry(model, [
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
  return result.response.text();
};

const getTradeNlpResponse = (text) => new Promise((resolve) => {
  if (!text || !fs.existsSync(TRADE_NLP_MODEL_PATH) || !fs.existsSync(TRADE_NLP_SCRIPT_PATH)) {
    resolve(null);
    return;
  }

  const child = spawn(TRADE_NLP_PYTHON_PATH, [TRADE_NLP_SCRIPT_PATH, TRADE_NLP_MODEL_PATH], {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });

  let stdout = "";
  let stderr = "";
  const timeout = setTimeout(() => {
    child.kill();
    resolve(null);
  }, 30000);

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  child.on("error", (err) => {
    clearTimeout(timeout);
    console.log(`trade_model3 error: ${err.message}`);
    resolve(null);
  });

  child.on("close", (code) => {
    clearTimeout(timeout);
    if (code !== 0) {
      console.log(`trade_model3 exited with ${code}: ${stderr}`);
      resolve(null);
      return;
    }

    try {
      const parsed = JSON.parse(stdout.trim());
      resolve(parsed?.trades?.length ? parsed : null);
    } catch (err) {
      console.log(`trade_model3 JSON parse error: ${err.message}`);
      resolve(null);
    }
  });

  child.stdin.end(JSON.stringify({ text }));
});

const MONTHS = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const cleanNumber = (value) => {
  if (value === undefined || value === null) return null;
  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();
  return cleaned === "" ? null : Number(cleaned);
};

const normalizeDate = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  const brokerMatch = raw.match(/^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{4})$/);
  if (brokerMatch) {
    const month = MONTHS[brokerMatch[2].slice(0, 3).toLowerCase()];
    if (month) return `${brokerMatch[3]}-${month}-${brokerMatch[1].padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return raw;
};

const buildTrade = ({ date, symbol, action, quantity, price, entryPrice, exitPrice, fees = 0, notes = "" }) => {
  const actionText = String(action || "BUY").toLowerCase();
  const normalizedAction = actionText === "s" || actionText.includes("sell") || actionText.includes("sold") ? "sell" : "buy";
  const cleanedPrice = cleanNumber(price) || 0;
  const cleanedEntryPrice = entryPrice !== undefined ? cleanNumber(entryPrice) : (normalizedAction === "sell" ? 0 : cleanedPrice);
  const cleanedExitPrice = exitPrice !== undefined ? cleanNumber(exitPrice) : (normalizedAction === "sell" ? cleanedPrice : 0);
  return {
    symbol: String(symbol || "UNKNOWN").toUpperCase(),
    action: normalizedAction,
    quantity: cleanNumber(quantity) || 0,
    entryPrice: cleanedEntryPrice || 0,
    exitPrice: cleanedExitPrice || 0,
    date: normalizeDate(date),
    fees: cleanNumber(fees) || 0,
    notes,
  };
};

const detectFormat = (text, broker = "") => {
  const haystack = `${broker}\n${text}`.toLowerCase();
  if (haystack.includes("dhan")) return "dhan";
  if (haystack.includes("btcusdt") || haystack.includes("spot trading") || haystack.includes("binance")) {
    return "binance";
  }
  if (haystack.includes("zerodha")) return "zerodha";
  if (haystack.includes("upstox")) return "upstox";
  if (haystack.includes("angel")) return "angel";
  return "unknown";
};

const summarizeTrades = (trades, source) => {
  if (!trades.length) return "No trades found in this document.";
  const buyCount = trades.filter((trade) => trade.action === "buy").length;
  const sellCount = trades.filter((trade) => trade.action === "sell").length;
  return `Found ${trades.length} trades${source ? ` from ${source}` : ""}. Total buys: ${buyCount}, Total sells: ${sellCount}.`;
};

const toParsedResponse = (trades, source) => ({
  trades,
  summary: summarizeTrades(trades, source),
});

const pairPdfTrades = (trades) => {
  const normalized = trades.map((trade, index) => {
    const actionText = String(trade.action || "BUY").toUpperCase();
    const action = actionText === "SELL" || actionText === "S" ? "SELL" : "BUY";
    const symbol = String(trade.symbol || "UNKNOWN").toUpperCase();
    const entryPrice = cleanNumber(trade.entryPrice);
    const exitPrice = cleanNumber(trade.exitPrice);
    const quantity = cleanNumber(trade.quantity);
    const fees = cleanNumber(trade.fees) || 0;
    const date = normalizeDate(trade.date) || new Date().toISOString().slice(0, 10);

    return {
      ...trade,
      action,
      symbol,
      entryPrice: entryPrice === null ? 0 : entryPrice,
      exitPrice: exitPrice === null ? 0 : exitPrice,
      quantity: quantity === null ? 0 : quantity,
      fees,
      date,
      originalIndex: index,
      matched: false,
    };
  });

  const openEntries = normalized.filter((t) => t.entryPrice > 0 && t.exitPrice === 0);
  const openExits = normalized.filter((t) => t.exitPrice > 0 && t.entryPrice === 0);
  const pairedTrades = [];

  const matchExit = (exit) => {
    const exitTime = new Date(exit.date).getTime();
    const candidates = openEntries
      .filter((entry) => !entry.matched && entry.symbol === exit.symbol && entry.quantity === exit.quantity)
      .sort((a, b) => {
        const diff = new Date(a.date) - new Date(b.date);
        return diff || a.originalIndex - b.originalIndex;
      });

    const match = candidates.find((entry) => new Date(entry.date).getTime() <= exitTime) || candidates[0];
    if (!match) return null;
    match.matched = true;
    exit.matched = true;
    return {
      symbol: exit.symbol,
      action: match.action,
      quantity: exit.quantity,
      entryPrice: match.entryPrice,
      exitPrice: exit.exitPrice,
      fees: match.fees + exit.fees,
      notes: "PDF Import paired round-trip",
      date: match.date,
      entryDate: match.date,
      exitDate: exit.date,
    };
  };

  for (const exit of openExits) {
    const paired = matchExit(exit);
    if (paired) pairedTrades.push(paired);
  }

  const remaining = normalized.filter((trade) => !trade.matched);
  return [...pairedTrades, ...remaining].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB || a.originalIndex - b.originalIndex;
  });
};

const parseUpstox = (text) => {
  const trades = [];
  const lines = text.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match: DD-MMM CONTRACT TYPE ACTION QTY ENTRY EXIT P&L
    const dateMatch = trimmed.match(/^(\d{1,2})-(\w{3})/);
    if (!dateMatch) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 8) continue;

    // Find ACTION (BUY/SELL)
    const actionIdx = parts.findIndex((p) => /^(BUY|SELL)$/i.test(p));
    if (actionIdx < 2) continue;

    // Extract fields
    const datePart = parts[0]; // DD-MMM
    const year = new Date().getFullYear();
    const symbol = parts.slice(1, actionIdx).join("").toUpperCase();
    const action = parts[actionIdx];
    const quantity = cleanNumber(parts[actionIdx + 1]);
    const entry = cleanNumber(parts[actionIdx + 2]);
    const exit = cleanNumber(parts[actionIdx + 3]);

    if (quantity && entry !== null) {
      trades.push(buildTrade({
        date: datePart,
        symbol: symbol || "UNKNOWN",
        action,
        quantity,
        entryPrice: entry,
        exitPrice: exit || 0,
        notes: "Upstox F&O",
      }));
    }
  }

  return trades;
};

const parseDhan = (text) => {
  const trades = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match: DD-MMM SYMBOL TYPE POSITION PREMIUM EXIT P&L
    const dateMatch = trimmed.match(/^(\d{1,2})-(\w{3})/);
    if (!dateMatch) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 7) continue;

    // Find POSITION (BUY/SELL)
    const posIdx = parts.findIndex((p, i) => /^(BUY|SELL)$/i.test(p) && i > 2);
    if (posIdx < 2) continue;

    // Extract fields
    const datePart = parts[0]; // DD-MMM
    const symbol = parts.slice(1, posIdx - 1).join("").toUpperCase();
    const position = parts[posIdx];
    const premium = cleanNumber(parts[posIdx + 1]);
    const exitPrice = cleanNumber(parts[posIdx + 2]);

    if (premium !== null && exitPrice !== null) {
      trades.push(buildTrade({
        date: datePart,
        symbol: symbol || "UNKNOWN",
        action: position,
        quantity: 1,
        entryPrice: premium,
        exitPrice,
        notes: "Dhan Options",
      }));
    }
  }

  return trades;
};

const parseZerodha = (text) => {
  const trades = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 6 && /^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(parts[0])) {
      trades.push(buildTrade({
        date: parts[0],
        symbol: parts[1],
        action: parts[3],
        quantity: parts[4],
        price: parts[5],
      }));
    }
  }

  return trades;
};

const parseBinance = (text) => {
  const trades = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!/^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(line)) continue;

    const tradeLine = lines[i + 1]?.trim() || "";
    const parts = tradeLine.split(/\s+/);
    const actionIndex = parts.findIndex((part) => /^(BUY|SELL)$/i.test(part));
    const symbolIndex = actionIndex - 1;
    const priceIndex = actionIndex + 1;
    const quantityIndex = actionIndex + 2;

    if (actionIndex > 0 && parts.length > quantityIndex) {
      const fee = [...parts.slice(quantityIndex + 1)]
        .reverse()
        .find((part) => cleanNumber(part) !== null);

      trades.push(buildTrade({
        date: line,
        symbol: parts[symbolIndex],
        action: parts[actionIndex],
        price: parts[priceIndex],
        quantity: parts[quantityIndex],
        fees: fee,
      }));
      i += 1;
    }
  }

  return trades;
};

const parseAngelOne = (text) => {
  const trades = [];
  const linePattern = /(\d{1,2}-[A-Za-z]{3}-\d{4}|\d{4}-\d{2}-\d{2})\s+([A-Z][A-Z0-9.-]+)\s+(BUY|SELL|B|S)\s+([\d,.]+)\s+([\d,.]+)/gi;
  for (const match of text.matchAll(linePattern)) {
    trades.push(buildTrade({
      date: match[1],
      symbol: match[2],
      action: match[3].toUpperCase() === "S" ? "sell" : match[3],
      quantity: match[4],
      price: match[5],
    }));
  }
  return trades;
};

const parseGenericNlpText = (text) => {
  const trades = [];
  const sentencePattern = /\b(bought|buy|sold|sell)\s+([A-Z][A-Z0-9.-]{1,15})\s+([\d,.]+)\s+(?:shares?|lots?|units?)?\s*(?:at|@)\s+([\d,.]+)\s+(?:on|date)\s+(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}-[A-Za-z]{3}-\d{4})(?:.*?(?:brokerage|fees?|charges?)\s+([\d,.]+))?/gi;

  for (const match of text.matchAll(sentencePattern)) {
    trades.push(buildTrade({
      action: match[1],
      symbol: match[2],
      quantity: match[3],
      price: match[4],
      date: match[5],
      fees: match[6],
      notes: "Extracted by PDF NLP fallback",
    }));
  }

  return trades;
};

function parseKnownBroker(pdfText, broker) {
  const format = detectFormat(pdfText, broker);
  let trades = [];

  if (format === "zerodha") trades = parseZerodha(pdfText);
  if (format === "angel") trades = parseAngelOne(pdfText);
  if (format === "upstox") trades = parseUpstox(pdfText);
  if (format === "binance") trades = parseBinance(pdfText);
  if (format === "dhan") trades = parseDhan(pdfText);

  return trades.length ? toParsedResponse(trades, format) : null;
}

export const parsePdf = async (req, res) => {
  let filePath = null;
  let pdfText = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const { broker } = req.body;
    filePath = req.file.path;

    // Read PDF as base64
    const pdfBuffer = fs.readFileSync(filePath);

    try {
      const parser = new PDFParse({ data: pdfBuffer });
      try {
        const pdfData = await parser.getText();
        pdfText = pdfData.text;
        const parsedTrades = parseKnownBroker(pdfText, broker);
        if (parsedTrades) {
          return res.status(200).json(parsedTrades);
        }

        const nlpTrades = await getTradeNlpResponse(pdfText);
        if (nlpTrades) {
          return res.status(200).json(nlpTrades);
        }

        const genericTrades = parseGenericNlpText(pdfText);
        if (genericTrades.length) {
          return res.status(200).json(toParsedResponse(genericTrades, "PDF text parser"));
        }
      } finally {
        await parser.destroy();
      }
    } catch (parseErr) {
      console.error("Rule-based parse error:", parseErr.message);
    }

    const base64Pdf = pdfBuffer.toString("base64");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let raw;
    // 1. Try Local LLM first if text was successfully extracted
    if (pdfText) {
      raw = await getLocalLLMResponse(pdfText, broker);
    }

    // 2. Fallback to Gemini if Local failed or was skipped
    if (!raw) {
      raw = await getGeminiResponse(model, base64Pdf, broker);
    }

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

    const processedTrades = pairPdfTrades(trades);
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

    // Get next TradeId
    let lastIdDoc = await TradeDetails.findOne().sort('-TradeId');
    let currentTradeId = lastIdDoc ? lastIdDoc.TradeId + 1 : 1;

    const tradeDocuments = [];
    const tradeContexts = [];

    const parseNumeric = (value) => {
      const cleaned = cleanNumber(value);
      return cleaned === null ? 0 : cleaned;
    };

    for (const t of processedTrades) {
      try {
        const Action = t.action?.toUpperCase() === "SELL" ? "SELL" : "BUY";
        const Symbol = t.symbol || "UNKNOWN";
        const EntryPrice = parseNumeric(t.entryPrice);
        const ExitPrice = parseNumeric(t.exitPrice);
        const Quantity = parseNumeric(t.quantity);
        const Fees = parseNumeric(t.fees) || calculateFeesByExchange("Unknown", EntryPrice, ExitPrice, Quantity);
        const EntryDate = t.date ? new Date(t.date) : new Date();
        const ExitDate = t.date ? new Date(t.date) : new Date();
        const TradeStatus = ExitPrice > 0 ? "Closed" : "Open";
        const TradeName = `${Symbol} ${Action}`;

        const TradeId = currentTradeId++;

        const doc = {
          TradeId, TradeName, Market: "Stocks", Broker: "PDF Import",
          // ✅ Fix
          Setup: "PDF Import", TradeStatus, Action, Symbol,
          EntryDate, ExitDate, EntryPrice, ExitPrice,
          StopLoss: 0, Quantity, AccountId,
          UserId, CreatedBy: UserId,
        };

        tradeDocuments.push(doc);
        tradeContexts.push({ doc, Fees });
      } catch (err) {
        failCount++;
      }
    }

    let insertedIds = new Set();
    if (tradeDocuments.length > 0) {
      try {
        const result = await TradeDetails.insertMany(tradeDocuments, { ordered: false });
        result.forEach(r => insertedIds.add(r.TradeId));
      } catch (err) {
        if (err.insertedDocs) {
          err.insertedDocs.forEach(r => insertedIds.add(r.TradeId));
        }
        failCount += (tradeDocuments.length - insertedIds.size);
      }
    }

    const processTrade = async ({ doc, Fees }) => {
      try {
        if (doc.TradeStatus === "Closed") {
          const Stats = await CalculateTradeStats(doc.Action, doc.EntryPrice, doc.ExitPrice, 0, doc.Quantity, Fees, AccountId);

          const mockReq = {
            body: {
              TradeId: doc.TradeId, UserId: doc.UserId, AccountId: doc.AccountId, Action: doc.Action, Symbol: doc.Symbol,
              EntryPrice: doc.EntryPrice, ExitPrice: doc.ExitPrice, StopLoss: 0, Quantity: doc.Quantity,
              Fees, TradeStatus: doc.TradeStatus, EntryDate: doc.EntryDate, ExitDate: doc.ExitDate,
              Market: "Stocks", Broker: "PDF Import",
              Stats, TradeState: false, IsImport: true,
            }
          };
          const mockRes = { status: () => ({ json: () => { } }) };
          const mockNext = () => { };

          await AddUpdateTradeStats(mockReq, mockRes, mockNext);
          await AddTradeJournal(mockReq, mockRes, mockNext);
        }
        successCount++;
      } catch (tradeErr) {
        console.error("Error processing trade stats/journal:", tradeErr.message);
        failCount++;
      }
    };

    const successfullyInsertedContexts = tradeContexts.filter(ctx => insertedIds.has(ctx.doc.TradeId));

    for (const trade of successfullyInsertedContexts) {
      await processTrade(trade);
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
