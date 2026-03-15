import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AccountDropdown } from 'components/common/dropdown/accountDropdown';

// ── Broker configs ─────────────────────────────────────────────────────────
const BROKERS = ["Zerodha", "Upstox", "Binance", "Angel One", "Groww", "Dhan", "Other"];

const STATUS = {
  idle: { color: "#64748b", label: "" },
  uploading: { color: "#f59e0b", label: "Reading PDF..." },
  parsing: { color: "#6366f1", label: "AI Analyzing..." },
  success: { color: "#22c55e", label: "Trades Extracted!" },
  error: { color: "#ef4444", label: "Failed. Try again." },
};

export default function PdfImport() {
  const [broker, setBroker] = useState("");
  const [account, setAccount] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [trades, setTrades] = useState([]);
  const [summary, setSummary] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef();
  const token = useSelector((state) => state.auth?.accessToken);
  const navigate = useNavigate();

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
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
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

      setStatus("parsing");

      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/voice/parse-pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      if (data.trades && data.trades.length > 0) {
        setTrades(data.trades);
        setSummary(data.summary || "");
        setStatus("success");
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
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/voice/import-pdf-trades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ trades, accountId: account }),
      });
      if (!res.ok) throw new Error();
      navigate("/dashboard");
    } catch {
      setErrorMsg("Failed to import trades.");
    }
  };

  const st = STATUS[status];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
        .pdf-wrap * { box-sizing: border-box; }
        .pdf-wrap { font-family: 'DM Sans', sans-serif; }
        .pdf-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px 32px; }
        .dark .pdf-card { background: #1f2937; }
        .pdf-drop {
          border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px 20px;
          text-align: center; cursor: pointer; transition: all 0.2s;
          background: #f8fafc;
        }
        .dark .pdf-drop { background: #111827; border-color: #374151; }
        .pdf-drop.dragover { border-color: #6366f1; background: #eef2ff; }
        .dark .pdf-drop.dragover { background: #1e1b4b; }
        .pdf-drop:hover { border-color: #6366f1; }
        .pdf-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #eef2ff; color: #4f46e5; border-radius: 8px;
          padding: 6px 12px; font-size: 13px; font-weight: 500;
        }
        .dark .pdf-badge { background: #1e1b4b; color: #818cf8; }
        .pdf-status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          display: inline-block; margin-right: 6px;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .pdf-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .pdf-table th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; }
        .dark .pdf-table th { background: #111827; color: #94a3b8; }
        .pdf-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        .dark .pdf-table td { border-color: #1f2937; color: #e2e8f0; }
        .pdf-table tr:hover td { background: #f8fafc; }
        .dark .pdf-table tr:hover td { background: #111827; }
        .tag-buy { background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .tag-sell { background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .pdf-btn {
          padding: 10px 24px; border-radius: 8px; font-size: 14px;
          font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .pdf-btn-primary { background: #4f46e5; color: white; }
        .pdf-btn-primary:hover { background: #4338ca; transform: translateY(-1px); }
        .pdf-btn-primary:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }
        .pdf-btn-outline { background: transparent; color: #4f46e5; border: 1.5px solid #4f46e5; }
        .pdf-btn-outline:hover { background: #eef2ff; }
        .pdf-select {
          width: 100%; padding: 10px 14px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; font-size: 14px; background: white;
          color: #1e293b; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s; outline: none;
        }
        .dark .pdf-select { background: #111827; border-color: #374151; color: #e2e8f0; }
        .pdf-select:focus { border-color: #6366f1; }
        .pdf-label { font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; display: block; }
        .dark .pdf-label { color: #9ca3af; }
        .pdf-summary {
          background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
          padding: 16px 20px; margin-bottom: 20px;
        }
        .dark .pdf-summary { background: #052e16; border-color: #166534; }
        .pdf-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 16px; color: #dc2626; font-size: 13px; }
        .dark .pdf-error { background: #1c0a0a; border-color: #991b1b; }
      `}</style>

      <div className="pdf-wrap">
        <div className="pdf-card dark:bg-main-dark">
          {/* Header */}
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }} className="dark:border-gray-600">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* PDF Icon */}
              <div style={{ width: 36, height: 36, background: "#eef2ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                  <line x1="9" y1="11" x2="15" y2="11"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0, fontFamily: "Syne, sans-serif" }} className="dark:text-white">
                  AI PDF Trade Import
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  Upload your broker statement — AI extracts all trades automatically
                </p>
              </div>
            </div>

            {/* Supported brokers */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              {BROKERS.map(b => (
                <span key={b} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f1f5f9", color: "#475569", fontWeight: 500 }}
                  className="dark:bg-gray-700 dark:text-gray-300">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label className="pdf-label dark:text-gray-400">Select Broker</label>
              <select className="pdf-select" value={broker} onChange={e => setBroker(e.target.value)}>
                <option value="">Select Broker</option>
                {BROKERS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="pdf-label dark:text-gray-400">Select Account</label>
              <AccountDropdown
                label=""
                htmlName="account"
                onChange={e => setAccount(e.target.value)}
                value={account}
              />
            </div>
          </div>

          {/* Drop Zone */}
          <div
            className={`pdf-drop${dragOver ? " dragover" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

            {file ? (
              <div>
                <div className="pdf-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {file.name}
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                  {(file.size / 1024).toFixed(1)} KB — click to change
                </p>
              </div>
            ) : (
              <div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#475569", margin: "0 0 4px" }} className="dark:text-gray-300">
                  Drop your PDF here or click to browse
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                  Supports broker trade statements (PDF only)
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="pdf-error" style={{ marginTop: 12 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Status */}
          {status !== "idle" && status !== "error" && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 12, fontSize: 13, color: st.color, fontWeight: 500 }}>
              <span className="pdf-status-dot" style={{ background: st.color }} />
              {st.label}
            </div>
          )}

          {/* Submit */}
          {status !== "success" && (
            <div style={{ marginTop: 20 }}>
              <button
                className="pdf-btn pdf-btn-primary"
                onClick={handleSubmit}
                disabled={status === "uploading" || status === "parsing"}
              >
                {status === "parsing" ? "Analyzing..." : status === "uploading" ? "Reading PDF..." : "Extract Trades"}
              </button>
            </div>
          )}

          {/* Results */}
          {status === "success" && trades.length > 0 && (
            <div style={{ marginTop: 24 }}>
              {/* Summary */}
              {summary && (
                <div className="pdf-summary">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#166534", margin: "0 0 4px", fontFamily: "Syne, sans-serif" }} className="dark:text-green-400">
                    ✅Summary
                  </p>
                  <p style={{ fontSize: 13, color: "#15803d", margin: 0 }} className="dark:text-green-300">
                    {summary}
                  </p>
                </div>
              )}

              {/* Trades table */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0, fontFamily: "Syne, sans-serif" }} className="dark:text-white">
                  {trades.length} Trades Found
                </h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="pdf-btn pdf-btn-outline" onClick={() => { setStatus("idle"); setFile(null); setTrades([]); }}>
                    Cancel
                  </button>
                  <button className="pdf-btn pdf-btn-primary" onClick={handleImportAll}>
                    Import All Trades
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }} className="dark:border-gray-700">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Symbol</th>
                      <th>Action</th>
                      <th>Qty</th>
                      <th>Entry Price</th>
                      <th>Exit Price</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t, i) => (
                      <tr key={i}>
                        <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{t.symbol || "-"}</td>
                        <td>
                          <span className={t.action?.toUpperCase() === "SELL" ? "tag-sell" : "tag-buy"}>
                            {t.action?.toUpperCase() || "BUY"}
                          </span>
                        </td>
                        <td>{t.quantity || "-"}</td>
                        <td>{t.entryPrice || "-"}</td>
                        <td>{t.exitPrice || "-"}</td>
                        <td style={{ color: "#94a3b8", fontSize: 12 }}>{t.date || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
