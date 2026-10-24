/**
 * Native Browser Speech Synthesis for Basic English (basicenglish.school)
 * 100% client-side, zero latency, supported natively across modern devices.
 * Features intelligent neural voice discovery, friendly voice scoring,
 * and user voice customization.
 */

export type EnglishAccent = 'en-US' | 'en-GB' | 'en-AU';

export interface SpeechOptions {
  accent?: EnglishAccent;
  rate?: number; // 0.75 = slow (beginner), 0.95 = natural measured (default), 1.1 = brisk
  pitch?: number;
  voiceURI?: string;
}

// Active speech settings
let currentAccent: EnglishAccent = 'en-US';
let currentRate = 0.95;
let currentPitch = 1.0;
let currentVoiceURI: string | null = null;

// Load persisted settings if available in browser
if (typeof window !== 'undefined') {
  try {
    const savedAccent = localStorage.getItem('basicenglish_accent') as EnglishAccent;
    if (savedAccent && (savedAccent === 'en-US' || savedAccent === 'en-GB' || savedAccent === 'en-AU')) {
      currentAccent = savedAccent;
    }

    const savedRate = localStorage.getItem('basicenglish_rate');
    if (savedRate) {
      const parsedRate = parseFloat(savedRate);
      if (!isNaN(parsedRate) && parsedRate >= 0.5 && parsedRate <= 1.5) {
        currentRate = parsedRate;
      }
    }

    const savedPitch = localStorage.getItem('basicenglish_pitch');
    if (savedPitch) {
      const parsedPitch = parseFloat(savedPitch);
      if (!isNaN(parsedPitch) && parsedPitch >= 0.5 && parsedPitch <= 1.5) {
        currentPitch = parsedPitch;
      }
    }

    currentVoiceURI = localStorage.getItem('basicenglish_voice_uri');
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Score a voice based on naturalness and human warmth.
 * Strongly down-votes legacy robotic and novelty synthesizer voices.
 */
export const scoreVoice = (voice: SpeechSynthesisVoice): number => {
  const name = voice.name.toLowerCase();

  // Heavy penalty for joke / legacy robotic synthesizer voices
  const roboticNames = [
    'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
    'deranged', 'fred', 'good news', 'hysterical', 'jester', 'junior',
    'kathy', 'organ', 'superstar', 'ralph', 'trinoids', 'whisper',
    'wobble', 'zarvox', 'alex', 'bruce', 'victoria', 'vicki'
  ];
  if (roboticNames.some(r => name.includes(r))) {
    return -1000;
  }

  let score = 0;

  // Tier 1: Microsoft Natural neural voices (Edge / Windows 11)
  if (name.includes('natural') || name.includes('online (natural)')) score += 500;

  // Tier 2: Google Studio / Chrome neural voices
  if (name.includes('google')) score += 400;

  // Tier 3: Apple Siri / Enhanced / Premium voices (macOS / iOS)
  if (name.includes('enhanced') || name.includes('premium')) score += 350;
  if (name.includes('siri')) score += 300;

  // Tier 4: Celebrated warm, friendly human voices
  if (name.includes('samantha')) score += 280;
  if (name.includes('ava') || name.includes('allison') || name.includes('susan') || name.includes('zoe')) score += 250;
  if (name.includes('daniel') || name.includes('oliver') || name.includes('serena') || name.includes('kate')) score += 250;
  if (name.includes('jenny') || name.includes('aria') || name.includes('guy') || name.includes('sonia')) score += 250;
  if (name.includes('flo') || name.includes('eddy') || name.includes('reed') || name.includes('shelley') || name.includes('sandy')) score += 180;
  if (name.includes('karen') || name.includes('moira') || name.includes('tessa') || name.includes('fiona')) score += 150;

  if (voice.default) score += 20;

  return score;
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
 * Get only friendly, high-quality English voices (excluding novelty/robotic voices),
 * sorted from highest to lowest quality.
 */
export const getFriendlyEnglishVoices = (): SpeechSynthesisVoice[] => {
  const allEnglish = getEnglishVoices();
  const friendly = allEnglish
    .filter(v => scoreVoice(v) > -500)
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));

  return friendly.length > 0 ? friendly : allEnglish;
};

/**
 * Update the user's preferred English accent
 */
export const setPreferredAccent = (accent: EnglishAccent): void => {
  currentAccent = accent;
  try {
    localStorage.setItem('basicenglish_accent', accent);
  } catch (e) {
    // Ignore storage errors
  }
};

export const getPreferredAccent = (): EnglishAccent => {
  return currentAccent;
};

/**
 * Set and persist a specific voice by its voiceURI
 */
export const setPreferredVoice = (voiceURI: string): void => {
  currentVoiceURI = voiceURI;
  try {
    localStorage.setItem('basicenglish_voice_uri', voiceURI);
  } catch (e) {
    // Ignore storage errors
  }

  // Update accent if voice has a known lang
  const all = getEnglishVoices();
  const match = all.find(v => v.voiceURI === voiceURI);
  if (match) {
    const lang = match.lang.toLowerCase().replace('_', '-');
    if (lang.startsWith('en-gb')) {
      setPreferredAccent('en-GB');
    } else if (lang.startsWith('en-au')) {
      setPreferredAccent('en-AU');
    } else if (lang.startsWith('en-us')) {
      setPreferredAccent('en-US');
    }
  }
};

export const getPreferredVoiceURI = (): string | null => {
  return currentVoiceURI;
};

/**
 * Update and persist default speech rate
 */
export const setPreferredRate = (rate: number): void => {
  currentRate = rate;
  try {
    localStorage.setItem('basicenglish_rate', rate.toString());
  } catch (e) {
    // Ignore storage errors
  }
};

export const getPreferredRate = (): number => {
  return currentRate;
};

/**
 * Update and persist default speech pitch
 */
export const setPreferredPitch = (pitch: number): void => {
  currentPitch = pitch;
  try {
    localStorage.setItem('basicenglish_pitch', pitch.toString());
  } catch (e) {
    // Ignore storage errors
  }
};

export const getPreferredPitch = (): number => {
  return currentPitch;
};

/**
 * Find the friendliest English voice matching preferences
 */
export const getBestEnglishVoice = (accent: EnglishAccent = getPreferredAccent()): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const allEnglish = getEnglishVoices();
  if (allEnglish.length === 0) return null;

  // 1. Check if user explicitly selected a voice that exists in current browser
  if (currentVoiceURI) {
    const userVoice = allEnglish.find(v => v.voiceURI === currentVoiceURI);
    if (userVoice) return userVoice;
  }

  // 2. Filter friendly voices matching accent
  const friendly = getFriendlyEnglishVoices();
  const accentMatches = friendly.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(accent.toLowerCase()));

  if (accentMatches.length > 0) {
    return accentMatches[0];
  }

  // 3. Fallback to top-scoring friendly voice overall
  return friendly[0] || allEnglish[0] || null;
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
  const pitch = options?.pitch !== undefined ? options.pitch : getPreferredPitch();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = accent;
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Determine which voice to use
  let voice: SpeechSynthesisVoice | null = null;
  if (options?.voiceURI) {
    voice = getEnglishVoices().find(v => v.voiceURI === options.voiceURI) || null;
  }
  if (!voice) {
    voice = getBestEnglishVoice(accent);
  }
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
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.warn(`Speech synthesis notice: ${event.error}`);
      }
      if (onEnd) onEnd();
    }
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Play a preview greeting with a specific voice
 */
export const previewVoice = (
  voice: SpeechSynthesisVoice,
  sampleText = "Hello! Welcome to Basic English. I'll be your pronunciation guide.",
  rate?: number
): void => {
  speakEnglishText(sampleText, {
    voiceURI: voice.voiceURI,
    accent: (voice.lang.replace('_', '-') as EnglishAccent) || 'en-US',
    rate: rate ?? getPreferredRate(),
    pitch: getPreferredPitch()
  });
};

/**
 * Cancel any ongoing speech
 */
export const cancelAllSpeech = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
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
  cancelAllSpeech,
  previewVoice,
  getEnglishVoices,
  getFriendlyEnglishVoices,
  getBestEnglishVoice,
  setPreferredVoice,
  getPreferredVoiceURI,
  setPreferredAccent,
  getPreferredAccent,
  setPreferredRate,
  getPreferredRate,
  setPreferredPitch,
  getPreferredPitch,
  scoreVoice,
  isSpeechSupported,
  initVoices,
};

export default browserSpeech;
