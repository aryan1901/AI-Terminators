import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Login.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Password reset failed");
      } else {
        setMessage(data.message || "Password reset successful");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-wrapper">
      <div className="reg-left">
        <div className="reg-brand">
          <span className="reg-brand-icon">⚡</span>
          <span className="reg-brand-name">AI Toolkit Hub</span>
        </div>
        <h1 className="reg-headline">Set a new<br />password</h1>
        <p className="reg-subtext">
          Enter your new password below.
        </p>
      </div>

      <div className="reg-right">
        <div className="reg-card">
          <h2 className="reg-title">Reset Password</h2>

          {message && <div className="reg-success">{message}</div>}
          {error && <div className="reg-error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="reg-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Reset Password"}
            </button>
          </form>

          <p className="reg-login-bottom">
            Back to <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;