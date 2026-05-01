import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Summarizer.css";
import { API_BASE, authHeaders } from "../../utils/api";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "/dashboard" },
  { id: "translator", label: "Translator", icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer", icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards", icon: "🃏", path: "/tools/flashcards" },
  { id: "voice", label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts", label: "Text-to-Speech", icon: "🔊", path: "/tools/tts" },
];

const SUMMARY_LENGTHS = [
  { id: "short", label: "Short", desc: "~1–2 sentences" },
  { id: "medium", label: "Medium", desc: "~1 paragraph" },
  { id: "long", label: "Long", desc: "~3–5 paragraphs" },
];

const SUMMARY_STYLES = [
  { id: "paragraph", label: "Paragraph" },
  { id: "bullets", label: "Bullet Points" },
  { id: "tldr", label: "TL;DR" },
];

const historyData = [
  {
    id: 1,
    input: "Artificial intelligence is transforming every industry, from healthcare to finance...",
    output: "AI is revolutionizing multiple sectors by automating tasks and improving efficiency.",
    length: "short",
    style: "paragraph",
    wordCount: 142,
    time: "5 min ago",
  },
  {
    id: 2,
    input: "The history of the Roman Empire spans over a thousand years and includes...",
    output:
      "• Founded in 27 BC by Augustus\n• Peaked under the Five Good Emperors\n• Fell in 476 AD due to internal decay and invasions",
    length: "medium",
    style: "bullets",
    wordCount: 310,
    time: "2 hr ago",
  },
  {
    id: 3,
    input: "Climate change refers to long-term shifts in temperatures and weather patterns...",
    output:
      "TL;DR: Climate change is a long-term shift in global temperatures caused primarily by human activity, leading to extreme weather, rising seas, and ecological disruption.",
    length: "short",
    style: "tldr",
    wordCount: 98,
    time: "Yesterday",
  },
];

const Summarizer = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryStyle, setSummaryStyle] = useState("paragraph");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(historyData);
  const [wordCount, setWordCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);
    setWordCount(val.trim() ? val.trim().split(/\s+/).length : 0);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setWordCount(0);
    setError("");
  };

  const handleCopy = async () => {
    if (!outputText) return;

    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    const headers = authHeaders(true);

    if (!headers.Authorization) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setOutputText("");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/summarize`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: inputText,
          length: summaryLength,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Summarization failed.");
      }

      const result = data.summary;

      setOutputText(result);

      

      setHistory((prev) => [
        {
          id: Date.now(),
          input: inputText.slice(0, 80) + (inputText.length > 80 ? "..." : ""),
          output: result,
          length: summaryLength,
          style: summaryStyle,
          wordCount,
          time: "Just now",
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.message || "Summarization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setInputText(item.input);
    setOutputText(item.output);
    setSummaryLength(item.length);
    setSummaryStyle(item.style);
    setWordCount(item.wordCount);
    setError("");
  };

  const renderOutput = (text) => {
    if (!text) return null;

    return text.split("\n").map((line, i) => (
      <p key={i} className={line.startsWith("•") ? "sum-bullet" : "sum-line"}>
        {line}
      </p>
    ));
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
              className={`nav-item ${item.id === "summarizer" ? "active" : ""}`}
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
            <h1 className="topbar-title">Summarizer</h1>
            <p className="topbar-sub">
              Condense any text into <span>key insights</span> instantly
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

        <section className="summarizer-card">
          <div className="options-bar">
            <div className="option-group">
              <span className="option-label">Length</span>
              <div className="option-pills">
                {SUMMARY_LENGTHS.map((l) => (
                  <button
                    key={l.id}
                    className={`option-pill ${summaryLength === l.id ? "active" : ""}`}
                    onClick={() => setSummaryLength(l.id)}
                    title={l.desc}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-divider" />

            <div className="option-group">
              <span className="option-label">Style</span>
              <div className="option-pills">
                {SUMMARY_STYLES.map((s) => (
                  <button
                    key={s.id}
                    className={`option-pill ${summaryStyle === s.id ? "active" : ""}`}
                    onClick={() => setSummaryStyle(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-panels">
            <div className="text-panel">
              <div className="panel-header">
                <span className="panel-lang">Input Text</span>
                <button className="panel-btn" onClick={handleClear}>
                  ✕ Clear
                </button>
              </div>

              <textarea
                className="trans-textarea"
                placeholder="Paste or type any article, document, or passage to summarize..."
                value={inputText}
                onChange={handleInput}
                maxLength={10000}
              />

              <div className="panel-footer">
                <span className="char-count">
                  {wordCount} words · {inputText.length} / 10000 chars
                </span>

                <button
                  className="translate-btn"
                  onClick={handleSummarize}
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> Summarizing…
                    </>
                  ) : (
                    "✦ Summarize"
                  )}
                </button>
              </div>
            </div>

            <div className="text-panel output-panel">
              <div className="panel-header">
                <span className="panel-lang">Summary</span>
                <button className="panel-btn" onClick={handleCopy} disabled={!outputText}>
                  {copied ? "✓ Copied!" : "⎘ Copy"}
                </button>
              </div>

              <div className="trans-output sum-output">
                {loading ? (
                  <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : error ? (
                  <span className="sum-error">⚠ {error}</span>
                ) : outputText ? (
                  renderOutput(outputText)
                ) : (
                  <span className="placeholder-text">Your summary will appear here…</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="history-section">
          <h2 className="section-title">Summary History</h2>

          <div className="history-list">
            {history.map((item) => (
              <div className="history-item" key={item.id} onClick={() => loadFromHistory(item)}>
                <div className="history-langs">
                  <span className="hlang">{item.length}</span>
                  <span className="harrow">·</span>
                  <span className="hlang">{item.style}</span>
                </div>

                <div className="history-texts">
                  <p className="htext-in">{item.input}</p>
                  <p className="htext-out">{item.output.replace(/\n/g, " ")}</p>
                </div>

                <div className="htime-col">
                  <span className="htime">{item.time}</span>
                  <span className="hwords">{item.wordCount}w</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Summarizer;