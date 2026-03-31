import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./TTS.css";

const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "▦",  path: "/dashboard" },
  { id: "translator", label: "Translator",       icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer",       icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards",       icon: "🃏", path: "/tools/flashcards" },
  { id: "voice",      label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts",        label: "Text-to-Speech",   icon: "🔊", path: "/tools/tts" },
];

const VOICES_BY_LANG = [
  { label: "English (US)",  lang: "en-US" },
  { label: "English (UK)",  lang: "en-GB" },
  { label: "Spanish",       lang: "es-ES" },
  { label: "French",        lang: "fr-FR" },
  { label: "German",        lang: "de-DE" },
  { label: "Italian",       lang: "it-IT" },
  { label: "Portuguese",    lang: "pt-BR" },
  { label: "Japanese",      lang: "ja-JP" },
  { label: "Chinese",       lang: "zh-CN" },
  { label: "Korean",        lang: "ko-KR" },
  { label: "Arabic",        lang: "ar-SA" },
  { label: "Hindi",         lang: "hi-IN" },
];

const historyData = [
  { id: 1, text: "Good morning! Today is going to be a great day.", lang: "en-US", time: "10 min ago" },
  { id: 2, text: "Bonjour tout le monde, comment allez-vous?",       lang: "fr-FR", time: "1 hr ago" },
];

const TTS = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText]     = useState("");
  const [selectedLang, setSelectedLang] = useState(VOICES_BY_LANG[0]);
  const [rate,   setRate]   = useState(1);
  const [pitch,  setPitch]  = useState(1);
  const [playing, setPlaying] = useState(false);
  const [paused,  setPaused]  = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [history,   setHistory]   = useState(historyData);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!window.speechSynthesis) setSupported(false);
    return () => window.speechSynthesis?.cancel();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleInput = (e) => {
    setInputText(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handlePlay = () => {
    if (!inputText.trim() || !supported) return;

    if (paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      setPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(inputText);
    utterance.lang  = selectedLang.lang;
    utterance.rate  = rate;
    utterance.pitch = pitch;

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(selectedLang.lang.split("-")[0]));
    if (match) utterance.voice = match;

    utterance.onstart = () => { setPlaying(true); setPaused(false); };
    utterance.onend   = () => { setPlaying(false); setPaused(false); };
    utterance.onerror = () => { setPlaying(false); setPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    setHistory(prev => [{
      id: Date.now(),
      text: inputText.slice(0, 80) + (inputText.length > 80 ? "…" : ""),
      lang: selectedLang.lang,
      time: "Just now",
    }, ...prev.slice(0, 9)]);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setPlaying(false);
    setPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  const handleClear = () => {
    handleStop();
    setInputText("");
    setCharCount(0);
  };

  const langLabel = (langCode) =>
    VOICES_BY_LANG.find(v => v.lang === langCode)?.label || langCode;

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
              className={`nav-item ${item.id === "tts" ? "active" : ""}`}
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
            <h1 className="topbar-title">Text-to-Speech</h1>
            <p className="topbar-sub">Convert any text to <span>natural audio</span></p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="topbar-avatar">B</div>
          </div>
        </header>

        {!supported ? (
          <div className="tts-unsupported">
            ⚠ Text-to-Speech is not supported in your browser. Please use Chrome or Edge.
          </div>
        ) : (
          <>
            {/* ── TTS Card ── */}
            <section className="tts-card">

              {/* Options Bar */}
              <div className="options-bar">

                {/* Language */}
                <div className="option-group">
                  <span className="option-label">Language</span>
                  <select
                    className="tts-select"
                    value={selectedLang.lang}
                    onChange={e => setSelectedLang(VOICES_BY_LANG.find(v => v.lang === e.target.value))}
                  >
                    {VOICES_BY_LANG.map(v => (
                      <option key={v.lang} value={v.lang}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="option-divider" />

                {/* Speed */}
                <div className="option-group">
                  <span className="option-label">Speed</span>
                  <div className="tts-slider-wrap">
                    <input
                      type="range"
                      className="tts-slider"
                      min="0.5" max="2" step="0.1"
                      value={rate}
                      onChange={e => setRate(parseFloat(e.target.value))}
                    />
                    <span className="tts-slider-val">{rate.toFixed(1)}×</span>
                  </div>
                </div>

                <div className="option-divider" />

                {/* Pitch */}
                <div className="option-group">
                  <span className="option-label">Pitch</span>
                  <div className="tts-slider-wrap">
                    <input
                      type="range"
                      className="tts-slider"
                      min="0.5" max="2" step="0.1"
                      value={pitch}
                      onChange={e => setPitch(parseFloat(e.target.value))}
                    />
                    <span className="tts-slider-val">{pitch.toFixed(1)}</span>
                  </div>
                </div>

              </div>

              {/* Text Input */}
              <div className="tts-input-body">
                <textarea
                  className="tts-textarea"
                  placeholder="Type or paste any text here and press Play to hear it spoken aloud…"
                  value={inputText}
                  onChange={handleInput}
                  maxLength={5000}
                />

                {/* Waveform visual when playing */}
                {playing && (
                  <div className="tts-waveform">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <span key={i} className="tts-wave-bar" style={{ animationDelay: `${i * 0.07}s` }} />
                    ))}
                  </div>
                )}

                {/* Controls */}
                <div className="tts-controls">
                  <span className="char-count">{charCount} / 5000 chars</span>
                  <div className="tts-btns">
                    <button className="panel-btn" onClick={handleClear}>✕ Clear</button>
                    {playing ? (
                      <button className="tts-ctrl-btn pause" onClick={handlePause}>⏸ Pause</button>
                    ) : paused ? (
                      <button className="tts-ctrl-btn play" onClick={handlePlay}>▶ Resume</button>
                    ) : (
                      <button
                        className="tts-ctrl-btn play"
                        onClick={handlePlay}
                        disabled={!inputText.trim()}
                      >
                        ▶ Play
                      </button>
                    )}
                    <button
                      className="tts-ctrl-btn stop"
                      onClick={handleStop}
                      disabled={!playing && !paused}
                    >
                      ■ Stop
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ── History ── */}
            <section className="history-section">
              <h2 className="section-title">Playback History</h2>
              <div className="history-list">
                {history.map(item => (
                  <div
                    className="history-item"
                    key={item.id}
                    onClick={() => {
                      setInputText(item.text);
                      setCharCount(item.text.length);
                      setSelectedLang(VOICES_BY_LANG.find(v => v.lang === item.lang) || VOICES_BY_LANG[0]);
                    }}
                  >
                    <div className="history-langs">
                      <span className="hlang">{langLabel(item.lang)}</span>
                    </div>
                    <div className="history-texts">
                      <p className="htext-in">{item.text}</p>
                    </div>
                    <span className="htime">{item.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
};

export default TTS;