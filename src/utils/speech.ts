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

// Active HTML5 Audio element instance
let currentAudioElement: HTMLAudioElement | null = null;
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
 * Play a pre-rendered static MP3 audio file
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
    // Stop any existing audio
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.onended = null;
      currentAudioElement.onerror = null;
      currentAudioElement = null;
    }

    const audio = new Audio(audioUrl);
    currentAudioElement = audio;

    // Apply playback speed if custom rate was specified
    if (options?.rate && options.rate > 0 && options.rate !== 1.0) {
      audio.playbackRate = options.rate;
    }

    audio.onended = () => {
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
      speakingButtons.set(buttonId, false);
      if (onEnd) onEnd();
      processSpeechQueue(buttonId);
    };

    audio.onerror = (e) => {
      console.warn(`Local audio error for "${text}" (${audioUrl}), falling back to speech synthesis:`, e);
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
      fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`Audio play() promise rejected for "${text}" (${audioUrl}), falling back:`, err);
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
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
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement.onended = null;
    currentAudioElement.onerror = null;
    currentAudioElement = null;
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