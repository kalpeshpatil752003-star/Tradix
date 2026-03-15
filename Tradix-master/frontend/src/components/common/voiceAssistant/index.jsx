import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";





// ─── Route map for navigation commands ───────────────────────────────────────
const ROUTE_MAP = {
  dashboard: "/dashboard",
  home: "/dashboard",
  analytics: "/analytics",
  journal: "/journal",
  calendar: "/pnl-calender",
  "pnl calendar": "/pnl-calender",
  "pnl calender": "/pnl-calender",
  trades: "/add-trade",
  "add trade": "/add-trade",
  "new trade": "/add-trade",
  "import trade": "/import-trades",
  "import trades": "/import-trades",
  settings: "/general-settings",
  "general settings": "/general-settings",
  accounts: "/settings/accounts",
  tags: "/settings/tags-mmanagements",
  "import history": "/settings/import-history",
  tracking: "/tracking",
  track: "/tracking",
  statistics: "/trade-statistics",
  "trade statistics": "/trade-statistics",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VoiceAssistant({ onTradeData }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | listening | processing | success | error
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [ripples, setRipples] = useState([]);

  const recognitionRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const rippleCountRef = useRef(0);
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.accessToken);

  // ─── Init Speech Recognition ───────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback("Voice not supported in this browser. Use Chrome or Edge.");
      setStatus("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setStatus("listening");
      setTranscript("");
      setFeedback("Listening...");
    };

    recognition.onresult = (e) => {
      const current = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(current);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus("processing");
      setFeedback("Processing...");
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      setStatus("error");
      setFeedback(e.error === "not-allowed" ? "Mic access denied." : "Couldn't hear you. Try again.");
      autoReset(3000);
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  // ─── Process transcript after listening ends ───────────────────────────────
  useEffect(() => {
    if (status === "processing" && transcript) {
      handleVoiceCommand(transcript);
    } else if (status === "processing" && !transcript) {
      setFeedback("Nothing heard. Try again.");
      setStatus("idle");
      autoReset(2000);
    }
  }, [status, transcript]);

  const autoReset = (delay = 3000) => {
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setStatus("idle");
      setFeedback("");
      setTranscript("");
      setIsExpanded(false);
    }, delay);
  };

  // ─── Send to Claude API ────────────────────────────────────────────────────
  const handleVoiceCommand = async (text) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/voice/parse`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ✅ send token
      },
      credentials: "include",
      body: JSON.stringify({ transcript: text }),
    });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const { intent, route, tradeData, message } = data;

      if (intent === "navigate" && route && ROUTE_MAP[route]) {
        setStatus("success");
        setFeedback(`Navigating to ${route}...`);
        setTimeout(() => navigate(ROUTE_MAP[route]), 800);
        autoReset(2000);
      } else if (intent === "log_trade" && tradeData) {
        setStatus("success");
        setFeedback("Trade details captured!");
        if (onTradeData) onTradeData(tradeData);
        // ✅ Correct
        setTimeout(() => navigate("/add-trade", { state: { voiceData: tradeData } }), 800); 
        autoReset(2000);
      } else {
        setStatus("error");
        setFeedback(message || "Command not understood. Try again.");
        autoReset(3000);
      }
    } catch (err) {
      setStatus("error");
      setFeedback("Server error. Check your connection.");
      autoReset(3000);
    }
  };

  // ─── Toggle mic ───────────────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus("idle");
      setFeedback("");
      setIsExpanded(false);
      return;
    }

    clearTimeout(feedbackTimerRef.current);
    setIsExpanded(true);
    setIsListening(true);

    // Add ripple
    const id = rippleCountRef.current++;
    setRipples((prev) => [...prev, id]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r !== id)), 2000);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      setStatus("error");
      setFeedback("Mic error. Refresh and try again.");
      setIsListening(false);
      autoReset(3000);
    }
  }, [isListening]);

  // ─── Colors per status ─────────────────────────────────────────────────────
  const statusColors = {
    idle: { bg: "#1a1a2e", border: "#4f46e5", glow: "rgba(79,70,229,0.4)" },
    listening: { bg: "#0f172a", border: "#06b6d4", glow: "rgba(6,182,212,0.5)" },
    processing: { bg: "#0f172a", border: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
    success: { bg: "#052e16", border: "#22c55e", glow: "rgba(34,197,94,0.5)" },
    error: { bg: "#1c0a0a", border: "#ef4444", glow: "rgba(239,68,68,0.4)" },
  };

  const colors = statusColors[status];

  return (
    <>
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

        .va-wrap * { box-sizing: border-box; font-family: 'DM Mono', monospace; }

        .va-btn {
          width: 56px; height: 56px; border-radius: 50%; border: 2px solid;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative; overflow: visible; outline: none;
        }
        .va-btn:hover { transform: scale(1.08); }
        .va-btn:active { transform: scale(0.95); }

        .va-ripple {
          position: absolute; border-radius: 50%; border: 2px solid currentColor;
          width: 56px; height: 56px; top: 0; left: 0;
          animation: va-ripple-anim 2s ease-out forwards;
          pointer-events: none;
        }
        @keyframes va-ripple-anim {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        .va-pulse { animation: va-pulse-anim 1.5s ease-in-out infinite; }
        @keyframes va-pulse-anim {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .va-panel {
          position: absolute; bottom: 70px; right: 0;
          background: #0d0d1a; border: 1px solid;
          border-radius: 16px; padding: 14px 18px;
          min-width: 240px; max-width: 300px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom right;
        }
        .va-panel-enter { animation: va-panel-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes va-panel-in {
          from { opacity: 0; transform: scale(0.8) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .va-transcript {
          font-size: 11px; color: #94a3b8; margin-top: 6px;
          line-height: 1.5; word-break: break-word;
          font-style: italic;
        }
        .va-feedback {
          font-size: 12px; font-weight: 500; letter-spacing: 0.02em;
        }
        .va-label {
          font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #475569; margin-bottom: 4px;
          font-family: 'Syne', sans-serif;
        }
        .va-wave {
          display: flex; align-items: center; gap: 3px; height: 20px; margin-top: 8px;
        }
        .va-bar {
          width: 3px; border-radius: 2px; background: #06b6d4;
          animation: va-bar-bounce 0.8s ease-in-out infinite;
        }
        .va-bar:nth-child(1) { animation-delay: 0s;    height: 8px; }
        .va-bar:nth-child(2) { animation-delay: 0.1s;  height: 16px; }
        .va-bar:nth-child(3) { animation-delay: 0.2s;  height: 12px; }
        .va-bar:nth-child(4) { animation-delay: 0.3s;  height: 20px; }
        .va-bar:nth-child(5) { animation-delay: 0.15s; height: 10px; }
        @keyframes va-bar-bounce {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
      `}</style>

      {/* ── Container ── */}
      <div
        className="va-wrap"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "flex-end",
        }}
      >
        {/* ── Feedback Panel ── */}
        {isExpanded && (
          <div
            className="va-panel va-panel-enter"
            style={{ borderColor: colors.border, boxShadow: `0 0 24px ${colors.glow}` }}
          >
            <div className="va-label">Star Tradix Voice</div>

            <div className="va-feedback" style={{ color: colors.border }}>
              {feedback || "Ready"}
            </div>

            {status === "listening" && (
              <div className="va-wave">
                {[...Array(5)].map((_, i) => <div key={i} className="va-bar" />)}
              </div>
            )}

            {transcript && (
              <div className="va-transcript">"{transcript}"</div>
            )}

            {status === "idle" && !transcript && (
              <div style={{ marginTop: 8, fontSize: 10, color: "#475569", lineHeight: 1.6 }}>
                Try: <span style={{ color: "#64748b" }}>"go to journal"</span><br />
                or: <span style={{ color: "#64748b" }}>"bought 50 AAPL at 180"</span>
              </div>
            )}
          </div>
        )}

        {/* ── Mic Button ── */}
        <button
          className={`va-btn ${isListening ? "va-pulse" : ""}`}
          onClick={toggleListening}
          title="Voice Assistant"
          style={{
            background: colors.bg,
            borderColor: colors.border,
            boxShadow: `0 0 20px ${colors.glow}, 0 4px 16px rgba(0,0,0,0.4)`,
            color: colors.border,
          }}
        >
          {/* Ripples */}
          {ripples.map((id) => (
            <span key={id} className="va-ripple" style={{ color: colors.border }} />
          ))}

          {/* Icon */}
          {status === "processing" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </path>
            </svg>
          ) : status === "success" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
