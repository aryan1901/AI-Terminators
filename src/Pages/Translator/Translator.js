// src/Pages/Translator/Translator.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Translator.css";
import AvatarDropdown from "../../Components/AvatarDropdown/AvatarDropdown";
import { API_BASE, authHeaders } from "../../utils/api";

const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "▦",  path: "/dashboard" },
  { id: "translator", label: "Translator",       icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer",       icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards",       icon: "🃏", path: "/tools/flashcards" },
  { id: "voice",      label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts",        label: "Text-to-Speech",   icon: "🔊", path: "/tools/tts" },
];

const languages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Japanese", "Chinese", "Korean", "Arabic", "Hindi", "Russian",
  "Dutch", "Polish", "Turkish", "Swedish", "Norwegian", "Danish",
];

const langCodeMap = {
  English: "en", Spanish: "es", French: "fr", German: "de",
  Italian: "it", Portuguese: "pt", Japanese: "ja", Chinese: "zh",
  Korean: "ko", Arabic: "ar", Hindi: "hi", Russian: "ru",
  Dutch: "nl", Polish: "pl", Turkish: "tr", Swedish: "sv",
  Norwegian: "no", Danish: "da",
};

const Translator = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText]     = useState("");
  const [outputText, setOutputText]   = useState("");
  const [fromLang, setFromLang]       = useState("English");
  const [toLang, setToLang]           = useState("Spanish");
  const [loading, setLoading]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [history, setHistory]         = useState([]);
  const [charCount, setCharCount]     = useState(0);
  const [error, setError]             = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/translate/history`, {
          headers: authHeaders(false),
        });
        const data = await res.json();
        if (data.success) {
          const mapped = data.data.map((item) => ({
            id: item._id,
            from: item.sourceLang,
            to: item.targetLang,
            input: item.sourceText,
            output: item.translatedText,
            time: new Date(item.createdAt).toLocaleTimeString(),
          }));
          setHistory(mapped);
        }
      } catch (err) {
        console.error("Failed to load translation history", err);
      }
    };
    fetchHistory();
  }, []);

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/translate`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          text: inputText,
          sourceLang: langCodeMap[fromLang],
          targetLang: langCodeMap[toLang],
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOutputText(data.translatedText);
        setHistory((prev) => [
          {
            id: Date.now(),
            from: fromLang,
            to: toLang,
            input: inputText,
            output: data.translatedText,
            time: "Just now",
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        setError(data.message || "Translation failed. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to server. Check your connection.");
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
            <AvatarDropdown />
          </div>
        </header>

        <section className="translator-card">
          <div className="lang-bar">
            <select className="lang-select" value={fromLang} onChange={(e) => setFromLang(e.target.value)}>
              {languages.map((l) => <option key={l}>{l}</option>)}
            </select>
            <button className="swap-btn" onClick={swapLanguages} title="Swap languages">⇄</button>
            <select className="lang-select" value={toLang} onChange={(e) => setToLang(e.target.value)}>
              {languages.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div className="text-panels">
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

        <section className="history-section">
          <h2 className="section-title">Translation History</h2>
          <div className="history-list">
            {history.length === 0 ? (
              <p className="placeholder-text" style={{ padding: "16px" }}>
                No translations yet. Try one above!
              </p>
            ) : (
              history.map((item) => (
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
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Translator;