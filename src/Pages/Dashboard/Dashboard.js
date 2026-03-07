import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// ─── Mock Data ───────────────────────────────────────────
const usageData = [
  { day: "Mon", translations: 12, summaries: 5, flashcards: 3, tts: 7 },
  { day: "Tue", translations: 18, summaries: 9, flashcards: 6, tts: 4 },
  { day: "Wed", translations: 8,  summaries: 14, flashcards: 10, tts: 9 },
  { day: "Thu", translations: 22, summaries: 7, flashcards: 4, tts: 12 },
  { day: "Fri", translations: 30, summaries: 18, flashcards: 8, tts: 6 },
  { day: "Sat", translations: 15, summaries: 11, flashcards: 15, tts: 3 },
  { day: "Sun", translations: 10, summaries: 6, flashcards: 5, tts: 8 },
];

const pieData = [
  { name: "Translator",       value: 115, color: "#63b3ed" },
  { name: "Summarizer",       value: 70,  color: "#9a75ea" },
  { name: "Flashcards",       value: 51,  color: "#f6c90e" },
  { name: "Voice Translator", value: 38,  color: "#68d391" },
  { name: "TTS",              value: 49,  color: "#fc8181" },
];

const recentActivity = [
  { id: 1, tool: "Translator",       action: "Translated EN → ES",          time: "2 min ago",  icon: "🌐" },
  { id: 2, tool: "Summarizer",       action: "Summarized 3-page article",    time: "15 min ago", icon: "📝" },
  { id: 3, tool: "Flashcards",       action: "Generated 12 cards from PDF",  time: "1 hr ago",   icon: "🃏" },
  { id: 4, tool: "TTS",              action: "Converted paragraph to audio", time: "2 hr ago",   icon: "🔊" },
  { id: 5, tool: "Voice Translator", action: "Live translated EN → FR",      time: "3 hr ago",   icon: "🎙️" },
  { id: 6, tool: "Translator",       action: "Translated JA → EN",           time: "5 hr ago",   icon: "🌐" },
];

const tools = [
  {
    id: "translator",
    name: "Language Translator",
    desc: "Translate text across 50+ languages instantly",
    icon: "🌐",
    color: "#63b3ed",
    bg: "rgba(99,179,237,0.08)",
    border: "rgba(99,179,237,0.2)",
    uses: 115,
    path: "/tools/translator",
  },
  {
    id: "summarizer",
    name: "Text Summarizer",
    desc: "Condense long articles into key insights",
    icon: "📝",
    color: "#9a75ea",
    bg: "rgba(154,117,234,0.08)",
    border: "rgba(154,117,234,0.2)",
    uses: 70,
    path: "/tools/summarizer",
  },
  {
    id: "flashcards",
    name: "PDF Flashcards",
    desc: "Auto-generate Q&A flashcards from any PDF",
    icon: "🃏",
    color: "#f6c90e",
    bg: "rgba(246,201,14,0.08)",
    border: "rgba(246,201,14,0.2)",
    uses: 51,
    path: "/tools/flashcards",
  },
  {
    id: "voice",
    name: "Voice Translator",
    desc: "Speak and hear real-time translations",
    icon: "🎙️",
    color: "#68d391",
    bg: "rgba(104,211,145,0.08)",
    border: "rgba(104,211,145,0.2)",
    uses: 38,
    path: "/tools/voice-translator",
  },
  {
    id: "tts",
    name: "Text-to-Speech",
    desc: "Convert any text to natural sounding audio",
    icon: "🔊",
    color: "#fc8181",
    bg: "rgba(252,129,129,0.08)",
    border: "rgba(252,129,129,0.2)",
    uses: 49,
    path: "/tools/tts",
  },
];

const stats = [
  { label: "Total Requests",    value: "323",  delta: "+18% this week", icon: "⚡", color: "#63b3ed" },
  { label: "Words Translated",  value: "14.2k", delta: "+32% this week", icon: "🌐", color: "#9a75ea" },
  { label: "PDFs Processed",    value: "27",   delta: "+5 this week",   icon: "📄", color: "#f6c90e" },
  { label: "Audio Generated",   value: "1.8h", delta: "+12% this week", icon: "🔊", color: "#68d391" },
];

// ─── Custom Tooltip ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Dashboard Component ──────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "translator", label: "Translator", icon: "🌐" },
    { id: "summarizer", label: "Summarizer", icon: "📝" },
    { id: "flashcards", label: "Flashcards", icon: "🃏" },
    { id: "voice", label: "Voice Translator", icon: "🎙️" },
    { id: "tts", label: "Text-to-Speech", icon: "🔊" },
  ];

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
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
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

      {/* ── Main Content ── */}
      <main className="dash-main">

        {/* Top Bar */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Dashboard</h1>
            <p className="topbar-sub">Welcome back, <span>Bansari</span> 👋</p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="topbar-avatar">B</div>
          </div>
        </header>

        {/* Stats Row */}
        <section className="stats-grid">
          {stats.map((s, i) => (
            <div className="stat-card" key={i} style={{ "--accent": s.color }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-info">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
                <p className="stat-delta">{s.delta}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Charts Row */}
        <section className="charts-row">

          {/* Area Chart */}
          <div className="chart-card wide">
            <div className="chart-header">
              <h2>Weekly Usage</h2>
              <p>Tool activity over the past 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTrans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#63b3ed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#63b3ed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#9a75ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9a75ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#5a6a7a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a6a7a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="translations" name="Translator" stroke="#63b3ed" fill="url(#gTrans)" strokeWidth={2} />
                <Area type="monotone" dataKey="summaries"    name="Summarizer" stroke="#9a75ea" fill="url(#gSum)"   strokeWidth={2} />
                <Area type="monotone" dataKey="tts"          name="TTS"        stroke="#fc8181" fill="none"          strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="chart-card narrow">
            <div className="chart-header">
              <h2>Tool Distribution</h2>
              <p>All-time usage breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val} uses`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {pieData.map((item, i) => (
                <div className="legend-item" key={i}>
                  <span className="legend-dot" style={{ background: item.color }}></span>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-val">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Bar Chart */}
        <section className="charts-row">
          <div className="chart-card wide">
            <div className="chart-header">
              <h2>Daily Flashcard & Voice Activity</h2>
              <p>Flashcards generated vs voice translations per day</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#5a6a7a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a6a7a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="flashcards" name="Flashcards" fill="#f6c90e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tts"        name="TTS"        fill="#68d391" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Bottom Row: Tools + Activity */}
        <section className="bottom-row">

          {/* Tool Cards */}
          <div className="tools-section">
            <h2 className="section-title">All Tools</h2>
            <div className="tools-grid">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  className="tool-card"
                  style={{ "--tc": tool.color, "--tbg": tool.bg, "--tborder": tool.border }}
                  onClick={() => navigate(tool.path)}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <div className="tool-info">
                    <p className="tool-name">{tool.name}</p>
                    <p className="tool-desc">{tool.desc}</p>
                  </div>
                  <span className="tool-uses">{tool.uses} uses</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <span className="activity-icon">{item.icon}</span>
                  <div className="activity-info">
                    <p className="activity-action">{item.action}</p>
                    <p className="activity-tool">{item.tool}</p>
                  </div>
                  <span className="activity-time">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
};

export default Dashboard;