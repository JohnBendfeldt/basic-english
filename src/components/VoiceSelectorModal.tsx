import React, { useState, useEffect } from 'react';
import { FaVolumeUp, FaPlay, FaCheck, FaTimes, FaSlidersH, FaMicrophone } from 'react-icons/fa';
import {
  getFriendlyEnglishVoices,
  getBestEnglishVoice,
  setPreferredVoice,
  setPreferredRate,
  setPreferredAccent,
  getPreferredRate,
  getPreferredAccent,
  getBrowserVoiceQualityInfo,
  BrowserVoiceQualityInfo,
  previewVoice,
  scoreVoice,
  EnglishAccent
} from '../utils/browserSpeech';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedURI, setSelectedURI] = useState<string>('');
  const [selectedAccent, setSelectedAccent] = useState<EnglishAccent>(getPreferredAccent());
  const [rate, setRate] = useState<number>(getPreferredRate());
  const [activePreviewURI, setActivePreviewURI] = useState<string | null>(null);
  const [qualityInfo, setQualityInfo] = useState<BrowserVoiceQualityInfo | null>(null);

  // Load voices on mount / open
  useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      const friendly = getFriendlyEnglishVoices();
      setVoices(friendly);

      const best = getBestEnglishVoice();
      if (best) {
        setSelectedURI(best.voiceURI);
      }

      setQualityInfo(getBrowserVoiceQualityInfo());
    };

    loadVoices();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter voices by selected tab
  const filteredVoices = voices.filter(v => {
    if (selectedAccent === 'en-US') return v.lang.toLowerCase().replace('_', '-').startsWith('en-us');
    if (selectedAccent === 'en-GB') return v.lang.toLowerCase().replace('_', '-').startsWith('en-gb');
    if (selectedAccent === 'en-AU') return v.lang.toLowerCase().replace('_', '-').startsWith('en-au');
    return true;
  });

  const handleSelectVoice = (voice: SpeechSynthesisVoice) => {
    setSelectedURI(voice.voiceURI);
    setPreferredVoice(voice.voiceURI);
  };

  const handlePreview = (voice: SpeechSynthesisVoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePreviewURI(voice.voiceURI);
    previewVoice(
      voice, 
      "Hello! Welcome to Basic English. I will be your pronunciation guide.",
      rate
    );
    setTimeout(() => {
      setActivePreviewURI(null);
    }, 3200);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    setPreferredRate(newRate);
  };

  const handleAccentChange = (accent: EnglishAccent) => {
    setSelectedAccent(accent);
    setPreferredAccent(accent);
    // Find best voice for this accent
    const match = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(accent.toLowerCase()));
    if (match) {
      setSelectedURI(match.voiceURI);
      setPreferredVoice(match.voiceURI);
    }
  };

  const getVoiceBadge = (voice: SpeechSynthesisVoice) => {
    const score = scoreVoice(voice);
    if (score >= 450) return <span className="voice-badge neural">✨ Studio Neural</span>;
    if (score >= 280) return <span className="voice-badge natural">🌟 Natural</span>;
    if (score >= 150) return <span className="voice-badge friendly">Friendly</span>;
    return <span className="voice-badge standard">Standard</span>;
  };

  return (
    <div className="voice-modal-backdrop" onClick={onClose}>
      <div 
        className="voice-modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="voice-modal-title"
        aria-modal="true"
      >
        <div className="voice-modal-header">
          <div className="voice-modal-title-group">
            <div className="voice-icon-circle">
              <FaMicrophone />
            </div>
            <div>
              <h2 id="voice-modal-title">Pronunciation & Voice</h2>
              <p className="voice-modal-subtitle">Choose the friendliest native voice for your lessons</p>
            </div>
          </div>
          <button 
            type="button" 
            className="voice-modal-close" 
            onClick={onClose}
            aria-label="Close voice settings"
          >
            <FaTimes />
          </button>
        </div>

        {/* Accent Selector Tabs */}
        <div className="voice-accent-tabs">
          <button 
            type="button"
            className={`accent-tab ${selectedAccent === 'en-US' ? 'active' : ''}`}
            onClick={() => handleAccentChange('en-US')}
          >
            🇺🇸 American English
          </button>
          <button 
            type="button"
            className={`accent-tab ${selectedAccent === 'en-GB' ? 'active' : ''}`}
            onClick={() => handleAccentChange('en-GB')}
          >
            🇬🇧 British English
          </button>
          <button 
            type="button"
            className={`accent-tab ${selectedAccent === 'en-AU' ? 'active' : ''}`}
            onClick={() => handleAccentChange('en-AU')}
          >
            🇦🇺 Australian English
          </button>
        </div>

        {/* Browser Voice Quality Recommendation Banner */}
        {qualityInfo && qualityInfo.tip && (
          <div className={`voice-quality-banner ${qualityInfo.isLowQuality ? 'low-quality' : ''}`}>
            <span className="voice-quality-icon" aria-hidden="true">💡</span>
            <span className="voice-quality-text">
              <strong>Browser Voice Note:</strong> {qualityInfo.tip}
            </span>
          </div>
        )}

        {/* Speed / Pace Selector */}
        <div className="voice-rate-section">
          <div className="rate-label">
            <FaSlidersH />
            <span>Speaking Pace</span>
          </div>
          <div className="rate-chips">
            <button 
              type="button"
              className={`rate-chip ${rate === 0.75 ? 'active' : ''}`}
              onClick={() => handleRateChange(0.75)}
            >
              Slow (0.75x)
            </button>
            <button 
              type="button"
              className={`rate-chip ${rate === 0.95 ? 'active' : ''}`}
              onClick={() => handleRateChange(0.95)}
            >
              Natural (0.95x) ⭐
            </button>
            <button 
              type="button"
              className={`rate-chip ${rate === 1.1 ? 'active' : ''}`}
              onClick={() => handleRateChange(1.1)}
            >
              Brisk (1.1x)
            </button>
          </div>
        </div>

        {/* Available Voices List */}
        <div className="voice-list-container">
          <label className="voice-list-label">Available Friendly Voices on Your Device:</label>
          {filteredVoices.length === 0 ? (
            <div className="voice-empty-state">
              <p>No extra voices found for this accent on your system. Using default English speaker.</p>
            </div>
          ) : (
            <div className="voice-cards">
              {filteredVoices.map((voice) => {
                const isSelected = voice.voiceURI === selectedURI;
                const isPlaying = activePreviewURI === voice.voiceURI;
                return (
                  <div
                    key={voice.voiceURI}
                    className={`voice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectVoice(voice)}
                  >
                    <div className="voice-card-left">
                      <div className="voice-radio">
                        {isSelected && <FaCheck />}
                      </div>
                      <div className="voice-info">
                        <div className="voice-name-row">
                          <span className="voice-name">{voice.name.replace(/\(.*\)/, '').trim()}</span>
                          {getVoiceBadge(voice)}
                        </div>
                        <span className="voice-lang-meta">{voice.lang} {voice.localService ? '• Local Fast' : '• High-Def'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`voice-preview-btn ${isPlaying ? 'playing' : ''}`}
                      onClick={(e) => handlePreview(voice, e)}
                      title="Listen to sample"
                      aria-label={`Listen to sample of ${voice.name}`}
                    >
                      {isPlaying ? <FaVolumeUp /> : <FaPlay />}
                      <span>{isPlaying ? 'Playing...' : 'Preview'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="voice-modal-footer">
          <p className="voice-tip">
            💡 <em>Tip: Jenny, Aria, Samantha, and Google voices offer the smoothest, most friendly tone for English learners.</em>
          </p>
          <button 
            type="button" 
            className="voice-modal-done-btn"
            onClick={onClose}
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelectorModal;
