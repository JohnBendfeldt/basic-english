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

// Track voices that failed during runtime playback so we never retry broken voices
const failedVoiceURIs = new Set<string>();

/**
 * Check if a voice name represents a known broken voice on specific browser engines.
 * Notably, Microsoft Ava Online (Natural) in Microsoft Edge has a known bug in Edge's
 * Web Speech API where it fails with network/synthesis-failed errors or plays silence.
 */
export const isVoiceBlacklisted = (name: string): boolean => {
  const lower = name.toLowerCase();

  // Microsoft Ava Online (Natural) is broken in Edge's Web Speech API
  if (lower.includes('ava') && (lower.includes('microsoft') || lower.includes('online') || lower.includes('natural'))) {
    return true;
  }

  // Joke / novelty synthesizer voices
  const noveltyNames = [
    'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
    'deranged', 'fred', 'good news', 'hysterical', 'jester', 'junior',
    'kathy', 'organ', 'superstar', 'ralph', 'trinoids', 'whisper',
    'wobble', 'zarvox', 'alex', 'bruce', 'victoria', 'vicki',
    'espeak', 'speech-dispatcher', 'flite'
  ];

  return noveltyNames.some(r => lower.includes(r));
};

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

    const savedURI = localStorage.getItem('basicenglish_voice_uri');
    if (savedURI) {
      // Clear legacy broken voice if user previously had Ava saved in Edge
      if (isVoiceBlacklisted(savedURI) || savedURI.toLowerCase().includes('ava')) {
        localStorage.removeItem('basicenglish_voice_uri');
        currentVoiceURI = null;
      } else {
        currentVoiceURI = savedURI;
      }
    }
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Check if a voice is a genuine high-fidelity neural/AI voice.
 * Only Microsoft Natural/Online, Google Studio, and Apple Enhanced/Premium/Siri
 * qualify. Compact offline voices (like standard Samantha or Eddy) are legacy
 * synthesizers and do NOT qualify.
 */
export const isNeuralVoice = (voice: SpeechSynthesisVoice): boolean => {
  const name = voice.name.toLowerCase();
  if (isVoiceBlacklisted(name)) return false;

  // Microsoft Edge Natural neural voices
  if (name.includes('natural') || name.includes('online (natural)')) return true;

  // Google Chrome Cloud neural voices
  if (name.includes('google')) return true;

  // Apple Siri or explicitly Enhanced/Premium downloaded packs
  if (name.includes('siri') || name.includes('enhanced') || name.includes('premium')) return true;

  return false;
};

/**
 * Score a voice based on naturalness and human warmth.
 * Strongly down-votes legacy robotic and novelty synthesizer voices,
 * and blacklists voices known to be broken (like Edge Microsoft Ava).
 */
export const scoreVoice = (voice: SpeechSynthesisVoice): number => {
  const name = voice.name.toLowerCase();

  // If blacklisted or previously failed during this session, discard
  if (isVoiceBlacklisted(name) || (voice.voiceURI && failedVoiceURIs.has(voice.voiceURI))) {
    return -1000;
  }

  // Heavy penalty for joke / legacy robotic novelty synthesizer voices
  // (e.g. Eddy, Flo, Reed, Sandy, Shelley, Albert, Zarvox) that sound like Stephen Hawking
  const legacyRoboticNovelty = [
    'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
    'deranged', 'fred', 'good news', 'hysterical', 'jester', 'junior',
    'kathy', 'organ', 'superstar', 'ralph', 'trinoids', 'whisper',
    'wobble', 'zarvox', 'alex', 'bruce', 'victoria', 'vicki',
    'espeak', 'speech-dispatcher', 'flite',
    'eddy', 'flo', 'reed', 'sandy', 'shelley', 'grandpa', 'grandma', 'rocko'
  ];
  if (legacyRoboticNovelty.some(r => name.includes(r))) {
    return -600;
  }

  // Penalty for legacy Windows SAPI5 robotic desktop voices (e.g. David Desktop, Zira Desktop)
  if (name.includes('desktop')) {
    return -400;
  }

  let score = 0;

  // Tier 1: Microsoft Natural neural voices (Edge / Windows 11)
  if (name.includes('natural') || name.includes('online (natural)')) {
    score += 500;
    // Microsoft Jenny is the flagship, smoothest, and most reliable English voice in Edge
    if (name.includes('jenny')) score += 180; // Total 680
    // Microsoft Aria is Microsoft's primary assistant voice, exceptionally clear and reliable
    if (name.includes('aria')) score += 160;  // Total 660
    // Microsoft Guy is clear and friendly male voice
    if (name.includes('guy')) score += 140;   // Total 640
  }

  // Tier 2: Google Studio / Chrome neural voices
  if (name.includes('google')) {
    score += 480;
    if (name.includes('us english') || name.includes('uk english female')) score += 40;
  }

  // Tier 3: Apple Siri / Enhanced / Premium voices (macOS / iOS)
  if (name.includes('siri')) score += 440;
  if (name.includes('enhanced') || name.includes('premium')) score += 400;

  // Tier 4: Clean standard offline system voices (usable offline fallbacks, but NOT neural)
  // Daniel (Nuance / Vocalizer en-GB) is celebrated for having far clearer, more natural articulation
  // than legacy compact synthesizers like Samantha
  if (name.includes('daniel')) score += 140;
  if (name.includes('samantha')) score += 50;
  if (name.includes('oliver') || name.includes('serena') || name.includes('kate')) score += 40;
  if (name.includes('allison') || name.includes('susan') || name.includes('zoe')) score += 30;

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
 * Get only friendly, high-quality English voices (excluding novelty/broken voices),
 * sorted from highest to lowest quality.
 */
export const getFriendlyEnglishVoices = (): SpeechSynthesisVoice[] => {
  const allEnglish = getEnglishVoices();
  const friendly = allEnglish
    .filter(v => scoreVoice(v) > -500 && !failedVoiceURIs.has(v.voiceURI))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));

  return friendly.length > 0 ? friendly : allEnglish;
};

/**
 * Information about the host browser's voice quality capabilities
 */
export interface BrowserVoiceQualityInfo {
  isLowQuality: boolean;
  hasNeuralVoices: boolean;
  bestVoiceName: string | null;
  bestScore: number;
  tip: string | null;
}

/**
 * Detect browser voice capabilities and provide recommendations if voices are low-quality
 */
export const getBrowserVoiceQualityInfo = (): BrowserVoiceQualityInfo => {
  const voices = getFriendlyEnglishVoices();
  if (voices.length === 0) {
    return {
      isLowQuality: true,
      hasNeuralVoices: false,
      bestVoiceName: null,
      bestScore: 0,
      tip: "No English speech voices detected on this browser. Try opening Basic English in Microsoft Edge or Google Chrome."
    };
  }

  const topVoice = voices[0];
  const topScore = scoreVoice(topVoice);
  const hasNeuralVoices = isNeuralVoice(topVoice);
  const isLowQuality = !hasNeuralVoices;

  let tip: string | null = null;
  if (!hasNeuralVoices) {
    tip = "Your browser is using basic offline synthesizers. For natural, human-like AI voices, we recommend Google Chrome (Google US English) or Microsoft Edge (Jenny & Aria).";
  }

  return {
    isLowQuality,
    hasNeuralVoices,
    bestVoiceName: topVoice.name,
    bestScore: topScore,
    tip
  };
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

  // 1. Check if user explicitly selected a voice that exists, is valid, and hasn't failed
  if (currentVoiceURI) {
    const userVoice = allEnglish.find(v => v.voiceURI === currentVoiceURI);
    if (userVoice && scoreVoice(userVoice) > -500 && !failedVoiceURIs.has(userVoice.voiceURI)) {
      return userVoice;
    }
    // Saved voice is broken or blacklisted, clear it
    currentVoiceURI = null;
    try {
      localStorage.removeItem('basicenglish_voice_uri');
    } catch (e) {}
  }

  const friendly = getFriendlyEnglishVoices();

  // 2. Check if there are voices matching the requested accent
  const accentMatches = friendly.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(accent.toLowerCase()));
  const hasNeuralMatch = accentMatches.some(v => isNeuralVoice(v));

  // If we have a genuine Studio AI voice for this accent (e.g. Google US English, Jenny, Aria), use it!
  if (hasNeuralMatch) {
    return accentMatches[0];
  }

  // 3. Natural Fallback: If no neural voice exists for American English (e.g. only robotic compact Samantha exists),
  // prefer Daniel (en-GB). Daniel has far more human, natural articulation than Stephen Hawking-like compact Samantha.
  const danielVoice = friendly.find(v => v.name.toLowerCase().includes('daniel'));
  if (danielVoice && (!accentMatches[0] || !isNeuralVoice(accentMatches[0]))) {
    return danielVoice;
  }

  // 4. Fallback to best matching voice for accent
  if (accentMatches.length > 0) {
    return accentMatches[0];
  }

  // 5. Fallback to top-scoring friendly voice overall
  return friendly[0] || allEnglish.find(v => !failedVoiceURIs.has(v.voiceURI)) || allEnglish[0] || null;
};

/**
 * Speak English text using native browser speech synthesis.
 * Includes automatic recovery fallback: if an online/specific voice fails
 * (e.g. Edge network drop or buggy synthesis), it immediately retries
 * with a reliable system voice so the learner never experiences silence.
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

  // Determine initial preferred voice
  let voiceToUse: SpeechSynthesisVoice | null = null;
  if (options?.voiceURI) {
    voiceToUse = getEnglishVoices().find(v => v.voiceURI === options.voiceURI && !failedVoiceURIs.has(v.voiceURI)) || null;
  }
  if (!voiceToUse) {
    voiceToUse = getBestEnglishVoice(accent);
  }

  const attemptSpeak = (chosenVoice: SpeechSynthesisVoice | null, isRetry = false) => {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = accent;
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    let completed = false;
    let speechWatchdog: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (speechWatchdog) {
        clearTimeout(speechWatchdog);
        speechWatchdog = null;
      }
    };

    utterance.onend = () => {
      if (!completed) {
        completed = true;
        cleanup();
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = (event) => {
      if (completed) return;
      cleanup();

      // Non-fatal interruptions (user clicking another sound or navigating away)
      if (event.error === 'interrupted' || event.error === 'canceled') {
        completed = true;
        if (onEnd) onEnd();
        return;
      }

      console.warn(`Speech synthesis notice (${chosenVoice?.name || 'system'}): ${event.error}`);

      // If a specific voice failed (e.g. Edge Ava or cloud timeout) and this is the first attempt,
      // blacklist the broken voice for this session and immediately retry with system default voice
      if (!isRetry && chosenVoice) {
        failedVoiceURIs.add(chosenVoice.voiceURI);
        if (currentVoiceURI === chosenVoice.voiceURI) {
          currentVoiceURI = null;
          try {
            localStorage.removeItem('basicenglish_voice_uri');
          } catch (e) {}
        }

        console.info(`Auto-recovering speech using reliable fallback voice...`);
        const fallbackVoice = getEnglishVoices().find(v => 
          v.voiceURI !== chosenVoice.voiceURI && 
          !failedVoiceURIs.has(v.voiceURI) && 
          (v.localService || v.default)
        ) || null;

        attemptSpeak(fallbackVoice, true);
        return;
      }

      completed = true;
      if (onError) {
        onError(new Error(`Speech synthesis error: ${event.error}`));
      } else if (onEnd) {
        onEnd();
      }
    };

    // Chromium/Edge speech synthesis keep-alive guard
    speechWatchdog = setTimeout(() => {
      if (!completed && window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 2500);

    window.speechSynthesis.speak(utterance);

    // If Chromium starts paused, unpause immediately
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  attemptSpeak(voiceToUse, false);
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
  getBrowserVoiceQualityInfo,
  setPreferredVoice,
  getPreferredVoiceURI,
  setPreferredAccent,
  getPreferredAccent,
  setPreferredRate,
  getPreferredRate,
  setPreferredPitch,
  getPreferredPitch,
  scoreVoice,
  isNeuralVoice,
  isVoiceBlacklisted,
  isSpeechSupported,
  initVoices,
};

export default browserSpeech;
