import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AccountDropdown } from "components/common/dropdown/accountDropdown";

const STORAGE_KEY = "tradix_pdf_preview";

// Standardized broker list
const BROKERS = [
  "Zerodha",
  "Upstox",
  "Binance",
  "Angel One",
  "Groww",
  "Dhan",
  "Other",
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const savePreview = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
};

const loadPreview = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

const clearPreview = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PdfImport() {
  // ── Restore persisted state on mount ──────────────────────────────────────
  const persisted = loadPreview();

  const [broker, setBroker] = useState(persisted?.broker || "");
  const [account, setAccount] = useState(persisted?.account || "");
  const [file, setFile] = useState(null); // File object can't be persisted
  const [description, setDescription] = useState(persisted?.description || "");
  const [status, setStatus] = useState(persisted?.trades?.length ? "success" : "idle");
  const [trades, setTrades] = useState(persisted?.trades || []);
  const [summary, setSummary] = useState(persisted?.summary || "");
  const [errorMsg, setErrorMsg] = useState("");

  const fileRef = useRef();
  const token = useSelector((state) => state.auth?.accessToken);
  const navigate = useNavigate();

  // ── Persist whenever trades/summary/broker/account/description change ──────
  useEffect(() => {
    if (trades.length > 0) {
      savePreview({ trades, summary, broker, account, description });
    }
  }, [trades, summary, broker, account, description]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported.");
      return;
    }
    setErrorMsg("");
    setFile(f);
    setTrades([]);
    setSummary("");
    setStatus("idle");
    clearPreview(); // clear old preview when a new file is chosen
  };

  const handleReset = () => {
    setBroker("");
    setAccount("");
    setFile(null);
    setDescription("");
    setTrades([]);
    setSummary("");
    setStatus("idle");
    setErrorMsg("");
    clearPreview(); // ✅ wipe localStorage on reset
  };

  const handleSubmit = async () => {
    if (!file) return setErrorMsg("Please select a PDF file.");
    if (!broker) return setErrorMsg("Please select a broker.");
    if (!account) return setErrorMsg("Please select an account.");

    setStatus("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("broker", broker);
      formData.append("accountId", account);
      formData.append("description", description);

      setStatus("parsing");

      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/voice/parse-pdf`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      if (data.trades && data.trades.length > 0) {
        setTrades(data.trades);
        setSummary(data.summary || "");
        setStatus("success");
        // persisted via useEffect above
      } else {
        setErrorMsg("No trades found in this PDF. Make sure it's a trade statement.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg("Failed to process PDF. Check your connection.");
      setStatus("error");
    }
  };

  const handleImportAll = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/voice/import-pdf-trades`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ trades, accountId: account }),
        }
      );

      if (!res.ok) throw new Error();

      clearPreview(); // ✅ wipe localStorage after successful import
      navigate("/dashboard");
    } catch {
      setErrorMsg("Failed to import trades.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 border-b pb-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-white">
          Import Your Trades
        </h2>
        <p className="text-sm text-gray-400">
          Upload your broker trade statement (PDF)
        </p>
      </div>

      

      {/* Form Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2 text-sm font-medium dark:text-white">
            Select Broker
          </label>
          <select
            className="w-full p-2.5 rounded-lg border border-gray-300 
             text-gray-900 dark:text-white
             bg-gray-50 dark:bg-gray-700 
             dark:border-gray-600"
            value={broker}
            onChange={(e) => setBroker(e.target.value)}
          >
            <option value="">Select Broker</option>
            {BROKERS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium dark:text-white">
            Select Account
          </label>
          <AccountDropdown
            label=""
            htmlName="account"
            onChange={(e) => setAccount(e.target.value)}
            value={account}
          />
        </div>
      </div>

      {/* File Upload — only shown when no active preview */}
      {status !== "success" && (
        <>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium dark:text-white">
              Upload Your PDF File
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFile(e.target.files[0])}
              className="block w-full text-sm 
                 text-gray-900 dark:text-white
                 border border-gray-300 
                 rounded-lg cursor-pointer 
                 bg-gray-50 dark:bg-gray-700 
                 dark:border-gray-600"
            />
            {file && (
              <p className="text-xs text-gray-400 mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium dark:text-white">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Add Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Buttons */}
      {status !== "success" && (
        <div className="flex gap-3 mt-4">
          <button
            className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="px-5 py-2 bg-white text-black rounded-lg hover:bg-gray-100
             dark:bg-white dark:text-black disabled:opacity-60"
            onClick={handleSubmit}
            disabled={status === "uploading" || status === "parsing"}
          >
            {status === "parsing"
              ? "Analysing..."
              : status === "uploading"
              ? "Reading PDF..."
              : "Extract Trades"}
          </button>
        </div>
      )}

      {/* Results */}
      {status === "success" && trades.length > 0 && (
        <div className="mt-6">
          {summary && (
            <div className="mb-4 p-4 rounded-lg" style={{background: "#052e16", border: "1px solid #166534"}}>
              <p className="font-semibold" style={{color: "#4ade80"}}>Summary</p>
              <p className="text-sm" style={{color: "#86efac"}}>{summary}</p>
            </div>
          )}

          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-white">
              {trades.length} Trades Found
            </h3>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border border-gray-500 rounded-lg text-white dark:text-white hover:bg-gray-700"
                onClick={handleReset}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary-100 text-white rounded-lg"
                onClick={handleImportAll}
              >
                Import All Trades
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-2 text-left dark:text-gray-300">#</th>
                  <th className="p-2 text-left dark:text-gray-300">Symbol</th>
                  <th className="p-2 text-left dark:text-gray-300">Action</th>
                  <th className="p-2 text-left dark:text-gray-300">Qty</th>
                  <th className="p-2 text-left dark:text-gray-300">Entry</th>
                  <th className="p-2 text-left dark:text-gray-300">Exit</th>
                  <th className="p-2 text-left dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} className="border-t dark:border-gray-700 dark:bg-gray-800 hover:dark:bg-gray-700">
                    <td className="p-2 dark:text-gray-300">{i + 1}</td>
                    <td className="p-2 font-medium dark:text-white">{t.symbol || "-"}</td>
                    <td className={`p-2 font-semibold ${t.action?.toUpperCase() === "SELL" ? "text-red-500" : "text-green-500"}`}>
                      {t.action?.toUpperCase() || "BUY"}
                    </td>
                    <td className="p-2 dark:text-gray-300">{t.quantity || "-"}</td>
                    <td className="p-2 dark:text-gray-300">{t.entryPrice || "-"}</td>
                    <td className="p-2 dark:text-gray-300">{t.exitPrice || "-"}</td>
                    <td className="p-2 text-gray-400 text-xs">{t.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}