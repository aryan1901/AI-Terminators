import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ─── Page Imports ───────────────────────────────────────
import Registration from "./Pages/Registration/Registration.js";
import Login from "./Pages/Login/Login.js";
import Dashboard from "./Pages/Dashboard/Dashboard.js"
import { motion } from "framer-motion";
import PDFFlashCard from "./Pages/PDFFlashCards/PDFFlashCards.js"
import TextToSpeech from "./Pages/TextToSpeech/TextToSpeech";


// ─── Auth Guard ──────────────────────────────────────────
const isAuthenticated = () => {
  return (
    localStorage.getItem("token") !== null ||
    sessionStorage.getItem("token") !== null
  );
};

const handleFileUpload = (file) => {
  if (!file) return;

  console.log("Uploaded PDF:", file.name);

  // later we send this to backend
};
// ─── Protected Route ─────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ─── App ─────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Default: go to register ── */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* ── Public Routes ── */}
        <Route path="/register" element={<Registration />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tools/flashcards" element={<PDFFlashCard />} />
        <Route path="/tools/tts" element={<TextToSpeech />} />


        {/* ── Protected Routes (uncomment as you build) ── */}
        {/*
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tools/translator"
          element={<ProtectedRoute><Translator /></ProtectedRoute>}
        />
        <Route
          path="/tools/summarizer"
          element={<ProtectedRoute><Summarizer /></ProtectedRoute>}
        />
        <Route
          path="/tools/flashcards"
          element={<ProtectedRoute><Flashcards /></ProtectedRoute>}
        />
        <Route
          path="/tools/voice-translator"
          element={<ProtectedRoute><VoiceTranslator /></ProtectedRoute>}
        />
        <Route
          path="/tools/tts"
          element={<ProtectedRoute><TTS /></ProtectedRoute>}
        />
        */}

        {/* ── 404 Fallback ── */}
        <Route
          path="*"
          element={
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              background: "#0a0a0f",
              color: "#e2e8f0",
              fontFamily: "DM Sans, sans-serif",
              gap: "12px"
            }}>
              <h1 style={{ fontSize: "4rem", color: "#63b3ed" }}>404</h1>
              <p style={{ color: "#5a6a7a" }}>Page not found.</p>
              <a href="/register" style={{ color: "#63b3ed", textDecoration: "none" }}>← Go Home</a>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;