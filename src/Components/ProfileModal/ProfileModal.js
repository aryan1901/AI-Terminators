import React, { useState, useEffect, useRef } from "react";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose, name = "Bansari", email = "bansari@example.com" }) => {
  const [activeTab, setActiveTab]     = useState("info");
  const [displayName, setDisplayName] = useState(name);
  const [displayEmail, setDisplayEmail] = useState(email);
  const [bio, setBio]                 = useState("CS Graduate Student · AI Toolkit Hub");
  const [infoSaved, setInfoSaved]     = useState(false);

  // Password fields
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError,    setPwError]    = useState("");
  const [pwSuccess,  setPwSuccess]  = useState(false);

  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Mock stats — replace with real data from your backend/state
  const stats = [
    { label: "Total Requests",   value: "323",   color: "#63b3ed", icon: "⚡" },
    { label: "Words Translated", value: "14.2k", color: "#9a75ea", icon: "🌐" },
    { label: "PDFs Processed",   value: "27",    color: "#f6c90e", icon: "📄" },
    { label: "Audio Generated",  value: "1.8h",  color: "#68d391", icon: "🔊" },
  ];

  const handleSaveInfo = () => {
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2500);
  };

  const handleChangePassword = () => {
    setPwError("");
    setPwSuccess(false);
    if (!currentPw)          return setPwError("Please enter your current password.");
    if (newPw.length < 8)    return setPwError("New password must be at least 8 characters.");
    if (newPw !== confirmPw) return setPwError("Passwords do not match.");
    // ── Replace with your real API call here ──
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const pwStrength = newPw.length >= 12 ? "Strong"
                   : newPw.length >= 8  ? "Medium"
                   : newPw.length > 0   ? "Weak"
                   : "";

  const pwStrengthColor = pwStrength === "Strong" ? "#68d391"
                        : pwStrength === "Medium" ? "#f6c90e"
                        : "#fc8181";

  const pwStrengthWidth = pwStrength === "Strong" ? "100%"
                        : pwStrength === "Medium" ? "66%"
                        : pwStrength === "Weak"   ? "33%"
                        : "0%";

  return (
    <div
      className="pm-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="pm-modal">

        {/* ── Header ── */}
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="pm-header-name">{displayName}</p>
              <p className="pm-header-email">{displayEmail}</p>
            </div>
          </div>
          <button className="pm-close" onClick={onClose} title="Close">✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="pm-tabs">
          <button
            className={`pm-tab ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            👤 Profile
          </button>
          
          <button
            className={`pm-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            🔒 Security
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="pm-body">

          {/* ── Profile Tab ── */}
          {activeTab === "info" && (
            <div className="pm-section">
              <div className="pm-field">
                <label className="pm-label">Full Name</label>
                <input
                  className="pm-input"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="pm-field">
                <label className="pm-label">Email Address</label>
                <input
                  className="pm-input"
                  type="email"
                  value={displayEmail}
                  onChange={e => setDisplayEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="pm-field">
                <label className="pm-label">Bio</label>
                <textarea
                  className="pm-input pm-textarea"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself…"
                  rows={3}
                />
              </div>
              <div className="pm-footer">
                {infoSaved && <span className="pm-success">✓ Saved!</span>}
                <button className="pm-save-btn" onClick={handleSaveInfo}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── Stats Tab ── */}
          {activeTab === "stats" && (
            <div className="pm-section">
              <p className="pm-section-desc">Your all-time usage across all tools</p>
              <div className="pm-stats-grid">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="pm-stat-card"
                    style={{ "--accent": s.color }}
                  >
                    <span className="pm-stat-icon">{s.icon}</span>
                    <p className="pm-stat-value">{s.value}</p>
                    <p className="pm-stat-label">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="pm-joined">
                <span className="pm-joined-icon">📅</span>
                <span>Member since <strong>March 2025</strong></span>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <div className="pm-section">
              <div className="pm-field">
                <label className="pm-label">Current Password</label>
                <div className="pm-pw-wrap">
                  <input
                    className="pm-input"
                    type={showCurrent ? "text" : "password"}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    className="pm-pw-toggle"
                    onClick={() => setShowCurrent(v => !v)}
                  >
                    {showCurrent ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="pm-field">
                <label className="pm-label">New Password</label>
                <div className="pm-pw-wrap">
                  <input
                    className="pm-input"
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    className="pm-pw-toggle"
                    onClick={() => setShowNew(v => !v)}
                  >
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
                {newPw && (
                  <div className="pm-pw-strength">
                    <div className="pm-pw-bar">
                      <div
                        className="pm-pw-fill"
                        style={{ width: pwStrengthWidth, background: pwStrengthColor }}
                      />
                    </div>
                    <span className="pm-pw-label" style={{ color: pwStrengthColor }}>
                      {pwStrength}
                    </span>
                  </div>
                )}
              </div>

              <div className="pm-field">
                <label className="pm-label">Confirm New Password</label>
                <div className="pm-pw-wrap">
                  <input
                    className="pm-input"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                  />
                  <button
                    className="pm-pw-toggle"
                    onClick={() => setShowConfirm(v => !v)}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Security tips */}
              <div className="pm-security-tips">
                <p className="pm-tips-title">🛡️ Password Tips</p>
                <ul className="pm-tips-list">
                  <li className={newPw.length >= 8 ? "met" : ""}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(newPw) ? "met" : ""}>One uppercase letter</li>
                  <li className={/[0-9]/.test(newPw) ? "met" : ""}>One number</li>
                  <li className={/[^A-Za-z0-9]/.test(newPw) ? "met" : ""}>One special character</li>
                </ul>
              </div>

              <div className="pm-footer">
                {pwError   && <span className="pm-error">⚠ {pwError}</span>}
                {pwSuccess  && <span className="pm-success">✓ Password updated!</span>}
                <button className="pm-save-btn" onClick={handleChangePassword}>
                  Update Password
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;