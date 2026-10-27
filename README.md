# 🎓 Basic English School

An interactive, responsive English language learning application featuring instant native browser audio speech synthesis (TTS), adaptive quizzes, phonics & vocabulary flashcards, and Progressive Web App (PWA) support.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-basicenglish.school-4f46e5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://basicenglish.school)
[![React](https://img.shields.io/badge/React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%20LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Netlify](https://img.shields.io/badge/Hosted%20on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://basicenglish.school)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Overview

**Basic English** ([basicenglish.school](https://basicenglish.school)) is built for language learners worldwide to rapidly master foundational English letters, phonics sounds, high-frequency vocabulary, and everyday survival phrases. 

Built with modern web performance in mind, it provides instant speech pronunciation via the native Web Speech API, an adaptive quiz engine with fuzzy string matching, recap summaries, and offline PWA capabilities.

* 🚀 **Primary Domain**: [https://basicenglish.school](https://basicenglish.school)
* 🔄 **Redirect Domain**: `basicenglish.academy` automatically redirects (301 permanent) to `basicenglish.school` to consolidate search ranking and user progress.

---

## 🚀 Key Features

* **🔊 Native Web Speech Synthesis**: Instant, crystal-clear pronunciation of English letters, phonics example words, phrases, and vocabulary using the device's native TTS engine (supporting both natural 0.9x and slowed-down 0.7x speeds with US/UK voice preference). Zero audio file downloads or bandwidth delay!
* **🔤 Alphabet & Phonics System**: Complete A–Z curriculum featuring letter names, phonetic sounds, example words, and interactive pronunciation playback.
* **🎯 Adaptive Quiz Engine with Fuzzy Matching**:
  * Employs Levenshtein-distance string matching to forgive minor typos while learning spelling.
  * Real-time answer validation, synonym checking, and recap screen upon completion with detailed score breakdowns.
  * Card reveal modes ("Tap to reveal/hide") for flashcard self-testing.
* **📱 Progressive Web App (PWA)**: Installable on iOS, Android, and Desktop with offline caching via Workbox and modern Service Workers.
* **🎨 Modern Educational Aesthetic**: Styled with an inviting Indigo and Sky Blue color palette, clean typography (`Plus Jakarta Sans` & `Outfit`), and smooth micro-interactions.
* **⚡ Dual-App Local Development**: Configured to run on local port `5174` so it can be developed and run simultaneously alongside sister applications (e.g., Basic Russian on `5173`).

---

## 🤖 Built with Google Antigravity & Gemini

This project is actively developed and architected using **Google Antigravity** paired with **Google Gemini / Advanced Agentic AI**.

* **Agentic Pair Programming**: Used Antigravity's multi-step autonomous workflows to scaffold and adapt features, calibrate Vitest testing suites, and manage continuous deployment.
* **Architectural Velocity**: Demonstrates cutting-edge AI-accelerated software engineering practices—accelerating iteration speed while maintaining strict code quality, type safety, and testing standards.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
* **Build Tool & Bundler**: Vite 6, `@vitejs/plugin-react`, `vite-plugin-pwa`
* **Testing**: Vitest, React Testing Library, JSDOM (100% test pass rate)
* **Audio**: Native Web Speech API (`SpeechSynthesisUtterance`) with automatic voice discovery
* **Deployment & Hosting**: Netlify (Automated CI/CD from `main`, 301 redirects, security headers, SSL)

---

## 💻 Local Development

### Prerequisites
* **Node.js**: `v20.x` or `v22.x` (Active LTS)
* **npm**: `v10.x` or later

### Setup & Running
```bash
# 1. Clone the repository
git clone https://github.com/JohnBendfeldt/basic-english.git
cd basic-english

# 2. Install dependencies
npm install

# 3. Start development server (runs on http://localhost:5174)
npm start

# 4. Run automated test suite
npm test

# 5. Production build & preview
npm run build
npm run preview
```

---

## 🌐 Deployment Configuration

The application is configured for deployment on **Netlify**:

* **Build command**: `npm run build`
* **Publish directory**: `dist`
* **Primary Custom Domain**: `basicenglish.school`
* **Redirect Alias**: `basicenglish.academy` (auto-redirects to `basicenglish.school` via `netlify.toml`)

---

## 👤 Author

**John Bendfeldt**  
* GitHub: [@JohnBendfeldt](https://github.com/JohnBendfeldt)  
* Live App: [basicenglish.school](https://basicenglish.school)  

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
