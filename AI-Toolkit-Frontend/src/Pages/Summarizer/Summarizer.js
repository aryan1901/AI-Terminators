import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Summarizer.css";

const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "▦",  path: "/dashboard" },
  { id: "translator", label: "Translator",       icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer",       icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards",       icon: "🃏", path: "/tools/flashcards" },
  { id: "voice",      label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts",        label: "Text-to-Speech",   icon: "🔊", path: "/tools/tts" },
];

const SUMMARY_LENGTHS = [
  { id: "short",  label: "Short",  desc: "~1–2 sentences" },
  { id: "medium", label: "Medium", desc: "~1 paragraph" },
  { id: "long",   label: "Long",   desc: "~3–5 paragraphs" },
];

const SUMMARY_STYLES = [
  { id: "paragraph", label: "Paragraph" },
  { id: "bullets",   label: "Bullet Points" },
  { id: "tldr",      label: "TL;DR" },
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
    output: "• Founded in 27 BC by Augustus\n• Peaked under the Five Good Emperors\n• Fell in 476 AD due to internal decay and invasions",
    length: "medium",
    style: "bullets",
    wordCount: 310,
    time: "2 hr ago",
  },
  {
    id: 3,
    input: "Climate change refers to long-term shifts in temperatures and weather patterns...",
    output: "TL;DR: Climate change is a long-term shift in global temperatures caused primarily by human activity, leading to extreme weather, rising seas, and ecological disruption.",
    length: "short",
    style: "tldr",
    wordCount: 98,
    time: "Yesterday",
  },
];

// ─── Real Summarization via Anthropic API ─────────────────
const summarizeText = async (text, length, style) => {
  const lengthGuide = {
    short:  "1–2 sentences only",
    medium: "one concise paragraph",
    long:   "3–5 detailed paragraphs",
  };

  const styleGuide = {
    paragraph: "Write in clear, flowing prose paragraphs.",
    bullets:   "Use bullet points (•) for each key idea. One idea per bullet.",
    tldr:      'Start with "TL;DR:" followed by a single punchy sentence summary.',
  };

  const prompt = `Summarize the following text.

Length: ${lengthGuide[length]}
Style: ${styleGuide[style]}

Text to summarize:
"""
${text}
"""

Respond with ONLY the summary. No preamble, no labels, no explanation.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "";
};

// ─── Summarizer Component ─────────────────────────────────
const Summarizer = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [inputText, setInputText]       = useState("");
  const [outputText, setOutputText]     = useState("");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryStyle, setSummaryStyle] = useState("paragraph");
  const [loading, setLoading]           = useState(false);
  const [copied, setCopied]             = useState(false);
  const [error, setError]               = useState("");
  const [history, setHistory]           = useState(historyData);
  const [wordCount, setWordCount]       = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText("");
    setError("");

    try {
      const result = await summarizeText(inputText, summaryLength, summaryStyle);
      setOutputText(result);
      setHistory(prev => [{
        id: Date.now(),
        input: inputText.slice(0, 80) + (inputText.length > 80 ? "..." : ""),
        output: result,
        length: summaryLength,
        style: summaryStyle,
        wordCount,
        time: "Just now",
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError("Summarization failed. Please check your connection and try again.");
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

  // Render bullet output with styled bullets
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

      {/* ── Main ── */}
      <main className="dash-main">

        {/* Top Bar */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Summarizer</h1>
            <p className="topbar-sub">Condense any text into <span>key insights</span> instantly</p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="topbar-avatar">B</div>
          </div>
        </header>

        {/* ── Summarizer Card ── */}
        <section className="summarizer-card">

          {/* Options Bar */}
          <div className="options-bar">

            {/* Length */}
            <div className="option-group">
              <span className="option-label">Length</span>
              <div className="option-pills">
                {SUMMARY_LENGTHS.map(l => (
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

            {/* Style */}
            <div className="option-group">
              <span className="option-label">Style</span>
              <div className="option-pills">
                {SUMMARY_STYLES.map(s => (
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

          {/* Text Panels */}
          <div className="text-panels">

            {/* Input Panel */}
            <div className="text-panel">
              <div className="panel-header">
                <span className="panel-lang">Input Text</span>
                <button className="panel-btn" onClick={handleClear}>✕ Clear</button>
              </div>
              <textarea
                className="trans-textarea"
                placeholder="Paste or type any article, document, or passage to summarize..."
                value={inputText}
                onChange={handleInput}
                maxLength={10000}
              />
              <div className="panel-footer">
                <span className="char-count">{wordCount} words · {inputText.length} / 10000 chars</span>
                <button
                  className="translate-btn"
                  onClick={handleSummarize}
                  disabled={loading || !inputText.trim()}
                >
                  {loading
                    ? <><span className="spinner" /> Summarizing…</>
                    : "✦ Summarize"}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="text-panel output-panel">
              <div className="panel-header">
                <span className="panel-lang">Summary</span>
                <button className="panel-btn" onClick={handleCopy} disabled={!outputText}>
                  {copied ? "✓ Copied!" : "⎘ Copy"}
                </button>
              </div>
              <div className="trans-output sum-output">
                {loading ? (
                  <div className="loading-dots"><span /><span /><span /></div>
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

        {/* ── History ── */}
        <section className="history-section">
          <h2 className="section-title">Summary History</h2>
          <div className="history-list">
            {history.map(item => (
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