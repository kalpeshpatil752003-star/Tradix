import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedAccount, setSelectedCurrencySymbol } from "state/api/accounts/accountSlice";

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
  "pdf import": "/import-trades?tab=pdf",
  "import pdf": "/import-trades?tab=pdf",
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

// ─── How long of silence (ms) before we auto-stop listening ──────────────────
const SILENCE_TIMEOUT_MS = 2500; // 2.5 seconds of silence → auto-submit

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
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const rippleCountRef = useRef(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.accessToken);
  const accountInfo = useSelector((state) => state.account?.accountInfo || []);

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
    recognition.continuous = true;         // ✅ CHANGED: keep mic open
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("listening");
      setTranscript("");
      finalTranscriptRef.current = "";
      setFeedback("Listening… say your command, then pause or press Done.");
    };

    recognition.onresult = (e) => {
      let interimText = "";
      let newFinal = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }

      // ✅ Accumulate final words; show interim in real-time
      if (newFinal) {
        finalTranscriptRef.current += newFinal;
      }
      const displayText = (finalTranscriptRef.current + interimText).trim();
      setTranscript(displayText);

      // ✅ Reset silence timer every time speech is detected
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        // User stopped talking for SILENCE_TIMEOUT_MS → auto-submit
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, SILENCE_TIMEOUT_MS);
    };

    recognition.onend = () => {
      clearTimeout(silenceTimerRef.current);
      setIsListening(false);
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        setStatus("processing");
        setFeedback("Processing…");
        setTranscript(finalText);
      } else {
        setFeedback("Nothing heard. Try again.");
        setStatus("idle");
        autoReset(2000);
      }
    };

    recognition.onerror = (e) => {
      clearTimeout(silenceTimerRef.current);
      // ✅ "no-speech" is not fatal when continuous=true, ignore it
      if (e.error === "no-speech") return;
      setIsListening(false);
      setStatus("error");
      setFeedback(
        e.error === "not-allowed"
          ? "Mic access denied."
          : "Couldn't hear you. Try again."
      );
      autoReset(3000);
    };

    recognitionRef.current = recognition;
    return () => {
      clearTimeout(silenceTimerRef.current);
      recognition.abort();
    };
  }, []);

  // ─── Process transcript after listening ends ───────────────────────────────
  

  const autoReset = useCallback((delay = 3000) => {
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setStatus("idle");
      setFeedback("");
      setTranscript("");
      setIsExpanded(false);
    }, delay);
  }, []);

  // ─── Match account name from voice to accountInfo list ───────────────────
  const matchAccount = useCallback((voiceAccountName) => {
    if (!voiceAccountName || !accountInfo.length) return null;
    const lower = voiceAccountName.toLowerCase().trim();
    // exact match first
    let match = accountInfo.find(a => a.AccountName.toLowerCase() === lower);
    // then partial match
    if (!match) match = accountInfo.find(a => a.AccountName.toLowerCase().includes(lower) || lower.includes(a.AccountName.toLowerCase()));
    return match || null;
  }, [accountInfo]);

  // ─── Dispatch account selection ───────────────────────────────────────────
  const selectAccount = useCallback((accountName) => {
    const account = matchAccount(accountName);
    if (account) {
      const currencySymbol = account.Currency?.toString()?.charAt(0);
      dispatch(setSelectedAccount(account));
      dispatch(setSelectedCurrencySymbol(currencySymbol));
      return account.AccountName;
    }
    return null;
  }, [matchAccount, dispatch]);

  // ─── Send to backend API ───────────────────────────────────────────────────
  const handleVoiceCommand = useCallback(async (text) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/voice/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ transcript: text }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const { intent, route, tradeData, account, message } = data;

      if (intent === "navigate" && route && ROUTE_MAP[route]) {
        setStatus("success");
        setFeedback(`Navigating to ${route}…`);
        setTimeout(() => navigate(ROUTE_MAP[route]), 800);
        autoReset(2000);

      } else if (intent === "select_account" && account) {
        // ✅ Voice selected an account (e.g. "use kalpesh account")
        const matched = selectAccount(account);
        if (matched) {
          setStatus("success");
          setFeedback(`Account set to ${matched}!`);
        } else {
          setStatus("error");
          setFeedback(`Account "${account}" not found.`);
        }
        autoReset(2500);

      } else if (intent === "log_trade" && tradeData) {
        // ✅ Auto-select account if mentioned in trade command
        if (tradeData.account) {
          selectAccount(tradeData.account);
        }
        setStatus("success");
        setFeedback("Trade details captured!");
        if (onTradeData) onTradeData(tradeData);
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
  }, [token, navigate, onTradeData, selectAccount, autoReset]);


  useEffect(() => {
    if (status === "processing" && transcript) {
      handleVoiceCommand(transcript);
    } else if (status === "processing" && !transcript) {
      setFeedback("Nothing heard. Try again.");
      setStatus("idle");
      autoReset(2000);
    }
  }, [status, transcript, handleVoiceCommand, autoReset]);


  // ─── Toggle mic ───────────────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (isListening) {
      // ✅ "Done" button — manually stop and submit whatever was captured
      clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      setIsListening(false);
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
    success: { bg: "#0f172a", border: "#22c55e", glow: "rgba(34,197,94,0.4)" },
    error: { bg: "#0f172a", border: "#ef4444", glow: "rgba(239,68,68,0.4)" },
  };

  const colors = statusColors[status] || statusColors.idle;

  return (
    <>
      <style>{`
        .va-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }
        .va-card {
          background: #0f172a;
          border-radius: 16px;
          padding: 14px 18px;
          min-width: 260px;
          max-width: 320px;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.3s ease;
        }
        .va-label {
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .va-feedback {
          font-size: 13px;
          color: #e2e8f0;
          min-height: 18px;
        }
        .va-transcript {
          font-size: 13px;
          color: #7dd3fc;
          margin-top: 6px;
          font-style: italic;
          word-break: break-word;
        }
        .va-hint {
          font-size: 11px;
          color: #475569;
          margin-top: 6px;
        }
        .va-done-btn {
          margin-top: 10px;
          width: 100%;
          padding: 7px 0;
          border-radius: 8px;
          background: #06b6d4;
          color: #0f172a;
          font-weight: 700;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .va-done-btn:hover { background: #22d3ee; }
        .va-mic-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: visible;
        }
        .va-ripple {
          position: absolute;
          border-radius: 50%;
          animation: va-ripple-anim 2s linear infinite;
          pointer-events: none;
        }
        @keyframes va-ripple-anim {
          0% { width: 56px; height: 56px; opacity: 0.5; top: -0px; left: -0px; }
          100% { width: 100px; height: 100px; opacity: 0; top: -22px; left: -22px; }
        }
      `}</style>

      <div className="va-wrapper">
        {isExpanded && (
          <div className="va-card">
            <div className="va-label">Star Tradix Voice</div>
            <div className="va-feedback">{feedback}</div>

            {transcript && (
              <div className="va-transcript">"{transcript}"</div>
            )}

            {status === "idle" && !transcript && (
              <div className="va-hint">
                Try: "buy 50 RELIANCE at 2400 entry today" or "use kalpesh account"
              </div>
            )}

            {/* ✅ Show Done button while actively listening */}
            {status === "listening" && (
              <button className="va-done-btn" onClick={toggleListening}>
                ✓ Done
              </button>
            )}
          </div>
        )}

        <button
          className="va-mic-btn"
          onClick={toggleListening}
          title="Voice Assistant"
          style={{
            background: colors.bg,
            borderColor: colors.border,
            boxShadow: `0 0 16px ${colors.glow}`,
          }}
        >
          {ripples.map((id) => (
            <span
              key={id}
              className="va-ripple"
              style={{ border: `2px solid ${colors.border}` }}
            />
          ))}
          {isListening ? (
            // Stop icon
            <svg width="22" height="22" viewBox="0 0 24 24" fill={colors.border}>
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Mic icon
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}