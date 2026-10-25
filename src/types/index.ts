/**
 * Shared TypeScript interfaces for Basic English (basicenglish.school / basicenglish.academy)
 */

// Alphabet item structure
export interface AlphabetItem {
  letter: string;
  pronunciation: string;
  example: string;
  russianWord?: string; // Target example word (e.g. Apple)
  englishWord?: string; // Meaning or pronunciation note
  meaning?: string;
  phonics?: string;
  icon?: string;        // Visual emoji or graphic identifier (e.g. 🍎)
}

// Phrase item structure
export interface PhraseItem {
  russian: string;       // Primary target phrase (English text)
  english: string;       // Meaning / Definition / Context
  pronunciation: string; // Phonetic guide
  meaning?: string;
  category?: string;
  icon?: string;         // Visual emoji or graphic identifier (e.g. 💧)
}

// Quiz-related interfaces
export interface QuizItem {
  prompt: string;
  answer: string;
  hint?: string;
  russian?: string;
  id?: string;
  type?: string;
}

// App data structure
export interface AppData {
  alphabet: AlphabetItem[];
  basicPhrases: PhraseItem[];
  numbers: PhraseItem[];
  commonWords: PhraseItem[];
}