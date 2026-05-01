import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE, authHeaders } from "../../utils/api";
import "./Dashboard.css";

const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "▦",  path: "/dashboard" },
  { id: "translator", label: "Translator",       icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer",       icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards",       icon: "🃏", path: "/tools/flashcards" },
  { id: "voice",      label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts",        label: "Text-to-Speech",   icon: "🔊", path: "/tools/tts" },
];

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

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    stats: [],
    usageData: [],
    pieData: [],
    recentActivity: [],
    tools: [],
  });

  const getActiveId = () => {
    const match = navItems.find((item) => location.pathname === item.path);
    return match ? match.id : "dashboard";
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/dashboard/summary`, {
        method: "GET",
        headers: authHeaders(false),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load dashboard");
      }

      setDashboard(data.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    window.addEventListener("focus", loadDashboard);
    return () => window.removeEventListener("focus", loadDashboard);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );

  const { stats, usageData, pieData, recentActivity, tools } = dashboard;

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
              className={`nav-item ${getActiveId() === item.id ? "active" : ""}`}
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
            <h1 className="topbar-title">Dashboard</h1>
            <p className="topbar-sub">
              Welcome back, <span>{user?.name || "User"}</span> 👋
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
            <div className="topbar-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="chart-card wide">
            <div className="chart-header">
              <h2>Loading dashboard...</h2>
              <p>Please wait while we fetch your real usage data.</p>
            </div>
          </div>
        ) : (
          <>
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

            <section className="charts-row">

              <div className="chart-card wide">
                <div className="chart-header">
                  <h2>Weekly Usage</h2>
                  <p>Tool activity over the past 7 days</p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gTrans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#63b3ed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#63b3ed" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gSum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9a75ea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#9a75ea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "#5a6a7a", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#5a6a7a", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="translations" name="Translator" stroke="#63b3ed" fill="url(#gTrans)" strokeWidth={2} />
                    <Area type="monotone" dataKey="summaries" name="Summarizer" stroke="#9a75ea" fill="url(#gSum)" strokeWidth={2} />
                    <Area type="monotone" dataKey="tts" name="TTS" stroke="#fc8181" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

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
                    <Bar dataKey="voice" name="Voice" fill="#68d391" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bottom-row">

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

              <div className="activity-section">
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-list">
                  {recentActivity.length === 0 ? (
                    <p className="placeholder-text">No activity yet. Use a tool to see activity here.</p>
                  ) : (
                    recentActivity.map((item) => (
                      <div className="activity-item" key={item.id}>
                        <span className="activity-icon">{item.icon}</span>
                        <div className="activity-info">
                          <p className="activity-action">{item.action}</p>
                          <p className="activity-tool">{item.tool}</p>
                        </div>
                        <span className="activity-time">{item.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;