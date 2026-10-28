/**
 * Utility functions for audio playback and speech synthesis for Basic English
 * Prioritizes crystal-clear pre-rendered Microsoft Neural TTS (en-US-JennyNeural)
 * audio files, with seamless fallback to browser speech synthesis.
 */
import { 
  unlockIOSAudio,
  speakEnglishText, 
  isSpeechSupported as isBrowserSpeechSupported,
  initVoices as initBrowserVoices,
  SpeechOptions,
  EnglishAccent,
  getPreferredAccent,
  getPreferredRate,
  getPreferredPitch,
  getPreferredVoiceURI,
  getFriendlyEnglishVoices,
  setPreferredVoice,
  setPreferredAccent,
  setPreferredRate,
  previewVoice,
  getBestEnglishVoice,
  getBrowserVoiceQualityInfo,
  isNeuralVoice
} from './browserSpeech';
import { getLocalAudioUrl } from '../data/audioManifest';

// Track currently speaking items by button ID
const speakingButtons = new Map<string, boolean>();

// Speech queue for each button
const speechQueues = new Map<string, Array<{
  text: string;
  lang?: string;
  options?: SpeechOptions;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}>>();

interface ActivePlayback {
  audio: HTMLAudioElement;
  buttonId: string;
  onEnd?: () => void;
  timerId?: ReturnType<typeof setTimeout> | null;
}

// Active playback tracker
let currentActivePlayback: ActivePlayback | null = null;
let isInitialized = false;

// Check if speech or audio is supported
export const isSpeechSupported = (): boolean => {
  return true; // Local pre-rendered audio is always supported in any browser
};

// Initialize speech system
export const initVoices = async (): Promise<void> => {
  if (isInitialized) {
    return Promise.resolve();
  }
  
  await initBrowserVoices();
  isInitialized = true;
  
  return Promise.resolve();
};

/**
 * Fallback to browser SpeechSynthesis if local audio file fails or is missing
 */
const fallbackToSpeechSynthesis = (
  text: string,
  lang: string | undefined,
  options: SpeechOptions | undefined,
  buttonId: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void => {
  const speechOptions: SpeechOptions = {
    accent: (lang as EnglishAccent) || options?.accent || getPreferredAccent(),
    rate: options?.rate ?? getPreferredRate(),
    pitch: options?.pitch ?? getPreferredPitch(),
    voiceURI: options?.voiceURI || getPreferredVoiceURI() || undefined,
  };

  speakEnglishText(
    text,
    speechOptions,
    () => {
      speakingButtons.set(buttonId, false);
      if (onEnd) onEnd();
      processSpeechQueue(buttonId);
    },
    (error: Error) => {
      console.error('Speech synthesis fallback error:', error);
      speakingButtons.set(buttonId, false);
      if (onError) onError(error);
      processSpeechQueue(buttonId);
    }
  );
};

/**
 * Play a pre-rendered static MP3 audio file with robust lifecycle and callback guarantees
 */
const playPreRenderedAudio = (
  audioUrl: string,
  text: string,
  lang: string | undefined,
  options: SpeechOptions | undefined,
  buttonId: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void => {
  try {
    // 1. If another button was previously playing, notify it immediately so its UI resets!
    if (currentActivePlayback) {
      const prev = currentActivePlayback;
      currentActivePlayback = null;
      if (prev.timerId) clearTimeout(prev.timerId);
      try {
        prev.audio.pause();
        prev.audio.currentTime = 0;
      } catch (e) {
        // Ignore pause errors
      }
      speakingButtons.set(prev.buttonId, false);
      if (prev.onEnd) {
        try { prev.onEnd(); } catch (e) { /* Ignore callback errors */ }
      }
    }

    const audio = new Audio(audioUrl);
    let isCleanedUp = false;

    const activePlayback: ActivePlayback = {
      audio,
      buttonId,
      onEnd,
      timerId: null
    };
    currentActivePlayback = activePlayback;

    // Complete playback and cleanly release the button state
    const completePlayback = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      if (activePlayback.timerId) {
        clearTimeout(activePlayback.timerId);
        activePlayback.timerId = null;
      }

      if (currentActivePlayback === activePlayback) {
        currentActivePlayback = null;
      }

      speakingButtons.set(buttonId, false);
      if (onEnd) {
        try { onEnd(); } catch (e) { /* Ignore callback errors */ }
      }
      processSpeechQueue(buttonId);
    };

    // Apply playback speed safely once metadata is loaded (prevents browser stall on short audio)
    if (options?.rate && options.rate > 0 && options.rate !== 1.0) {
      const targetRate = options.rate;
      audio.addEventListener('loadedmetadata', () => {
        try { audio.playbackRate = targetRate; } catch (e) { /* Ignore rate error */ }
      }, { once: true });
    }

    // Normal audio ended listener
    audio.addEventListener('ended', completePlayback, { once: true });

    // Handle audio loading or playback error by falling back to browser speech synthesis
    audio.addEventListener('error', (e) => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      if (activePlayback.timerId) clearTimeout(activePlayback.timerId);
      if (currentActivePlayback === activePlayback) {
        currentActivePlayback = null;
      }
      console.warn(`Local audio error for "${text}" (${audioUrl}), falling back to speech synthesis:`, e);
      fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
    }, { once: true });

    // Safety timeout: ensure the button NEVER gets stuck green even if the browser drops the ended event
    const startSafetyTimer = () => {
      const durationSec = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 3.0;
      const timeoutMs = Math.max(2000, Math.round(durationSec * 1000) + 500);
      if (!activePlayback.timerId && !isCleanedUp) {
        activePlayback.timerId = setTimeout(() => {
          if (!isCleanedUp && currentActivePlayback === activePlayback) {
            completePlayback();
          }
        }, timeoutMs);
      }
    };

    audio.addEventListener('loadedmetadata', startSafetyTimer, { once: true });
    // Backup timer starter in case loadedmetadata doesn't fire
    setTimeout(() => {
      if (!activePlayback.timerId && !isCleanedUp) {
        startSafetyTimer();
      }
    }, 600);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        if (activePlayback.timerId) clearTimeout(activePlayback.timerId);
        if (currentActivePlayback === activePlayback) {
          currentActivePlayback = null;
        }
        console.warn(`Audio play() promise rejected for "${text}" (${audioUrl}), falling back:`, err);
        fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
      });
    }
  } catch (err) {
    console.error('Exception starting local audio, falling back:', err);
    fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
  }
};

// Process the queue for a specific button
const processSpeechQueue = async (buttonId: string): Promise<void> => {
  if (speakingButtons.get(buttonId) || !speechQueues.has(buttonId) || speechQueues.get(buttonId)?.length === 0) {
    return;
  }
  
  speakingButtons.set(buttonId, true);
  
  const buttonQueue = speechQueues.get(buttonId) || [];
  const queueItem = buttonQueue.shift();
  
  speechQueues.set(buttonId, buttonQueue);
  
  if (!queueItem) {
    speakingButtons.set(buttonId, false);
    return;
  }
  
  const { text, lang, options, onEnd, onError } = queueItem;
  
  try {
    // 1. Check if local pre-rendered audio is available
    const useLocal = options?.useLocalAudio !== false;
    const localAudioUrl = useLocal ? getLocalAudioUrl(text, options?.category) : null;

    if (localAudioUrl) {
      playPreRenderedAudio(localAudioUrl, text, lang, options, buttonId, onEnd, onError);
    } else {
      // 2. Fall back to browser speech synthesis
      fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
    }
  } catch (error) {
    console.error('Error during speech queue processing:', error);
    speakingButtons.set(buttonId, false);
    if (onError) onError(error);
    processSpeechQueue(buttonId);
  }
};

// Speak text using pre-rendered audio or browser speech synthesis
export const speak = (
  text: string, 
  lang = 'en-US',
  buttonId: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void,
  options?: SpeechOptions
): void => {
  if (!speechQueues.has(buttonId)) {
    speechQueues.set(buttonId, []);
  }
  
  const buttonQueue = speechQueues.get(buttonId) || [];
  buttonQueue.push({ text, lang, options, onEnd, onError });
  speechQueues.set(buttonId, buttonQueue);
  
  processSpeechQueue(buttonId);
};

// Cancel all speech and audio playback for cleanup
export const cancelAllSpeech = (): void => {
  if (currentActivePlayback) {
    const prev = currentActivePlayback;
    currentActivePlayback = null;
    if (prev.timerId) clearTimeout(prev.timerId);
    try {
      prev.audio.pause();
      prev.audio.currentTime = 0;
    } catch (e) {
      // Ignore pause errors
    }
    speakingButtons.set(prev.buttonId, false);
    if (prev.onEnd) {
      try { prev.onEnd(); } catch (e) { /* Ignore callback errors */ }
    }
  }

  speechQueues.clear();
  speakingButtons.clear();
  
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export {
  unlockIOSAudio,
  getLocalAudioUrl,
  getFriendlyEnglishVoices,
  setPreferredVoice,
  setPreferredAccent,
  setPreferredRate,
  getPreferredAccent,
  getPreferredRate,
  getPreferredVoiceURI,
  previewVoice,
  getBestEnglishVoice,
  getBrowserVoiceQualityInfo,
  isNeuralVoice
};

const speechUtils = {
  unlockIOSAudio,
  isSpeechSupported,
  speak,
  initVoices,
  cancelAllSpeech,
  getLocalAudioUrl,
  getFriendlyEnglishVoices,
  setPreferredVoice,
  getPreferredVoiceURI,
  previewVoice,
  getBestEnglishVoice,
  getBrowserVoiceQualityInfo,
  isNeuralVoice
};

export default speechUtils;