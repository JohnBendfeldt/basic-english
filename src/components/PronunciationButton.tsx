import React, { useState, useEffect, useRef } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { speak, initVoices, unlockIOSAudio } from '../utils/speech';

interface PronunciationButtonProps {
  text: string;
  lang?: string;
  label?: string;
  className?: string;
  useLocalAudio?: boolean;
  isAlphabet?: boolean;
  audioCategory?: 'alphabet' | 'words' | 'phrases' | 'numbers' | 'examples' | 'basicPhrases' | 'commonWords';
  rate?: number; // Optional speed override (e.g. 0.7 for slow playback)
}

const PronunciationButton: React.FC<PronunciationButtonProps> = ({ 
  text, 
  lang = 'en-US',
  label,
  className,
  rate = 0.9
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Create a unique ID for each button instance
  const buttonId = useRef(`btn-${Math.random().toString(36).substring(2, 9)}`);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const init = async () => {
      try {
        await initVoices();
        if (isMounted.current) {
          setInitialized(true);
        }
      } catch (err) {
        console.error('Error initializing speech in button:', err);
        if (isMounted.current) {
          setInitialized(true);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
  }, [text]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying || !text) return;
    
    // Synchronously prime and unlock audio inside the user click handler
    unlockIOSAudio();
    setIsPlaying(true);
    
    speak(
      text, 
      lang,
      buttonId.current,
      // onEnd callback
      () => {
        if (isMounted.current) {
          setIsPlaying(false);
        }
      },
      // onError callback
      (error: unknown) => {
        if (isMounted.current) {
          setIsPlaying(false);
        }
      },
      { rate }
    );
  };

  return (
    <button
      type="button"
      className={`pronunciation-button ${isPlaying ? 'playing' : ''} ${className || ''}`}
      onClick={handleSpeak}
      disabled={isPlaying || !initialized}
      title={isPlaying ? "Speaking..." : (label || `Pronounce "${text}"`)}
      aria-label={isPlaying ? "Speaking..." : (label || `Pronounce "${text}"`)}
      data-button-id={buttonId.current}
    >
      <FaVolumeUp className={isPlaying ? "pulse-animation" : ""} aria-hidden="true" />
    </button>
  );
};

export default PronunciationButton;