import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { API_BASE, authHeaders } from "../../utils/api";

const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "▦",  path: "/dashboard" },
  { id: "translator", label: "Translator",       icon: "🌐", path: "/tools/translator" },
  { id: "summarizer", label: "Summarizer",       icon: "📝", path: "/tools/summarizer" },
  { id: "flashcards", label: "Flashcards",       icon: "🃏", path: "/tools/flashcards" },
  { id: "voice",      label: "Voice Translator", icon: "🎙️", path: "/tools/voice-translator" },
  { id: "tts",        label: "Text-to-Speech",   icon: "🔊", path: "/tools/tts" },
];

const Profile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── User info from token/storage (read-only display) ──
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const name  = storedUser.name  || "User";
  const email = storedUser.email || "";

  // ── Avatar State ──
  const [avatarBg,  setAvatarBg]  = useState("#63b3ed");
  const [avatarImg, setAvatarImg] = useState(null);
  const fileRef = useRef(null);

  // ── Password State ──
  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [pwError,      setPwError]      = useState("");
  const [pwSuccess,    setPwSuccess]    = useState("");
  const [pwLoading,    setPwLoading]    = useState(false);
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    // Client-side validation
    if (!currentPw)              return setPwError("Please enter your current password.");
    if (newPw.length < 8)        return setPwError("New password must be at least 8 characters.");
    if (newPw !== confirmPw)     return setPwError("Passwords do not match.");
    if (newPw === currentPw)     return setPwError("New password must differ from current password.");

    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPwError(data.message || "Failed to update password.");
      } else {
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setPwSuccess("Password updated successfully!");
        setTimeout(() => setPwSuccess(""), 3500);
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const pwStrength =
    newPw.length === 0   ? null :
    newPw.length >= 12   ? { label: "Strong", width: "100%", color: "#68d391" } :
    newPw.length >= 8    ? { label: "Medium", width: "66%",  color: "#f6c90e" } :
                           { label: "Weak",   width: "33%",  color: "#fc8181" };

  const ACCENT_COLORS = ["#63b3ed", "#9a75ea", "#f6c90e", "#68d391", "#fc8181", "#f687b3"];

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
              className="nav-item"
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
            <h1 className="topbar-title">Profile</h1>
            <p className="topbar-sub">Manage your <span>account settings</span></p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div
              className="topbar-avatar"
              style={{ background: avatarImg ? "transparent" : avatarBg, cursor: "default" }}
            >
              {avatarImg
                ? <img src={avatarImg} alt="avatar" className="avatar-img-small" />
                : name.charAt(0).toUpperCase()
              }
            </div>
          </div>
        </header>

        <div className="profile-layout">

          {/* ── Left: Avatar Card ── */}
          <div className="profile-avatar-card">
            <div
              className="profile-avatar-circle"
              style={{ background: avatarImg ? "transparent" : avatarBg }}
              onClick={() => fileRef.current.click()}
              title="Click to change avatar"
            >
              {avatarImg
                ? <img src={avatarImg} alt="avatar" className="avatar-img-large" />
                : <span className="avatar-initial">{name.charAt(0).toUpperCase()}</span>
              }
              <div className="avatar-overlay"><span>📷</span></div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />

            <p className="profile-name-display">{name}</p>
            <p className="profile-email-display">{email}</p>

            {/* Avatar color picker */}
            {!avatarImg && (
              <div className="avatar-color-row">
                <p className="avatar-color-label">Avatar Color</p>
                <div className="avatar-colors">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      className={`avatar-color-dot ${avatarBg === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => setAvatarBg(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {avatarImg && (
              <button className="avatar-remove-btn" onClick={() => setAvatarImg(null)}>
                Remove Photo
              </button>
            )}
          </div>

          {/* ── Right: Forms ── */}
          <div className="profile-forms">

            {/* Account Info — read-only */}
            <section className="profile-section">
              <div className="profile-section-header">
                <span className="profile-section-icon">👤</span>
                <div>
                  <h2 className="profile-section-title">Account Information</h2>
                  <p className="profile-section-sub">Your name and email on this account</p>
                </div>
              </div>

              <div className="profile-fields">
                <div className="profile-field-row">
                  <div className="profile-field">
                    <label className="field-label">Full Name</label>
                    <input
                      className="field-input field-readonly"
                      type="text"
                      value={name}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                  <div className="profile-field">
                    <label className="field-label">Email Address</label>
                    <input
                      className="field-input field-readonly"
                      type="email"
                      value={email}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                </div>
                <p className="field-readonly-note">
                  🔒 Account details cannot be changed here. Contact support if you need to update them.
                </p>
              </div>
            </section>

            {/* Change Password */}
            <section className="profile-section">
              <div className="profile-section-header">
                <span className="profile-section-icon">🔒</span>
                <div>
                  <h2 className="profile-section-title">Change Password</h2>
                  <p className="profile-section-sub">Update your password to keep your account secure</p>
                </div>
              </div>

              <div className="profile-fields">
                <div className="profile-field">
                  <label className="field-label">Current Password</label>
                  <div className="field-pw-wrap">
                    <input
                      className="field-input"
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      placeholder="Enter current password"
                      disabled={pwLoading}
                    />
                    <button className="pw-toggle" onClick={() => setShowCurrent(v => !v)} type="button">
                      {showCurrent ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label className="field-label">New Password</label>
                    <div className="field-pw-wrap">
                      <input
                        className="field-input"
                        type={showNew ? "text" : "password"}
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        placeholder="Min. 8 characters"
                        disabled={pwLoading}
                      />
                      <button className="pw-toggle" onClick={() => setShowNew(v => !v)} type="button">
                        {showNew ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  <div className="profile-field">
                    <label className="field-label">Confirm New Password</label>
                    <div className="field-pw-wrap">
                      <input
                        className="field-input"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPw}
                        onChange={e => setConfirmPw(e.target.value)}
                        placeholder="Repeat new password"
                        disabled={pwLoading}
                      />
                      <button className="pw-toggle" onClick={() => setShowConfirm(v => !v)} type="button">
                        {showConfirm ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password strength bar */}
                {pwStrength && (
                  <div className="pw-strength">
                    <div className="pw-strength-bar">
                      <div
                        className="pw-strength-fill"
                        style={{ width: pwStrength.width, background: pwStrength.color }}
                      />
                    </div>
                    <span className="pw-strength-label">{pwStrength.label}</span>
                  </div>
                )}
              </div>

              <div className="profile-section-footer">
                {pwError   && <span className="profile-error">⚠ {pwError}</span>}
                {pwSuccess && <span className="profile-success">✓ {pwSuccess}</span>}
                <button
                  className="profile-save-btn"
                  onClick={handleChangePassword}
                  disabled={pwLoading}
                >
                  {pwLoading ? "Updating…" : "Update Password"}
                </button>
              </div>
            </section>

            {/* Sign Out */}
            <section className="profile-section danger-zone">
              <div className="profile-section-header">
                <span className="profile-section-icon">⚠️</span>
                <div>
                  <h2 className="profile-section-title">Sign Out</h2>
                  <p className="profile-section-sub">Sign out from all devices</p>
                </div>
              </div>
              <div className="profile-section-footer" style={{ borderTop: "none", paddingTop: 0 }}>
                <button className="profile-logout-btn" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;