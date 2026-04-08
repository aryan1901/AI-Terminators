import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Flashcards.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "/dashboard" },
  { id: "translator", label: "Translator", icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer", icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards", icon: "🃏", path: "/tools/flashcards" },
  { id: "voice", label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts", label: "Text-to-Speech", icon: "🔊", path: "/tools/tts" },
];

const Flashcards = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const fetchHistory = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/flashcards", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch flashcards.");
      }

      setHistory(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
    setError("");

    if (file && !title.trim()) {
      const cleanName = file.name.replace(/\.pdf$/i, "");
      setTitle(cleanName);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setTitle("");
    setCards([]);
    setError("");
    setTopic("");
    setCurrentIdx(0);
    setFlipped(false);
  };

  const handleGenerate = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setCards([]);
    setTopic("");
    setCurrentIdx(0);
    setFlipped(false);

    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);
      formData.append("title", title.trim() || "Untitled Flashcard Set");

      const response = await fetch(
        "http://localhost:5000/api/flashcards/generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate flashcards.");
      }

      const generatedCards = (data.data?.flashcards || []).map((card) => ({
        q: card.question,
        a: card.answer,
      }));

      setCards(generatedCards);
      setTopic(data.data?.title || title || selectedFile.name);
      await fetchHistory();
    } catch (err) {
      setError(err.message || "Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx((i) => Math.min(i + 1, cards.length - 1)), 150);
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx((i) => Math.max(i - 1, 0)), 150);
  };

  const loadFromHistory = (item) => {
    const mappedCards = (item.flashcards || []).map((card) => ({
      q: card.question,
      a: card.answer,
    }));

    setCards(mappedCards);
    setTopic(item.title || "Flashcards");
    setCurrentIdx(0);
    setFlipped(false);
    setError("");
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

      <main className="dash-main">
        <header className="dash-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Flashcards</h1>
            <p className="topbar-sub">
              Upload a <span>PDF</span> and generate AI flashcards
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

        <section className="fc-input-card">
          <div className="options-bar">
            <div className="option-group">
              <span className="option-label">Upload PDF</span>
            </div>
          </div>

          <div className="fc-input-body" style={{ padding: "20px 24px" }}>
            <input
              type="text"
              placeholder="Flashcard set title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                marginBottom: "14px",
                borderRadius: "10px",
                border: "1px solid #2a2a3a",
                background: "#1a1a26",
                color: "#e2e8f0",
                outline: "none",
              }}
            />

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ color: "#e2e8f0", marginBottom: "14px" }}
            />

            <div className="fc-input-footer" style={{ padding: 0, borderTop: "none" }}>
              <span className="char-count">
                {selectedFile ? `Selected: ${selectedFile.name}` : "No PDF selected"}
              </span>

              <div className="fc-footer-btns">
                <button className="panel-btn" onClick={handleClear}>
                  ✕ Clear
                </button>
                <button
                  className="translate-btn"
                  onClick={handleGenerate}
                  disabled={loading || !selectedFile}
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> Generating…
                    </>
                  ) : (
                    "🃏 Generate Cards"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {(cards.length > 0 || loading || error) && (
          <section className="fc-viewer-section">
            <div className="fc-viewer-header">
              <h2 className="section-title" style={{ margin: 0 }}>
                {topic || "Flashcards"}
              </h2>
              {cards.length > 0 && (
                <span className="fc-progress">
                  {currentIdx + 1} / {cards.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="fc-loading">
                <div className="loading-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <p>Generating your flashcards…</p>
              </div>
            ) : error ? (
              <div className="fc-error">⚠ {error}</div>
            ) : (
              <>
                <div
                  className={`fc-card-wrap ${flipped ? "flipped" : ""}`}
                  onClick={() => setFlipped((f) => !f)}
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

                <div className="fc-progress-bar">
                  <div
                    className="fc-progress-fill"
                    style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
                  />
                </div>

                <div className="fc-nav">
                  <button
                    className="fc-nav-btn"
                    onClick={goPrev}
                    disabled={currentIdx === 0}
                  >
                    ← Prev
                  </button>
                  <button className="fc-flip-btn" onClick={() => setFlipped((f) => !f)}>
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

                <div className="fc-all-cards">
                  <h3 className="fc-all-title">All Cards</h3>
                  <div className="fc-all-list">
                    {cards.map((card, i) => (
                      <div
                        key={i}
                        className={`fc-all-item ${i === currentIdx ? "active" : ""}`}
                        onClick={() => {
                          setCurrentIdx(i);
                          setFlipped(false);
                        }}
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

        <section className="history-section">
          <h2 className="section-title">Recent Sets</h2>
          <div className="history-list">
            {historyLoading ? (
              <div className="fc-loading">
                <p>Loading history…</p>
              </div>
            ) : history.length === 0 ? (
              <div className="fc-error">No flashcard sets found yet.</div>
            ) : (
              history.map((item) => (
                <div
                  className="history-item"
                  key={item._id}
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="history-langs">
                    <span className="hlang">{item.flashcards?.length || 0} cards</span>
                  </div>
                  <div className="history-texts">
                    <p className="htext-in">{item.title}</p>
                    <p className="htext-out">
                      {item.flashcards?.[0]?.question || "No preview available"}
                    </p>
                  </div>
                  <span className="htime">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Flashcards;