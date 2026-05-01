import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Translator.css";
import { API_BASE, authHeaders } from "../../utils/api";
import { trackUsage } from "../../utils/trackUsage";

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

const langCodeMap = {
  English: "en",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Japanese: "ja",
  Chinese: "zh",
  Korean: "ko",
  Arabic: "ar",
  Hindi: "hi",
  Russian: "ru",
  Dutch: "nl",
  Polish: "pl",
  Turkish: "tr",
  Swedish: "sv",
  Norwegian: "no",
  Danish: "da",
};

const historyData = [
  {
    id: 1,
    from: "English",
    to: "Spanish",
    input: "Hello, how are you?",
    output: "Hola, ¿cómo estás?",
    time: "2 min ago",
  },
  {
    id: 2,
    from: "English",
    to: "French",
    input: "Good morning everyone.",
    output: "Bonjour à tous.",
    time: "1 hr ago",
  },
  {
    id: 3,
    from: "Japanese",
    to: "English",
    input: "ありがとうございます",
    output: "Thank you very much.",
    time: "3 hr ago",
  },
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
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(outputText);
    setOutputText(inputText);
    setError("");
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    const headers = authHeaders(true);

    if (!headers.Authorization) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setOutputText("");
    setError("");

    const fromCode = langCodeMap[fromLang];
    const toCode = langCodeMap[toLang];

    try {
      const response = await fetch(`${API_BASE}/translate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: inputText,
          sourceLang: fromCode,
          targetLang: toCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Translation failed.");
      }

      const translated = data.translatedText;

      setOutputText(translated);

      await trackUsage({
        tool: "translator",
        action: "translate",
        meta: {
          summary: `Translated ${fromLang} → ${toLang}`,
          fromLang,
          toLang,
          sourceLang: fromCode,
          targetLang: toCode,
          inputChars: inputText.length,
          outputChars: translated.length,
          textPreview: inputText.slice(0, 80),
        },
      });

      setHistory((prev) => [
        {
          id: Date.now(),
          from: fromLang,
          to: toLang,
          input: inputText,
          output: translated,
          time: "Just now",
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.message || "Could not translate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;

    await navigator.clipboard.writeText(outputText);
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

      <main className="dash-main">
        <header className="dash-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Translator</h1>
            <p className="topbar-sub">
              Translate text across <span>50+ languages</span> instantly
            </p>
          </div>

          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="topbar-avatar">B</div>
          </div>
        </header>

        <section className="translator-card">
          <div className="lang-bar">
            <select
              className="lang-select"
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <button className="swap-btn" onClick={swapLanguages} title="Swap languages">
              ⇄
            </button>

            <select
              className="lang-select"
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="text-panels">
            <div className="text-panel">
              <div className="panel-header">
                <span className="panel-lang">{fromLang}</span>
                <button className="panel-btn" onClick={handleClear}>
                  ✕ Clear
                </button>
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

            <div className="text-panel output-panel">
              <div className="panel-header">
                <span className="panel-lang">{toLang}</span>
                <button className="panel-btn" onClick={handleCopy} disabled={!outputText}>
                  {copied ? "✓ Copied!" : "⎘ Copy"}
                </button>
              </div>

              <div className="trans-output">
                {loading ? (
                  <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : error ? (
                  <span style={{ color: "#fc8181", fontSize: "0.88rem" }}>
                    ⚠ {error}
                  </span>
                ) : outputText ? (
                  outputText
                ) : (
                  <span className="placeholder-text">Translation will appear here...</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="history-section">
          <h2 className="section-title">Translation History</h2>

          <div className="history-list">
            {history.map((item) => (
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