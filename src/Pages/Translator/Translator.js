import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Translator.css";
import AvatarDropdown from "../../Components/AvatarDropdown/AvatarDropdown";


const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "/dashboard" },
  { id: "translator", label: "Translator", icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer", icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards", icon: "🃏", path: "/tools/flashcards" },
  { id: "voice", label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts", label: "Text-to-Speech", icon: "🔊", path: "/tools/tts" },
];

const languages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Japanese", "Chinese", "Korean", "Arabic", "Hindi", "Russian",
  "Dutch", "Polish", "Turkish", "Swedish", "Norwegian", "Danish",
];

// ─── Language name → MyMemory language code map ──────────
// MyMemory uses ISO 639-1 codes (e.g. "en", "es", "fr")
const langCodeMap = {
  English:    "en",
  Spanish:    "es",
  French:     "fr",
  German:     "de",
  Italian:    "it",
  Portuguese: "pt",
  Japanese:   "ja",
  Chinese:    "zh",
  Korean:     "ko",
  Arabic:     "ar",
  Hindi:      "hi",
  Russian:    "ru",
  Dutch:      "nl",
  Polish:     "pl",
  Turkish:    "tr",
  Swedish:    "sv",
  Norwegian:  "no",
  Danish:     "da",
};

const historyData = [
  { id: 1, from: "English", to: "Spanish", input: "Hello, how are you?", output: "Hola, ¿cómo estás?", time: "2 min ago" },
  { id: 2, from: "English", to: "French",  input: "Good morning everyone.", output: "Bonjour à tous.", time: "1 hr ago" },
  { id: 3, from: "Japanese", to: "English", input: "ありがとうございます", output: "Thank you very much.", time: "3 hr ago" },
];

const Translator = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [fromLang, setFromLang] = useState("English");
  const [toLang, setToLang] = useState("Spanish");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(historyData);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  // ─── Real Translation via MyMemory API ───────────────────
  // Free, no API key needed. Limit: ~1000 requests/day.
  // Docs: https://mymemory.translated.net/doc/spec.php
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText("");
    setError("");

    const fromCode = langCodeMap[fromLang];
    const toCode   = langCodeMap[toLang];

    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${fromCode}|${toCode}`
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      // MyMemory returns status 200 for success, 429 for rate limit
      if (data.responseStatus === 200) {
        const translated = data.responseData.translatedText;
        setOutputText(translated);
        setHistory(prev => [{
          id: Date.now(),
          from: fromLang,
          to: toLang,
          input: inputText,
          output: translated,
          time: "Just now"
        }, ...prev.slice(0, 9)]);
      } else if (data.responseStatus === 429) {
        setError("Daily translation limit reached. Try again tomorrow.");
      } else {
        setError("Translation failed. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to translation service. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setCharCount(0);
    setError("");
  };

  const handleInput = (e) => {
    setInputText(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <div className="dash-wrapper">

      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">⚡</span>
          {sidebarOpen && <span className="sidebar-brand-name">AI Toolkit Hub</span>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${item.id === "translator" ? "active" : ""}`}
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

      {/* Main */}
      <main className="dash-main">

        {/* Top Bar */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Translator</h1>
            <p className="topbar-sub">Translate text across <span>50+ languages</span> instantly</p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <AvatarDropdown name="Bansari" />
          </div>
        </header>

        {/* Translator Card */}
        <section className="translator-card">

          {/* Language Selector Bar */}
          <div className="lang-bar">
            <select className="lang-select" value={fromLang} onChange={e => setFromLang(e.target.value)}>
              {languages.map(l => <option key={l}>{l}</option>)}
            </select>

            <button className="swap-btn" onClick={swapLanguages} title="Swap languages">
              ⇄
            </button>

            <select className="lang-select" value={toLang} onChange={e => setToLang(e.target.value)}>
              {languages.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          {/* Text Areas */}
          <div className="text-panels">

            {/* Input */}
            <div className="text-panel">
              <div className="panel-header">
                <span className="panel-lang">{fromLang}</span>
                <button className="panel-btn" onClick={handleClear}>✕ Clear</button>
              </div>
              <textarea
                className="trans-textarea"
                placeholder="Enter text to translate..."
                value={inputText}
                onChange={handleInput}
                maxLength={5000}
              />
              <div className="panel-footer">
                <span className="char-count">{charCount} / 5000</span>
                <button
                  className="translate-btn"
                  onClick={handleTranslate}
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? <span className="spinner" /> : "Translate →"}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="text-panel output-panel">
              <div className="panel-header">
                <span className="panel-lang">{toLang}</span>
                <button className="panel-btn" onClick={handleCopy} disabled={!outputText}>
                  {copied ? "✓ Copied!" : "⎘ Copy"}
                </button>
              </div>
              <div className="trans-output">
                {loading ? (
                  <div className="loading-dots"><span /><span /><span /></div>
                ) : error ? (
                  <span style={{ color: "#fc8181", fontSize: "0.88rem" }}>⚠ {error}</span>
                ) : outputText ? (
                  outputText
                ) : (
                  <span className="placeholder-text">Translation will appear here...</span>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* History */}
        <section className="history-section">
          <h2 className="section-title">Translation History</h2>
          <div className="history-list">
            {history.map(item => (
              <div
                className="history-item"
                key={item.id}
                onClick={() => {
                  setInputText(item.input);
                  setOutputText(item.output);
                  setFromLang(item.from);
                  setToLang(item.to);
                  setCharCount(item.input.length);
                  setError("");
                }}
              >
                <div className="history-langs">
                  <span className="hlang">{item.from}</span>
                  <span className="harrow">→</span>
                  <span className="hlang">{item.to}</span>
                </div>
                <div className="history-texts">
                  <p className="htext-in">{item.input}</p>
                  <p className="htext-out">{item.output}</p>
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

export default Translator;