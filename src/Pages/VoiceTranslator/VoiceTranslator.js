import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VoiceTranslator.css";

const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "▦",  path: "/dashboard" },
  { id: "translator", label: "Translator",       icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer",       icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards",       icon: "🃏", path: "/tools/flashcards" },
  { id: "voice",      label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts",        label: "Text-to-Speech",   icon: "🔊", path: "/tools/tts" },
];

const languages = [
  { label: "English",    code: "en" },
  { label: "Spanish",    code: "es" },
  { label: "French",     code: "fr" },
  { label: "German",     code: "de" },
  { label: "Italian",    code: "it" },
  { label: "Portuguese", code: "pt" },
  { label: "Japanese",   code: "ja" },
  { label: "Chinese",    code: "zh" },
  { label: "Korean",     code: "ko" },
  { label: "Arabic",     code: "ar" },
  { label: "Hindi",      code: "hi" },
  { label: "Russian",    code: "ru" },
];

const historyData = [
  { id: 1, from: "English", to: "Spanish", spoken: "Good morning, how are you?",    translated: "Buenos días, ¿cómo estás?", time: "5 min ago" },
  { id: 2, from: "English", to: "French",  spoken: "Where is the nearest hospital?", translated: "Où est l'hôpital le plus proche?", time: "1 hr ago" },
];

// ─── Translate via MyMemory ───────────────────────────────
const translateText = async (text, fromCode, toCode) => {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`
  );
  if (!res.ok) throw new Error("Translation failed");
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error("Translation error");
  return data.responseData.translatedText;
};

// ─── VoiceTranslator Component ────────────────────────────
const VoiceTranslator = () => {
  const navigate   = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fromLang, setFromLang] = useState(languages[0]);
  const [toLang,   setToLang]   = useState(languages[1]);
  const [recording,   setRecording]   = useState(false);
  const [spokenText,  setSpokenText]  = useState("");
  const [translated,  setTranslated]  = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [history,     setHistory]     = useState(historyData);
  const [supported,   setSupported]   = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous      = false;
    recognition.interimResults  = true;
    recognition.lang            = fromLang.code;

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join("");
      setSpokenText(transcript);
    };

    recognition.onend = () => setRecording(false);
    recognition.onerror = (e) => {
      setError("Microphone error: " + e.error);
      setRecording(false);
    };

    recognitionRef.current = recognition;
  }, [fromLang]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      setSpokenText("");
      setTranslated("");
      setError("");
      recognitionRef.current.lang = fromLang.code;
      recognitionRef.current.start();
      setRecording(true);
    }
  };

  const handleTranslate = async () => {
    if (!spokenText.trim()) return;
    setLoading(true);
    setTranslated("");
    setError("");
    try {
      const result = await translateText(spokenText, fromLang.code, toLang.code);
      setTranslated(result);
      setHistory(prev => [{
        id: Date.now(),
        from: fromLang.label,
        to: toLang.label,
        spoken: spokenText,
        translated: result,
        time: "Just now",
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!translated) return;
    const utterance = new SpeechSynthesisUtterance(translated);
    utterance.lang = toLang.code;
    window.speechSynthesis.speak(utterance);
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setSpokenText(translated);
    setTranslated(spokenText);
  };

  const handleClear = () => {
    setSpokenText("");
    setTranslated("");
    setError("");
  };

  return (
    <div className="dash-wrapper">

      {/* ── Sidebar ── */}
      <aside className={`dash-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">⚡</span>
          {sidebarOpen && <span className="sidebar-brand-name">AI Toolkit Hub</span>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${item.id === "voice" ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">

        <header className="dash-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Voice Translator</h1>
            <p className="topbar-sub">Speak and get <span>instant translations</span></p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="topbar-avatar">B</div>
          </div>
        </header>

        {/* ── Voice Card ── */}
        <section className="voice-card">

          {/* Language Bar */}
          <div className="lang-bar">
            <select
              className="lang-select"
              value={fromLang.label}
              onChange={e => setFromLang(languages.find(l => l.label === e.target.value))}
            >
              {languages.map(l => <option key={l.code}>{l.label}</option>)}
            </select>
            <button className="swap-btn" onClick={swapLanguages} title="Swap">⇄</button>
            <select
              className="lang-select"
              value={toLang.label}
              onChange={e => setToLang(languages.find(l => l.label === e.target.value))}
            >
              {languages.map(l => <option key={l.code}>{l.label}</option>)}
            </select>
          </div>

          {/* Mic Area */}
          <div className="voice-body">

            {!supported ? (
              <div className="voice-unsupported">
                ⚠ Speech recognition is not supported in your browser. Please use Chrome or Edge.
              </div>
            ) : (
              <>
                {/* Mic Button */}
                <div className="mic-area">
                  <button
                    className={`mic-btn ${recording ? "recording" : ""}`}
                    onClick={toggleRecording}
                    title={recording ? "Stop recording" : "Start recording"}
                  >
                    <span className="mic-icon">🎙️</span>
                    {recording && (
                      <>
                        <span className="mic-ring mic-ring-1" />
                        <span className="mic-ring mic-ring-2" />
                        <span className="mic-ring mic-ring-3" />
                      </>
                    )}
                  </button>
                  <p className="mic-hint">
                    {recording ? "Listening… click to stop" : "Click to start speaking"}
                  </p>
                </div>

                {/* Text Panels */}
                <div className="text-panels">

                  {/* Spoken */}
                  <div className="text-panel">
                    <div className="panel-header">
                      <span className="panel-lang">{fromLang.label}</span>
                      <button className="panel-btn" onClick={handleClear}>✕ Clear</button>
                    </div>
                    <div className="trans-output voice-spoken">
                      {spokenText
                        ? spokenText
                        : <span className="placeholder-text">Your speech will appear here…</span>
                      }
                      {recording && <span className="voice-cursor">|</span>}
                    </div>
                    <div className="panel-footer">
                      <span className="char-count">
                        {spokenText.trim() ? spokenText.trim().split(/\s+/).length : 0} words
                      </span>
                      <button
                        className="translate-btn"
                        onClick={handleTranslate}
                        disabled={loading || !spokenText.trim()}
                      >
                        {loading ? <><span className="spinner" /> Translating…</> : "Translate →"}
                      </button>
                    </div>
                  </div>

                  {/* Translated */}
                  <div className="text-panel output-panel">
                    <div className="panel-header">
                      <span className="panel-lang">{toLang.label}</span>
                      <button
                        className="panel-btn"
                        onClick={handleSpeak}
                        disabled={!translated}
                        title="Play audio"
                      >
                        🔊 Play
                      </button>
                    </div>
                    <div className="trans-output">
                      {loading
                        ? <div className="loading-dots"><span /><span /><span /></div>
                        : error
                        ? <span className="voice-error">⚠ {error}</span>
                        : translated
                        ? translated
                        : <span className="placeholder-text">Translation will appear here…</span>
                      }
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </section>

        {/* ── History ── */}
        <section className="history-section">
          <h2 className="section-title">Voice History</h2>
          <div className="history-list">
            {history.map(item => (
              <div
                className="history-item"
                key={item.id}
                onClick={() => {
                  setSpokenText(item.spoken);
                  setTranslated(item.translated);
                  setFromLang(languages.find(l => l.label === item.from) || languages[0]);
                  setToLang(languages.find(l => l.label === item.to) || languages[1]);
                }}
              >
                <div className="history-langs">
                  <span className="hlang">{item.from}</span>
                  <span className="harrow">→</span>
                  <span className="hlang">{item.to}</span>
                </div>
                <div className="history-texts">
                  <p className="htext-in">{item.spoken}</p>
                  <p className="htext-out">{item.translated}</p>
                </div>
                <span className="htime">{item.time}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default VoiceTranslator;