import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send reset link");
      } else {
        setMessage(data.message || "Reset link sent successfully");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-icon">⚡</span>
          <span className="login-brand-name">AI Toolkit Hub</span>
        </div>

        <h1 className="login-headline">
          Forgot
          <br />
          Password?
        </h1>

        <p className="login-subtext">
          Enter your email and we’ll send you a reset link.
        </p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Reset password</h2>

          {message && <div className="reg-success">{message}</div>}
          {error && <div className="login-error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Send Reset Link"}
            </button>
          </form>

          <p className="login-register-bottom">
            Back to <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;