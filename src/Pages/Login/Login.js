import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|io|co|us|uk|in|de|fr|jp|au|ca|gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|protonmail\.com)$/i;

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email (e.g. name@gmail.com, name@university.edu).",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // ── TEMPORARY MOCK: Remove when backend is ready ──
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const fakeToken = "test-token-123";
      if (remember) {
        localStorage.setItem("token", fakeToken);
      } else {
        sessionStorage.setItem("token", fakeToken);
      }
      navigate("/dashboard");

      // ── REAL API CALL: Uncomment when backend is ready ──
      // const response = await fetch("http://localhost:5000/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: formData.email, password: formData.password }),
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   setErrors({ api: data.message || "Invalid email or password." });
      // } else {
      //   if (remember) localStorage.setItem("token", data.token);
      //   else sessionStorage.setItem("token", data.token);
      //   navigate("/dashboard");
      // }

    } catch (error) {
      setErrors({ api: "Server error. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  const emailStatus =
    !formData.email ? ""
    : errors.email ? "error"
    : emailTouched && EMAIL_REGEX.test(formData.email) ? "valid"
    : "";

  return (
    <div className="login-wrapper">

      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-icon">⚡</span>
          <span className="login-brand-name">AI Toolkit Hub</span>
        </div>

        <h1 className="login-headline">
          Welcome<br />back.
        </h1>

        <p className="login-subtext">
          Your AI toolkit is waiting. Sign in to continue where you left off.
        </p>

        <div className="login-highlights">
          <div className="highlight-card">
            <span className="highlight-icon">🌐</span>
            <div>
              <p className="highlight-title">50+ Languages</p>
              <p className="highlight-desc">Instant translation across the world</p>
            </div>
          </div>
          <div className="highlight-card">
            <span className="highlight-icon">🃏</span>
            <div>
              <p className="highlight-title">Smart Flashcards</p>
              <p className="highlight-desc">AI-generated from any PDF</p>
            </div>
          </div>
          <div className="highlight-card">
            <span className="highlight-icon">🎙️</span>
            <div>
              <p className="highlight-title">Live Voice Translation</p>
              <p className="highlight-desc">Speak and hear in real time</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-card">

          <h2 className="login-title">Sign in</h2>

          {errors.api && (
            <div className="login-error-banner">{errors.api}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Email ── */}
            <div className="login-field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className={
                    emailStatus === "error" ? "input-error"
                    : emailStatus === "valid" ? "input-valid"
                    : ""
                  }
                  autoComplete="email"
                />
                {emailStatus === "valid" && <span className="input-status-icon valid-icon">✓</span>}
                {emailStatus === "error" && <span className="input-status-icon error-icon">✕</span>}
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
              {!errors.email && formData.email && emailStatus !== "valid" && (
                <span className="field-hint">Accepted: @gmail.com · @yahoo.com · @outlook.com · @university.edu</span>
              )}
            </div>

            {/* ── Password ── */}
            <div className="login-field">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* ── Remember Me ── */}
            <div className="remember-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="remember-checkbox"
                />
                <span className="remember-custom"></span>
                <span className="remember-text">Remember me</span>
              </label>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : "Sign In"}
            </button>

          </form>

          <p className="login-register-bottom">
            New to AI Toolkit Hub? <Link to="/register">Create a free account</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;