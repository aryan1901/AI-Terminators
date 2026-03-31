import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Flashcards.css";

const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "▦",  path: "/dashboard" },
  { id: "translator", label: "Translator",       icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer",       icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards",       icon: "🃏", path: "/tools/flashcards" },
  { id: "voice",      label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts",        label: "Text-to-Speech",   icon: "🔊", path: "/tools/tts" },
];

const CARD_COUNTS = [5, 10, 15, 20];

const historyData = [
  {
    id: 1,
    topic: "Photosynthesis",
    cardCount: 8,
    cards: [
      { q: "What is photosynthesis?", a: "The process by which plants convert sunlight into food using CO₂ and water." },
      { q: "What pigment captures light?", a: "Chlorophyll, found in chloroplasts." },
    ],
    time: "10 min ago",
  },
  {
    id: 2,
    topic: "World War II",
    cardCount: 10,
    cards: [
      { q: "When did WWII begin?", a: "September 1, 1939, when Germany invaded Poland." },
      { q: "What ended WWII in the Pacific?", a: "The atomic bombings of Hiroshima and Nagasaki in August 1945." },
    ],
    time: "2 hr ago",
  },
];

// ─── Generate Flashcards via Anthropic API ────────────────
const generateFlashcards = async (text, count) => {
  const prompt = `Generate exactly ${count} flashcards from the following text.

Return ONLY a JSON array in this exact format, no preamble, no markdown:
[
  {"q": "Question here?", "a": "Answer here."},
  ...
]

Text:
"""
${text}
"""`;

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
  const raw = data.content?.[0]?.text?.trim() || "[]";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

// ─── Flashcards Component ─────────────────────────────────
const Flashcards = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [inputText, setInputText]       = useState("");
  const [cardCount, setCardCount]       = useState(10);
  const [cards, setCards]               = useState([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [flipped, setFlipped]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [history, setHistory]           = useState(historyData);
  const [wordCount, setWordCount]       = useState(0);
  const [topic, setTopic]               = useState("");

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
    setWordCount(0);
    setCards([]);
    setError("");
    setTopic("");
    setCurrentIdx(0);
    setFlipped(false);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setCards([]);
    setError("");
    setCurrentIdx(0);
    setFlipped(false);

    try {
      const generated = await generateFlashcards(inputText, cardCount);
      setCards(generated);
      const autoTopic = inputText.trim().split(/\s+/).slice(0, 4).join(" ") + "…";
      setTopic(autoTopic);
      setHistory(prev => [{
        id: Date.now(),
        topic: autoTopic,
        cardCount: generated.length,
        cards: generated,
        time: "Just now",
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(i => Math.min(i + 1, cards.length - 1)), 150);
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(i => Math.max(i - 1, 0)), 150);
  };

  const loadFromHistory = (item) => {
    setCards(item.cards);
    setTopic(item.topic);
    setCurrentIdx(0);
    setFlipped(false);
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
              className={`nav-item ${item.id === "flashcards" ? "active" : ""}`}
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
            <h1 className="topbar-title">Flashcards</h1>
            <p className="topbar-sub">Auto-generate <span>Q&A cards</span> from any text</p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="topbar-avatar">B</div>
          </div>
        </header>

        {/* ── Input Card ── */}
        <section className="fc-input-card">
          <div className="options-bar">
            <div className="option-group">
              <span className="option-label">Cards to Generate</span>
              <div className="option-pills">
                {CARD_COUNTS.map(n => (
                  <button
                    key={n}
                    className={`option-pill ${cardCount === n ? "active" : ""}`}
                    onClick={() => setCardCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="fc-input-body">
            <textarea
              className="fc-textarea"
              placeholder="Paste any text, notes, or article — AI will generate flashcards from it…"
              value={inputText}
              onChange={handleInput}
              maxLength={10000}
            />
            <div className="fc-input-footer">
              <span className="char-count">{wordCount} words · {inputText.length} / 10000 chars</span>
              <div className="fc-footer-btns">
                <button className="panel-btn" onClick={handleClear}>✕ Clear</button>
                <button
                  className="translate-btn"
                  onClick={handleGenerate}
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? <><span className="spinner" /> Generating…</> : "🃏 Generate Cards"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Flashcard Viewer ── */}
        {(cards.length > 0 || loading || error) && (
          <section className="fc-viewer-section">
            <div className="fc-viewer-header">
              <h2 className="section-title" style={{ margin: 0 }}>
                {topic || "Flashcards"}
              </h2>
              {cards.length > 0 && (
                <span className="fc-progress">{currentIdx + 1} / {cards.length}</span>
              )}
            </div>

            {loading ? (
              <div className="fc-loading">
                <div className="loading-dots"><span /><span /><span /></div>
                <p>Generating your flashcards…</p>
              </div>
            ) : error ? (
              <div className="fc-error">⚠ {error}</div>
            ) : (
              <>
                {/* Flip Card */}
                <div
                  className={`fc-card-wrap ${flipped ? "flipped" : ""}`}
                  onClick={() => setFlipped(f => !f)}
                >
                  <div className="fc-card">
                    <div className="fc-card-front">
                      <span className="fc-card-label">Question</span>
                      <p className="fc-card-text">{cards[currentIdx]?.q}</p>
                      <span className="fc-tap-hint">Tap to reveal answer</span>
                    </div>
                    <div className="fc-card-back">
                      <span className="fc-card-label">Answer</span>
                      <p className="fc-card-text">{cards[currentIdx]?.a}</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="fc-progress-bar">
                  <div
                    className="fc-progress-fill"
                    style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
                  />
                </div>

                {/* Navigation */}
                <div className="fc-nav">
                  <button
                    className="fc-nav-btn"
                    onClick={goPrev}
                    disabled={currentIdx === 0}
                  >
                    ← Prev
                  </button>
                  <button
                    className="fc-flip-btn"
                    onClick={() => setFlipped(f => !f)}
                  >
                    {flipped ? "Show Question" : "Show Answer"}
                  </button>
                  <button
                    className="fc-nav-btn"
                    onClick={goNext}
                    disabled={currentIdx === cards.length - 1}
                  >
                    Next →
                  </button>
                </div>

                {/* All cards list */}
                <div className="fc-all-cards">
                  <h3 className="fc-all-title">All Cards</h3>
                  <div className="fc-all-list">
                    {cards.map((card, i) => (
                      <div
                        key={i}
                        className={`fc-all-item ${i === currentIdx ? "active" : ""}`}
                        onClick={() => { setCurrentIdx(i); setFlipped(false); }}
                      >
                        <span className="fc-all-num">{i + 1}</span>
                        <div className="fc-all-texts">
                          <p className="fc-all-q">{card.q}</p>
                          <p className="fc-all-a">{card.a}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* ── History ── */}
        <section className="history-section">
          <h2 className="section-title">Recent Sets</h2>
          <div className="history-list">
            {history.map(item => (
              <div className="history-item" key={item.id} onClick={() => loadFromHistory(item)}>
                <div className="history-langs">
                  <span className="hlang">{item.cardCount} cards</span>
                </div>
                <div className="history-texts">
                  <p className="htext-in">{item.topic}</p>
                  <p className="htext-out">{item.cards[0]?.q}</p>
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

export default Flashcards;