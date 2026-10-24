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

const getSectionFromPath = (): string => {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return PATH_TO_SECTION[path] || 'alphabet';
};

const updateMeta = (section: string) => {
  const meta = SECTION_META[section] || SECTION_META.alphabet;
  document.title = meta.title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', meta.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `https://basicenglish.school${SECTION_TO_PATH[section] || '/alphabet'}`);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const newPath = SECTION_TO_PATH[section] || '/alphabet';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ section }, '', newPath);
    }
    updateMeta(section);
    
    setActiveSection(section);
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveSection = () => {
    if (!speechInitialized) {
      return (
        <div className="section loading-section">
          <h2>Loading Speech Functionality</h2>
          <p className="loading-message">Initializing voice capabilities. This may take a moment...</p>
          <div className="loading-spinner"></div>
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
      <header>
        <div className="header-content">
          <h1 onClick={() => handleSectionChange('alphabet')} style={{ cursor: 'pointer' }} title="Return to alphabet lessons">
            <svg className="english-emblem" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Basic English logo" role="img" style={{ width: '28px', height: '28px', marginRight: '8px', verticalAlign: 'middle' }}>
              <circle cx="18" cy="18" r="17" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2"/>
              <path d="M18 9L8 14L18 19L28 14L18 9Z" fill="#FBBF24"/>
              <path d="M12 16.5V23C12 25 14.5 27 18 27C21.5 27 24 25 24 23V16.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
              <path d="M28 14.5V21" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Basic English
          </h1>
          <div className="header-actions">
            {installPrompt && (
              <button onClick={handleInstallClick} className="install-button">
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
      
      <main tabIndex={-1}>
        {renderActiveSection()}
      </main>
      
      <BottomNavigation 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange} 
      />
      
      <footer>
        <p>
          © {new Date().getFullYear()} Basic Russian Learning ·{' '}
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
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;