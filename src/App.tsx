import React, { useState, useEffect } from 'react';
import './App.css';
import Alphabet from './components/Alphabet';
import Phrases from './components/Phrases';
import Navigation from './components/Navigation';
import Quiz from './components/Quiz';
import BottomNavigation from './components/BottomNavigation';
import UserMenu from './components/UserMenu';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import englishData from './data/englishData';
import { initVoices, cancelAllSpeech } from './utils/speech';
import { scrollToTop } from './utils/useModalAccessibility';

// Map URL paths to section IDs and SEO metadata
const SECTION_META: Record<string, { title: string; description: string }> = {
  alphabet: {
    title: 'English Alphabet & Phonics | Basic English',
    description: 'Learn the 26 letters of the English alphabet with phonics, pronunciation guides, and audio examples. Free interactive English alphabet chart for beginners.',
  },
  phrases: {
    title: 'Basic English Phrases | Basic English',
    description: 'Learn essential English phrases for beginners with native audio pronunciation. Greetings, introductions, everyday polite expressions, and travel essentials.',
  },
  numbers: {
    title: 'English Numbers & Time | Basic English',
    description: 'Learn English numbers and how to tell time with native audio pronunciation. Count in English from 0 to 100 and beyond. Free interactive number lessons.',
  },
  words: {
    title: 'Common English Words | Basic English',
    description: 'Learn high-frequency English vocabulary with audio pronunciation and contextual definitions. Build your English vocabulary with everyday words.',
  },
  quiz: {
    title: 'English Quiz | Basic English',
    description: 'Test your English knowledge with interactive quizzes covering alphabet, phonics, vocabulary, numbers, and everyday phrases. Free English language practice.',
  },
  privacy: {
    title: 'Privacy Policy | Basic English',
    description: 'Privacy Policy for Basic English (basicenglish.school / basicenglish.academy). Learn how we protect your privacy, study progress, and data.',
  },
  terms: {
    title: 'Terms of Service | Basic English',
    description: 'Terms of Service for Basic English (basicenglish.school / basicenglish.academy). Free English language learning application terms and guidelines.',
  },
};

const PATH_TO_SECTION: Record<string, string> = {
  '/': 'alphabet',
  '/alphabet': 'alphabet',
  '/phrases': 'phrases',
  '/numbers': 'numbers',
  '/words': 'words',
  '/quiz': 'quiz',
  '/privacy': 'privacy',
  '/terms': 'terms',
};

const SECTION_TO_PATH: Record<string, string> = {
  alphabet: '/alphabet',
  phrases: '/phrases',
  numbers: '/numbers',
  words: '/words',
  quiz: '/quiz',
  privacy: '/privacy',
  terms: '/terms',
};

const hasOwn = (obj: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const getSectionFromPath = (): string => {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return hasOwn(PATH_TO_SECTION, path) ? PATH_TO_SECTION[path] : 'alphabet';
};

const updateMeta = (section: string) => {
  const safeSection = hasOwn(SECTION_META, section) ? section : 'alphabet';
  const meta = SECTION_META[safeSection];
  const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const canonicalUrl =
    currentPath === '/' && safeSection === 'alphabet'
      ? 'https://basicenglish.school/'
      : `https://basicenglish.school${hasOwn(SECTION_TO_PATH, section) ? SECTION_TO_PATH[section] : '/alphabet'}`;

  document.title = meta.title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', meta.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', meta.title);
  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', meta.description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', canonicalUrl);
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(getSectionFromPath);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speechInitialized, setSpeechInitialized] = useState(false);

  // Handle browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const section = getSectionFromPath();
      setActiveSection(section);
      updateMeta(section);
      scrollToTop();
    };
    window.addEventListener('popstate', onPopState);
    // Set initial meta
    updateMeta(activeSection);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const initSpeech = async () => {
      try {
        await initVoices();
        setSpeechInitialized(true);
      } catch (err) {
        console.error('Failed to initialize speech:', err);
        setSpeechInitialized(true);
      }
    };
    
    initSpeech();
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;

    (installPrompt as any).prompt();

    (installPrompt as any).userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
      } else {
      }
      setInstallPrompt(null);
    });
  };

  const _toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSectionChange = (section: string) => {
    // Cancel any ongoing speech or audio when changing sections
    cancelAllSpeech();
    
    // Stop any potentially playing audio elements
    document.querySelectorAll('audio').forEach(audio => {
      try {
        audio.pause();
      } catch (e) {
        console.warn('Error pausing audio:', e);
      }
    });
    
    // Update URL without full page reload
    const newPath = hasOwn(SECTION_TO_PATH, section) ? SECTION_TO_PATH[section] : '/alphabet';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ section }, '', newPath);
    }
    updateMeta(section);
    
    setActiveSection(section);
    closeMenu();
    scrollToTop();
  };

  const renderActiveSection = () => {
    if (!speechInitialized) {
      return (
        <div className="section loading-section" role="status" aria-live="polite">
          <h2>Loading Speech Functionality</h2>
          <p className="loading-message">Initializing voice capabilities. This may take a moment...</p>
          <div className="loading-spinner" aria-hidden="true"></div>
        </div>
      );
    }
    
    switch (activeSection) {
      case 'alphabet':
        return <Alphabet data={englishData.alphabet} />;
      case 'phrases':
        return <Phrases 
          data={englishData.basicPhrases} 
          title="Basic Phrases" 
          contentType="phrases"
        />;
      case 'numbers':
        return <Phrases 
          data={englishData.numbers} 
          title="Numbers & Time" 
          contentType="numbers"
        />;
      case 'words':
        return <Phrases 
          data={englishData.commonWords} 
          title="Common Words" 
          contentType="words"
        />;
      case 'quiz':
        return <Quiz data={{
          alphabet: englishData.alphabet.map(item => ({
            character: item.letter,
            pronunciation: item.pronunciation,
            example: item.example,
            word: item.word,
            meaning: item.meaning,
          })),
          basicPhrases: englishData.basicPhrases,
          numbers: englishData.numbers,
          commonWords: englishData.commonWords
        }} />;
      case 'privacy':
        return <PrivacyPolicy onNavigate={handleSectionChange} />;
      case 'terms':
        return <TermsOfService onNavigate={handleSectionChange} />;
      default:
        return <Alphabet data={englishData.alphabet} />;
    }
  };

  return (
    <div className="app">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          const mainEl = document.getElementById('main-content');
          if (mainEl) {
            e.preventDefault();
            mainEl.focus();
          }
        }}
      >
        Skip to main content
      </a>
      <header>
        <div className="header-content">
          <h1>
            <button
              type="button"
              className="brand-home-button"
              onClick={() => handleSectionChange('alphabet')}
              title="Return to alphabet lessons"
            >
              <svg
                className="app-emblem english-emblem english-flag"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <linearGradient id="enEmblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#312e81" />
                  </linearGradient>
                  <linearGradient id="enGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#enEmblemBg)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                <g transform="translate(5, 5)">
                  <defs>
                    <clipPath id="enFlagClip">
                      <rect x="0" y="0" width="13" height="9" rx="2" />
                    </clipPath>
                  </defs>
                  <rect x="-0.5" y="-0.5" width="14" height="10" rx="2.5" fill="rgba(0, 0, 0, 0.45)" />
                  <rect x="0" y="0" width="13" height="9" rx="2" fill="#ffffff" />
                  <g clipPath="url(#enFlagClip)">
                    <rect x="0" y="0" width="13" height="9" fill="#012169" />
                    <line x1="0" y1="0" x2="13" y2="9" stroke="#ffffff" strokeWidth="2.2" />
                    <line x1="13" y1="0" x2="0" y2="9" stroke="#ffffff" strokeWidth="2.2" />
                    <line x1="0" y1="0" x2="13" y2="9" stroke="#c8102e" strokeWidth="1.1" />
                    <line x1="13" y1="0" x2="0" y2="9" stroke="#c8102e" strokeWidth="1.1" />
                    <rect x="4.8" y="0" width="3.4" height="9" fill="#ffffff" />
                    <rect x="0" y="2.8" width="13" height="3.4" fill="#ffffff" />
                    <rect x="5.5" y="0" width="2" height="9" fill="#c8102e" />
                    <rect x="0" y="3.5" width="13" height="2" fill="#c8102e" />
                  </g>
                  <rect x="0" y="0" width="13" height="9" rx="2" fill="none" stroke="#ffffff" strokeWidth="0.8" />
                </g>
                <g transform="translate(0, 3)">
                  <path d="M24 13L8 20.5L24 28L40 20.5L24 13Z" fill="url(#enGoldGrad)" />
                  <path
                    d="M14 24.5V32C14 35.5 18 38 24 38C30 38 34 35.5 34 32V24.5"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M40 21V30.5" stroke="url(#enGoldGrad)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="40" cy="31.5" r="1.5" fill="url(#enGoldGrad)" />
                </g>
              </svg>
              <span className="brand-title-group">
                <span className="brand-title-main">Basic English</span>
                <span className="brand-parent-tag">by Basic Language School</span>
              </span>
            </button>
          </h1>
          <div className="header-actions">
            <a
              href="https://basiclanguage.school"
              target="_blank"
              rel="noopener noreferrer"
              className="header-action-btn language-hub-pill"
              title="Explore 15+ world languages on Basic Language School"
              aria-label="Explore 15+ world languages on Basic Language School"
            >
              <span aria-hidden="true">🌐</span>
              <span className="hub-pill-text">15+ Languages</span>
            </a>
            {installPrompt && (
              <button type="button" onClick={handleInstallClick} className="install-button">
                Install App
              </button>
            )}
            <UserMenu onNavigate={handleSectionChange} />
          </div>
        </div>
        <Navigation 
          activeSection={activeSection} 
          setActiveSection={handleSectionChange} 
          isOpen={false}
          _onClose={closeMenu}
        />
      </header>
      
      <main id="main-content" tabIndex={-1}>
        {renderActiveSection()}
      </main>
      
      <BottomNavigation 
          activeSection={activeSection} 
          setActiveSection={handleSectionChange} 
      />
      
      <footer>
        <p>
          © {new Date().getFullYear()} Basic English School · Part of{' '}
          <a
            href="https://basiclanguage.school"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Basic Language School
          </a>{' '}
          ·{' '}
          <a
            href="/privacy"
            className="footer-link"
            onClick={(e) => {
              e.preventDefault();
              handleSectionChange('privacy');
            }}
          >
            Privacy Policy
          </a>{' '}
          ·{' '}
          <a
            href="/terms"
            className="footer-link"
            onClick={(e) => {
              e.preventDefault();
              handleSectionChange('terms');
            }}
          >
            Terms of Service
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/JohnBendfeldt/basic-english"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
