# ⚡ AI Toolkit Hub — Frontend

A React-based web application providing a suite of AI-powered language tools: translation, summarization, flashcard generation, voice translation, and text-to-speech.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- The [AI Toolkit Hub backend](../backend) running (default: `http://localhost:5001`)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (see section below)
cp .env.example .env

# 3. Start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

All configuration lives in a `.env` file in the project root. **Never commit this file** — add it to `.gitignore`.

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE` | `http://localhost:5001/api` | Base URL for the Express backend |
| `REACT_APP_MYMEMORY_API_URL` | `https://api.mymemory.translated.net` | MyMemory API used by Voice Translator |

### Example `.env`

```env
REACT_APP_API_BASE=http://localhost:5001/api
REACT_APP_MYMEMORY_API_URL=https://api.mymemory.translated.net
```

> **Note:** After editing `.env`, restart the dev server with `npm start` — React does not hot-reload env changes.

### Production

Set these variables in your hosting platform's environment config (Vercel, Netlify, AWS, etc.) instead of committing a `.env` file.

```env
REACT_APP_API_BASE=https://your-api.yourdomain.com/api
REACT_APP_MYMEMORY_API_URL=https://api.mymemory.translated.net
```

---

## 📁 Project Structure

```
src/
├── App.js                          # Routes and auth guard
├── index.js                        # React entry point
├── utils/
│   ├── api.js                      # API_BASE, authHeaders(), getUser()
│   └── trackUsage.js               # Usage event tracking helper
├── Components/
│   ├── AvatarDropdown/             # Topbar avatar + dropdown menu
│   └── ProfileModal/               # Profile & password modal
└── Pages/
    ├── Login/
    │   ├── Login.js
    │   ├── ForgotPassword.js
    │   └── ResetPassword.js
    ├── Registration/
    ├── Dashboard/
    ├── Translator/
    ├── Summarizer/
    ├── Flashcards/
    ├── VoiceTranslator/
    ├── TTS/
    └── Profile/
```

---

## 🛠 Available Scripts

| Script | Description |
|---|---|
| `npm start` | Run dev server at `localhost:3000` |
| `npm run build` | Production build to `build/` |
| `npm test` | Run tests in watch mode |
| `npm run eject` | Eject CRA config (irreversible) |

---

## 🔐 Authentication

- Login stores a JWT in `localStorage` (Remember Me) or `sessionStorage` (session only).
- Protected routes redirect to `/login` if no token is found.
- The `authHeaders()` utility in `src/utils/api.js` automatically attaches the token to every API request.

---

## 🧰 Tools

| Tool | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Usage stats, charts, recent activity |
| Translator | `/tools/translator` | Text translation across 18 languages |
| Summarizer | `/tools/summarizer` | Summarize text in paragraph, bullet, or TL;DR style |
| Flashcards | `/tools/flashcards` | Generate flashcards from a PDF upload |
| Voice Translator | `/tools/voice-translator` | Speak and get real-time translations |
| Text-to-Speech | `/tools/tts` | Convert text to spoken audio |

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `recharts` | Dashboard charts |
| `@mui/icons-material` | Icons (logout, profile) |

---

## 🌐 Deployment

1. Set `REACT_APP_API_BASE` to your production backend URL in your host's env config.
2. Run `npm run build`.
3. Deploy the `build/` folder to any static host (Vercel, Netlify, S3 + CloudFront, etc.).