import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Registration.css";

const Registration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

      try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ api: data.message || "Registration failed. Try again." });
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting to login...");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErrors({ api: "Server error. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", level: 1 };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Medium", level: 2 };
    return { label: "Strong", level: 3 };
  };

  const strength = getPasswordStrength();

  return (
    <div className="reg-wrapper">
      <div className="reg-left">
        <div className="reg-brand">
          <span className="reg-brand-icon">⚡</span>
          <span className="reg-brand-name">AI Toolkit Hub</span>
        </div>
        <h1 className="reg-headline">
          One account.<br />All AI tools.
        </h1>
        <p className="reg-subtext">
          Translate, summarize, generate flashcards, and more — all in one place.
        </p>
        <ul className="reg-features">
          <li>Language Translator</li>
          <li>Text Summarizer</li>
          <li>PDF Flashcard Generator</li>
          <li>Live Voice Translator</li>
          <li>Text-to-Speech</li>
        </ul>
      </div>

      <div className="reg-right">
        <div className="reg-card">
          <h2 className="reg-title">Create your account</h2>

          {successMessage && (
            <div className="reg-success">{successMessage}</div>
          )}

          {errors.api && (
            <div className="reg-error-banner">{errors.api}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="reg-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? "input-error" : ""}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="reg-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="reg-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}

              {strength && (
                <div className="strength-bar-wrapper">
                  <div className={`strength-bar level-${strength.level}`}>
                    <span></span><span></span><span></span>
                  </div>
                  <span className={`strength-label s${strength.level}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="reg-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="reg-btn" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : "Create Account"}
            </button>

          </form>

          <p className="reg-login-bottom">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Registration;