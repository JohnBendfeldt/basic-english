/**
 * Utility functions for text-to-speech using browser speech synthesis for Basic English
 */
import { 
  speakEnglishText, 
  isSpeechSupported as isBrowserSpeechSupported,
  initVoices as initBrowserVoices,
  SpeechOptions,
  EnglishAccent
} from './browserSpeech';

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

let isInitialized = false;

// Check if speech is supported
export const isSpeechSupported = (): boolean => {
  return isInitialized || isBrowserSpeechSupported();
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
    const speechOptions: SpeechOptions = {
      accent: (lang as EnglishAccent) || options?.accent || 'en-US',
      rate: options?.rate ?? 0.9,
      pitch: options?.pitch ?? 1.0,
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
        console.error('Speech synthesis error:', error);
        speakingButtons.set(buttonId, false);
        if (onError) onError(error);
        processSpeechQueue(buttonId);
      }
    );
  } catch (error) {
    console.error('Error during speech:', error);
    speakingButtons.set(buttonId, false);
    if (onError) onError(error);
    processSpeechQueue(buttonId);
  }
};

// Speak text using browser speech synthesis
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

// Cancel all speech for cleanup
export const cancelAllSpeech = (): void => {
  speechQueues.clear();
  speakingButtons.clear();
  
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

const speechUtils = {
  isSpeechSupported,
  speak,
  initVoices,
  cancelAllSpeech
};

export default speechUtils;