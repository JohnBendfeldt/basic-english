/**
 * Native Browser Speech Synthesis for Basic English (basicenglish.school / basicenglish.academy)
 * 100% client-side, zero latency, supported natively across all modern devices.
 */

export type EnglishAccent = 'en-US' | 'en-GB' | 'en-AU';

export interface SpeechOptions {
  accent?: EnglishAccent;
  rate?: number; // 0.7 = slow (beginner), 0.9 = natural measured (default), 1.0 = normal
  pitch?: number;
}

// Active speech settings
let currentAccent: EnglishAccent = 'en-US';
let currentRate = 0.9;

/**
 * Update the user's preferred English accent
 */
export const setPreferredAccent = (accent: EnglishAccent): void => {
  currentAccent = accent;
  try {
    localStorage.setItem('basicenglish_accent', accent);
  } catch (e) {
    // Ignore storage errors in private browsing
  }
};

/**
 * Get current preferred accent
 */
export const getPreferredAccent = (): EnglishAccent => {
  try {
    const saved = localStorage.getItem('basicenglish_accent') as EnglishAccent;
    if (saved && (saved === 'en-US' || saved === 'en-GB' || saved === 'en-AU')) {
      currentAccent = saved;
      return saved;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return currentAccent;
};

/**
 * Update the default speech rate
 */
export const setPreferredRate = (rate: number): void => {
  currentRate = rate;
};

export const getPreferredRate = (): number => {
  return currentRate;
};

/**
 * Get all available English voices from the browser
 */
export const getEnglishVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(v => v.lang.toLowerCase().startsWith('en'));
};

/**
 * Find the highest-quality English voice matching the requested accent
 */
export const getBestEnglishVoice = (accent: EnglishAccent = getPreferredAccent()): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const allEnglish = getEnglishVoices();
  if (allEnglish.length === 0) return null;

  // 1. Try to find natural/premium voices matching the specific accent
  const accentMatches = allEnglish.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(accent.toLowerCase()));
  const pool = accentMatches.length > 0 ? accentMatches : allEnglish;

  // Prioritize premium / natural sounding voices
  const preferredVoice = pool.find(v => 
    v.name.includes('Natural') || 
    v.name.includes('Online (Natural)') ||
    v.name.includes('Siri') ||
    v.name.includes('Google') ||
    v.name.includes('Samantha') ||
    v.name.includes('Daniel')
  );

  return preferredVoice || pool[0];
};

/**
 * Speak English text using native browser speech synthesis
 */
export const speakEnglishText = (
  text: string,
  options?: SpeechOptions,
  onEnd?: () => void,
  onError?: (error: Error) => void
): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onError) onError(new Error('Speech synthesis is not supported on this device'));
    return;
  }

  // Cancel any currently speaking utterance
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // Ignore cancel errors
  }

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  const accent = options?.accent || getPreferredAccent();
  const rate = options?.rate !== undefined ? options.rate : getPreferredRate();
  const pitch = options?.pitch !== undefined ? options.pitch : 1.0;

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = accent;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voice = getBestEnglishVoice(accent);
  if (voice) {
    utterance.voice = voice;
  }

  let completed = false;

  utterance.onend = () => {
    if (!completed) {
      completed = true;
      if (onEnd) onEnd();
    }
  };

  utterance.onerror = (event) => {
    if (!completed) {
      completed = true;
      // 'interrupted' is common when clicking another button or closing, don't log as fatal
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.warn(`Speech synthesis notice: ${event.error}`);
      }
      if (onEnd) onEnd();
    }
  };

  // Safari / iOS keep-alive workaround for long utterances
  window.speechSynthesis.speak(utterance);
};

/**
 * Check if speech is supported
 */
export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/**
 * Initialize voices asynchronously (handles Chrome/Android delayed voice list)
 */
export const initVoices = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) return;

  await new Promise<void>(resolve => {
    const onVoicesChanged = () => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      clearTimeout(timer);
      resolve();
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);
    const timer = setTimeout(() => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve();
    }, 500);
  });
};

const browserSpeech = {
  speakEnglishText,
  getEnglishVoices,
  getBestEnglishVoice,
  setPreferredAccent,
  getPreferredAccent,
  setPreferredRate,
  getPreferredRate,
  isSpeechSupported,
  initVoices,
};

export default browserSpeech;
