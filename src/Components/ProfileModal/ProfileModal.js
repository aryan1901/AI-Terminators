import React, { useState, useEffect, useRef } from "react";
import "./ProfileModal.css";
import { API_BASE, authHeaders } from "../../utils/api";

const ProfileModal = ({ isOpen, onClose, name = "User", email = "" }) => {
  const [activeTab, setActiveTab] = useState("info");

  // Password fields
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError,     setPwError]     = useState("");
  const [pwSuccess,   setPwSuccess]   = useState("");
  const [pwLoading,   setPwLoading]   = useState(false);

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwError(""); setPwSuccess("");
      setActiveTab("info");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    if (!currentPw)          return setPwError("Please enter your current password.");
    if (newPw.length < 8)    return setPwError("New password must be at least 8 characters.");
    if (newPw !== confirmPw) return setPwError("Passwords do not match.");
    if (newPw === currentPw) return setPwError("New password must differ from current password.");

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
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setPwSuccess("Password updated successfully!");
        setTimeout(() => setPwSuccess(""), 3500);
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
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
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="pm-header-name">{name}</p>
              <p className="pm-header-email">{email}</p>
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

          {/* ── Profile Tab — read-only ── */}
          {activeTab === "info" && (
            <div className="pm-section">
              <div className="pm-field">
                <label className="pm-label">Full Name</label>
                <input
                  className="pm-input pm-input-readonly"
                  type="text"
                  value={name}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div className="pm-field">
                <label className="pm-label">Email Address</label>
                <input
                  className="pm-input pm-input-readonly"
                  type="email"
                  value={email}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <p className="pm-readonly-note">
                🔒 Account details cannot be changed here. Contact support if you need to update them.
              </p>
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
                    disabled={pwLoading}
                  />
                  <button
                    className="pm-pw-toggle"
                    onClick={() => setShowCurrent(v => !v)}
                    type="button"
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
                    disabled={pwLoading}
                  />
                  <button
                    className="pm-pw-toggle"
                    onClick={() => setShowNew(v => !v)}
                    type="button"
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
                    disabled={pwLoading}
                  />
                  <button
                    className="pm-pw-toggle"
                    onClick={() => setShowConfirm(v => !v)}
                    type="button"
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Security tips */}
              <div className="pm-security-tips">
                <p className="pm-tips-title">🛡️ Password Tips</p>
                <ul className="pm-tips-list">
                  <li className={newPw.length >= 8          ? "met" : ""}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(newPw)        ? "met" : ""}>One uppercase letter</li>
                  <li className={/[0-9]/.test(newPw)        ? "met" : ""}>One number</li>
                  <li className={/[^A-Za-z0-9]/.test(newPw) ? "met" : ""}>One special character</li>
                </ul>
              </div>

              <div className="pm-footer">
                {pwError   && <span className="pm-error">⚠ {pwError}</span>}
                {pwSuccess && <span className="pm-success">✓ {pwSuccess}</span>}
                <button
                  className="pm-save-btn"
                  onClick={handleChangePassword}
                  disabled={pwLoading}
                >
                  {pwLoading ? "Updating…" : "Update Password"}
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