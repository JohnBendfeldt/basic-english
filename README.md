# 🎓 Basic English School

An interactive, responsive English language learning application featuring pre-rendered Microsoft Neural TTS audio with native Web Speech synthesis fallback, adaptive quizzes, phonics & vocabulary flashcards, cloud progress sync, and Progressive Web App (PWA) support.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-basicenglish.school-4f46e5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://basicenglish.school)
[![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%20LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-101_Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Netlify](https://img.shields.io/badge/Hosted%20on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://basicenglish.school)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Overview

**Basic English** ([basicenglish.school](https://basicenglish.school)) is built for language learners worldwide to rapidly master foundational English letters, phonics sounds, numbers & time, high-frequency vocabulary, and everyday survival phrases.

Built with modern web performance and security in mind, it pairs pre-rendered neural pronunciation audio with automatic browser Web Speech API fallback, an adaptive quiz engine with fuzzy string matching, spaced-repetition progress tracking, optional OAuth cloud sync, and offline PWA capabilities.

* 🚀 **Primary Domain**: [https://basicenglish.school](https://basicenglish.school)
* 🔄 **Redirect Domain**: `basicenglish.academy` automatically redirects (`301` permanent) to `basicenglish.school` to consolidate search ranking and user progress.
* 🌐 **Multi-Language Hub**: Part of [Basic Language School](https://basiclanguage.school) (15+ world languages across 210 bidirectional pairs).

---

## 🚀 Key Features

* **🔊 Neural Audio + Web Speech Fallback**: Instant, crystal-clear pronunciation across the entire curriculum using pre-rendered Microsoft Neural TTS (`en-US-JennyNeural`) MP3 assets, backed by automatic fallback to the device's native Web Speech API (`SpeechSynthesisUtterance`) with iOS WebKit audio unlock and adjustable playback speed (`1.0x` & `0.7x`).
* **🔤 Complete Beginner Curriculum**:
  * **Alphabet & Phonics (`/alphabet`)**: Complete A–Z letters, phonetic sounds, example words, and dual-speed audio playback.
  * **Basic Phrases (`/phrases`)**: Greetings, polite expressions, introductions, and everyday survival phrases.
  * **Numbers & Time (`/numbers`)**: Counting from 0 to 100+ and telling time in English.
  * **Common Words (`/words`)**: High-frequency everyday vocabulary with flashcard tap-to-reveal self-testing.
* **🎯 Adaptive Quiz Engine (`/quiz`)**:
  * Multiple quiz modes (definition-to-word, listening/audio-to-word, phonics, and mixed categories) with Levenshtein-distance fuzzy matching to forgive minor spelling typos.
  * Real-time answer validation, synonym checking, non-leaking hints, and end-of-quiz recap breakdowns.
  * Spaced-repetition mastery tracking (levels `0`–`5`) that prioritizes unmastered and missed items.
* **☁️ Guest-First Progress & OAuth Cloud Sync**:
  * **100% Playable Without Login**: Guest progress is persisted locally in `localStorage` and viewable anytime in the **My Stats** dashboard.
  * **1-Click Single Sign-On**: Optional sign-in via **Google**, **Microsoft Entra ID**, or **GitHub** (powered by Supabase Auth OAuth 2.0 / OIDC) automatically migrates guest progress to PostgreSQL and syncs across devices.
* **📱 Progressive Web App (PWA)**: Installable on iOS, Android, and Desktop via `vite-plugin-pwa` + Workbox (`NetworkFirst` HTML navigation + `StaleWhileRevalidate` media caching) for instant updates and offline study.

---

## 🔒 Security Architecture

* **Strict Content Security Policy (CSP)**: Enforces `script-src 'self'` (no `'unsafe-inline'` or `'unsafe-eval'`), `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `worker-src 'self'`, and `upgrade-insecure-requests`.
* **OWASP HTTP Headers**: Configured in [`netlify.toml`](netlify.toml) with HSTS (`max-age=31536000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive `Permissions-Policy`.
* **Database Row Level Security (RLS) & Constraints**: PostgreSQL tables (`public.quiz_sessions`, `public.word_progress`) revoke `anon` access, enforce `auth.uid() = user_id` RLS policies across all `SELECT`/`INSERT`/`UPDATE`/`DELETE` operations, and validate score/mastery bounds via SQL `CHECK` constraints (see [`docs/schema.sql`](docs/schema.sql)).
* **Zero Password Handling & Safe Client Storage**: Passwordless federated OAuth 2.0 / OIDC sign-in, strict `https:` validation on Supabase endpoints and OAuth avatar URLs (`referrerPolicy="no-referrer"`), and prototype-pollution-safe `localStorage` parsing.

*Detailed system architecture and database design are documented in [`docs/BACKEND_PLAN.md`](docs/BACKEND_PLAN.md).*

---

## 🤖 Built with Google Antigravity & Gemini

This project is actively developed and architected using **Google Antigravity** paired with **Google Gemini / Advanced Agentic AI**.

* **Agentic Pair Programming**: Used Antigravity's autonomous multi-step workflows to upgrade to React 19, harden security headers and RLS schemas, calibrate Vitest suites, and manage continuous deployment.
* **Architectural Velocity**: Demonstrates AI-accelerated software engineering while maintaining strict TypeScript type safety, test coverage, and security standards.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript 5.9, Modern CSS (CSS Variables, Flexbox, CSS Grid)
* **Build Tool & PWA**: Vite 6, `@vitejs/plugin-react`, `vite-plugin-pwa` v2 (Workbox)
* **Auth & Cloud Database**: Supabase Auth (Google, Microsoft Entra ID, GitHub OAuth) + Supabase PostgreSQL with Row Level Security
* **Testing**: Vitest 5, React Testing Library 16, JSDOM
* **Audio**: Pre-rendered Microsoft Neural TTS (`edge-tts`) MP3s + Native Web Speech API fallback
* **Deployment & Hosting**: Netlify (Automated CI/CD from `main`, `301` domain redirects, OWASP security headers, SSL)

---

## 💻 Local Development

### Prerequisites
* **Node.js**: `v22.x` LTS or later
* **npm**: `v10.x` or later

### Setup & Running
```bash
# 1. Clone the repository
git clone https://github.com/JohnBendfeldt/basic-english.git
cd basic-english

# 2. Install dependencies
npm install

# 3. (Optional) Configure Supabase for OAuth & Cloud Sync
# Without .env.local, the app runs seamlessly in offline Guest Mode.
cp .env.example .env.local

# 4. Start development server (runs on http://localhost:5174 alongside sister apps)
npm run dev   # or: npm start

# 5. Run automated test suite
npm test

# 6. Production typecheck, build & preview
npm run build
npm run preview
```

### Regenerating Curriculum Audio (Optional)
```bash
# Requires Python 3 and edge-tts
npm run generate-audio
```

---

## 🌐 Deployment Configuration

The application is configured for deployment on **Netlify** via [`netlify.toml`](netlify.toml):

* **Build command**: `npm run build` (`tsc && vite build`)
* **Publish directory**: `dist`
* **Environment variables** (for cloud sync): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
* **Primary Custom Domain**: `basicenglish.school`
* **Redirect Alias**: `basicenglish.academy` (auto-redirects `301` to `basicenglish.school`)

---

## 👤 Author

**John Bendfeldt**  
* GitHub: [@JohnBendfeldt](https://github.com/JohnBendfeldt)  
* Live App: [basicenglish.school](https://basicenglish.school)  
* Contact: [dev@basicenglish.school](mailto:dev@basicenglish.school)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
