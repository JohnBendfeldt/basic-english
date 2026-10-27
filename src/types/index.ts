/**
 * Shared TypeScript interfaces for Basic English (basicenglish.school / basicenglish.academy)
 */

// Alphabet item structure
export interface AlphabetItem {
  letter: string;
  pronunciation: string;
  example: string;
  word?: string;        // Target example word (e.g. Apple)
  russianWord?: string; // Legacy alias for backward compatibility
  meaning?: string;     // Meaning or pronunciation note
  englishWord?: string; // Legacy alias for backward compatibility
  phonics?: string;
  icon?: string;        // Visual emoji or graphic identifier (e.g. 🍎)
}

// Phrase item structure
export interface PhraseItem {
  phrase?: string;       // Primary target phrase (English text)
  russian?: string;      // Legacy alias for backward compatibility
  meaning?: string;      // Meaning / Definition / Context
  english?: string;      // Legacy alias for backward compatibility
  pronunciation: string; // Phonetic guide
  category?: string;
  icon?: string;         // Visual emoji or graphic identifier (e.g. 💧)
}

// Quiz-related interfaces
export interface QuizItem {
  prompt: string;
  answer: string;
  hint?: string;
  phrase?: string;
  target?: string;
  russian?: string;      // Legacy alias
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