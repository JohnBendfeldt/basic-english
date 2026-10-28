import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCheck, FaTimes, FaTrophy, FaRedo, FaCheckCircle, FaTimesCircle, FaStar, FaGraduationCap, FaVolumeUp } from 'react-icons/fa';
import PronunciationButton from './PronunciationButton';
import { ProgressService } from '../services/progressService';
import { speak } from '../utils/speech';

// Define interfaces for the data structure
interface AlphabetItem {
  character?: string;
  letter?: string;
  pronunciation: string;
  example?: string;
  word?: string;
  meaning?: string;
}

interface PhraseItem {
  phrase?: string;
  meaning?: string;
  pronunciation?: string;
}

interface QuizProps {
  data: {
    alphabet?: AlphabetItem[];
    basicPhrases?: PhraseItem[];
    numbers?: PhraseItem[];
    commonWords?: PhraseItem[];
    [key: string]: any;
  };
}

interface QuestionDef {
  item: AlphabetItem | PhraseItem;
  isPrimaryDirection: boolean;
  id: string;
  category: string;
}

interface MissedWord {
  prompt: string;
  answer: string;
  userAnswer: string;
  category: string;
  target?: string;
}

export interface DialogueData {
  speakerA: string;
  speakerBPrefix: string;
  missingWord: string;
  clozeDisplay: string;
  speakerBSuffix?: string;
  contextHint?: string;
}

// Conversational real-life dialogues for English Phrases
const CONVERSATIONAL_DIALOGUES: Record<string, {
  speakerA: string;
  speakerBPrefix: string;
  missingWord: string;
  speakerBSuffix?: string;
  contextHint?: string;
}> = {
  'hello': {
    speakerA: 'Good morning! Welcome to Basic English.',
    speakerBPrefix: '',
    missingWord: 'Hello',
    speakerBSuffix: ', thank you!',
    contextHint: 'Friendly greeting'
  },
  'good morning': {
    speakerA: 'Rise and shine, the clock says 8:00 AM!',
    speakerBPrefix: 'Good',
    missingWord: 'morning',
    speakerBSuffix: '!',
    contextHint: 'Morning greeting (before 12 PM)'
  },
  'good afternoon': {
    speakerA: 'Welcome everyone, it is 1:30 PM.',
    speakerBPrefix: 'Good',
    missingWord: 'afternoon',
    speakerBSuffix: '!',
    contextHint: 'Afternoon greeting (12 PM to 5 PM)'
  },
  'good evening': {
    speakerA: 'Welcome to our dinner event at 7:00 PM.',
    speakerBPrefix: 'Good',
    missingWord: 'evening',
    speakerBSuffix: '!',
    contextHint: 'Evening greeting (after 6 PM)'
  },
  'how are you': {
    speakerA: 'Hi Sarah, wonderful to see you today!',
    speakerBPrefix: 'How are',
    missingWord: 'you',
    speakerBSuffix: '?',
    contextHint: 'Asking about someone\'s well-being'
  },
  'nice to meet you': {
    speakerA: 'Hello, I am Alex from Toronto.',
    speakerBPrefix: 'Nice to meet',
    missingWord: 'you',
    speakerBSuffix: '!',
    contextHint: 'Meeting someone for the first time'
  },
  'what is your name': {
    speakerA: 'Hi! I am new in class today.',
    speakerBPrefix: 'What is your',
    missingWord: 'name',
    speakerBSuffix: '?',
    contextHint: 'Asking someone\'s name'
  },
  'my name is': {
    speakerA: 'Hello! What is your name?',
    speakerBPrefix: 'My name',
    missingWord: 'is',
    speakerBSuffix: ' Alex.',
    contextHint: 'Introducing yourself'
  },
  'goodbye': {
    speakerA: 'It was great talking to you. See you tomorrow!',
    speakerBPrefix: 'Good',
    missingWord: 'bye',
    speakerBSuffix: ', take care!',
    contextHint: 'Farewell'
  },
  'have a great day': {
    speakerA: 'I am heading out for work now.',
    speakerBPrefix: 'Have a great',
    missingWord: 'day',
    speakerBSuffix: '!',
    contextHint: 'Warm closing remark'
  },
  'please': {
    speakerA: 'Can I get you something to drink?',
    speakerBPrefix: 'A glass of water,',
    missingWord: 'please',
    speakerBSuffix: '.',
    contextHint: 'Essential courtesy word'
  },
  'thank you very much': {
    speakerA: 'Here are the flight tickets and boarding passes.',
    speakerBPrefix: 'Thank you very',
    missingWord: 'much',
    speakerBSuffix: '!',
    contextHint: 'Expressing sincere gratitude'
  },
  'you are welcome': {
    speakerA: 'Thank you so much for your kind help!',
    speakerBPrefix: 'You are',
    missingWord: 'welcome',
    speakerBSuffix: '!',
    contextHint: 'Polite reply to thank you'
  },
  'excuse me': {
    speakerA: '(Someone is standing directly in front of the door)',
    speakerBPrefix: 'Excuse',
    missingWord: 'me',
    speakerBSuffix: ', may I pass please?',
    contextHint: 'Getting attention politely or passing by'
  },
  'i am sorry': {
    speakerA: 'Oh, you accidentally bumped my shoulder!',
    speakerBPrefix: 'I am so',
    missingWord: 'sorry',
    speakerBSuffix: '!',
    contextHint: 'Apologizing for an accident'
  },
  'yes': {
    speakerA: 'Would you like milk and sugar in your tea?',
    speakerBPrefix: '',
    missingWord: 'Yes',
    speakerBSuffix: ', please!',
    contextHint: 'Affirmative response'
  },
  'no': {
    speakerA: 'Do you need any extra plastic bags today?',
    speakerBPrefix: '',
    missingWord: 'No',
    speakerBSuffix: ', thank you.',
    contextHint: 'Negative response'
  },
  'where is the restroom': {
    speakerA: '(At a restaurant or cafe after lunch)',
    speakerBPrefix: 'Excuse me, where is the',
    missingWord: 'restroom',
    speakerBSuffix: '?',
    contextHint: 'Asking for the toilet / bathroom'
  },
  'where is the bus stop': {
    speakerA: 'I need to catch bus #42 to the train station.',
    speakerBPrefix: 'Excuse me, where is the bus',
    missingWord: 'stop',
    speakerBSuffix: '?',
    contextHint: 'Asking for public transit'
  },
  'how do i get to the airport': {
    speakerA: 'My flight boards in two hours!',
    speakerBPrefix: 'How do I get to the',
    missingWord: 'airport',
    speakerBSuffix: '?',
    contextHint: 'Asking directions to airport'
  },
  'is it far from here': {
    speakerA: 'The city art museum is over on 8th Street.',
    speakerBPrefix: 'Is it far',
    missingWord: 'from',
    speakerBSuffix: ' here?',
    contextHint: 'Inquiring about walking distance'
  },
  'can i have the check please': {
    speakerA: 'Server: Did you enjoy your meal this evening?',
    speakerBPrefix: 'Yes, can I have the',
    missingWord: 'check',
    speakerBSuffix: ', please?',
    contextHint: 'Asking for the restaurant bill'
  },
  'i would like a coffee please': {
    speakerA: 'Barista: Welcome to the cafe! What can I make for you?',
    speakerBPrefix: 'I would like a',
    missingWord: 'coffee',
    speakerBSuffix: ', please.',
    contextHint: 'Ordering a beverage at a cafe'
  },
  'a bottle of water please': {
    speakerA: 'Flight attendant: Would you like a beverage?',
    speakerBPrefix: 'A bottle of',
    missingWord: 'water',
    speakerBSuffix: ', please.',
    contextHint: 'Ordering bottled water'
  },
  'how much does this cost': {
    speakerA: 'Shopper holding a jacket with no price tag.',
    speakerBPrefix: 'Excuse me, how much does this',
    missingWord: 'cost',
    speakerBSuffix: '?',
    contextHint: 'Asking the price of an item'
  },
  'do you speak english': {
    speakerA: 'Traveler arriving at a train station in Europe.',
    speakerBPrefix: 'Pardon me, do you speak',
    missingWord: 'english',
    speakerBSuffix: '?',
    contextHint: 'Asking if someone speaks English'
  },
  'could you speak slower please': {
    speakerA: 'The tour guide is talking very rapidly.',
    speakerBPrefix: 'Could you speak',
    missingWord: 'slower',
    speakerBSuffix: ', please?',
    contextHint: 'Requesting slower speech'
  },
  'i do not understand': {
    speakerA: 'The transit announcement was muffled.',
    speakerBPrefix: 'I am sorry, I do not',
    missingWord: 'understand',
    speakerBSuffix: '.',
    contextHint: 'Asking for clarification'
  },
  'could you repeat that please': {
    speakerA: 'A loud train just passed by while you were speaking.',
    speakerBPrefix: 'Could you repeat that,',
    missingWord: 'please',
    speakerBSuffix: '?',
    contextHint: 'Asking someone to say something again'
  },
  'can you help me': {
    speakerA: 'You are struggling to lift your heavy suitcase.',
    speakerBPrefix: 'Excuse me, can you',
    missingWord: 'help',
    speakerBSuffix: ' me?',
    contextHint: 'Asking for assistance'
  }
};

const findDialogue = (phrase: string) => {
  const norm = phrase.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, ' ').replace(/\s+/g, ' ').trim();
  if (CONVERSATIONAL_DIALOGUES[norm]) return CONVERSATIONAL_DIALOGUES[norm];
  for (const [key, val] of Object.entries(CONVERSATIONAL_DIALOGUES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val;
    }
  }
  return null;
};

const getAudioCategory = (questionType: string): 'alphabet' | 'phrases' | 'numbers' | 'words' | 'examples' => {
  switch (questionType) {
    case 'alphabet':
      return 'alphabet';
    case 'basicPhrases':
      return 'phrases';
    case 'numbers':
      return 'numbers';
    case 'commonWords':
      return 'words';
    default:
      return questionType as any;
  }
};

const Quiz: React.FC<QuizProps> = ({ data }) => {
  // Session Goal: 5, 10, or 20 questions (persisted across sessions)
  const [sessionGoal, setSessionGoal] = useState<number>(() => {
    const saved = localStorage.getItem('english_quiz_goal');
    if (saved) {
      const num = parseInt(saved, 10);
      if ([5, 10, 20].includes(num)) return num;
    }
    return 10;
  });

  // Mastered words tracking (masteryLevel >= 5)
  const [masteredWordIds, setMasteredWordIds] = useState<Set<string>>(new Set());
  const masteredWordIdsRef = useRef<Set<string>>(new Set());
  const [isWordJustMastered, setIsWordJustMastered] = useState(false);

  // Current session tracking
  const [sessionIndex, setSessionIndex] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [missedInSession, setMissedInSession] = useState<MissedWord[]>([]);

  // Current question state
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showNext, setShowNext] = useState(false);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [_lastInput, setLastInput] = useState('');

  // Ref to track questions asked in current rotation
  const askedQuestionsRef = useRef<Set<string>>(new Set());

  // Ref to track session totals for background persistence
  const sessionStatsRef = useRef<{ score: number; total: number; category: string; isSaved: boolean }>({
    score: 0,
    total: 0,
    category: 'mixed',
    isSaved: false
  });

  // Load mastered words on mount
  useEffect(() => {
    ProgressService.getMasteredWordIds()
      .then(ids => {
        masteredWordIdsRef.current = ids;
        setMasteredWordIds(ids);
        setCurrentQuestion((prev: any) => {
          if (prev && ids.has(prev.id) && sessionAnswered === 0) {
            // Re-select an unmastered question immediately
            getRandomQuestion(ids);
          }
          return prev;
        });
      })
      .catch(err => console.warn('Could not load mastered word IDs:', err));
  }, [sessionAnswered]);

  // Ensure view glides to top when quiz completes so user never misses celebration banner
  useEffect(() => {
    if (isSessionComplete) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSessionComplete]);

  const normalizeText = (text: string): string => {
    let mainText = text;
    const outsideParentheses = text.replace(/\s*\([^)]*\)\s*/g, "");
    if (outsideParentheses.trim()) {
      mainText = outsideParentheses;
    }
    let normalized = mainText.toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return normalized;
  };

  const normalizeEnglishPhrase = (text: string): string => {
    let s = text.toLowerCase().trim();

    // Remove text inside parentheses first (e.g. 'Hello (formal)' -> 'Hello')
    s = s.replace(/\s*\([^)]*\)\s*/g, ' ');

    // Normalize contractions
    const contractionMap: [RegExp, string][] = [
      [/\b(where's|wheres)\b/gi, 'where is'],
      [/\b(what's|whats)\b/gi, 'what is'],
      [/\b(who's|whos)\b/gi, 'who is'],
      [/\b(how's|hows)\b/gi, 'how is'],
      [/\b(that's|thats)\b/gi, 'that is'],
      [/\b(it's|its)\b/gi, 'it is'],
      [/\b(there's|theres)\b/gi, 'there is'],
      [/\b(here's|heres)\b/gi, 'here is'],
      [/\b(i'm|im)\b/gi, 'i am'],
      [/\b(you're|youre)\b/gi, 'you are'],
      [/\b(we're|were)\b/gi, 'we are'],
      [/\b(they're|theyre)\b/gi, 'they are'],
      [/\b(don't|dont)\b/gi, 'do not'],
      [/\b(doesn't|doesnt)\b/gi, 'does not'],
      [/\b(didn't|didnt)\b/gi, 'did not'],
      [/\b(can't|cant)\b/gi, 'cannot'],
      [/\b(won't|wont)\b/gi, 'will not'],
      [/\b(i've|ive)\b/gi, 'i have'],
      [/\b(you've|youve)\b/gi, 'you have'],
      [/\b(i'll|ill)\b/gi, 'i will'],
      [/\b(you'll|youll)\b/gi, 'you will'],
      [/\bwanna\b/gi, 'want to'],
      [/\bgonna\b/gi, 'going to']
    ];

    contractionMap.forEach(([pattern, replacement]) => {
      s = s.replace(pattern, replacement);
    });

    // Strip punctuation
    s = s.replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, ' ').replace(/\s+/g, ' ').trim();

    // Normalize common synonyms & alternative phrasing
    const synonymMap: [RegExp, string][] = [
      [/\b(restroom|toilet|washroom|water closet|wc|lavatory)\b/gi, 'bathroom'],
      [/\b(hi|hey|greetings)\b/gi, 'hello'],
      [/\b(bye|bye bye|see you|farewell)\b/gi, 'goodbye'],
      [/\b(thanks|thank u|many thanks)\b/gi, 'thank you'],
      [/\b(welcome|no problem|not at all|my pleasure|dont mention it)\b/gi, 'you are welcome'],
      [/\b(sorry|pardon|pardon me|forgive me)\b/gi, 'excuse me'],
      [/\b(speak slower|talk slower|speak slowly|talk more slowly)\b/gi, 'speak more slowly'],
      [/\b(repeat please|say it again|say that again|can you repeat)\b/gi, 'please repeat'],
      [/\b(how are you doing|how are things|how is it going)\b/gi, 'how are you'],
      [/\b(how much is it|how much is this|whats the price|what is the price)\b/gi, 'how much does it cost'],
      [/\b(im hungry|i am hungry|i want food|i would like to eat)\b/gi, 'i want to eat'],
      [/\b(im thirsty|i am thirsty|i want water|i would like to drink)\b/gi, 'i want to drink'],
      [/\b(i do not understand|i do not get it|i dont get it)\b/gi, 'i dont understand'],
      [/\b(i am called|they call me)\b/gi, 'my name is'],
      [/\b(yeah|yep|yup)\b/gi, 'yes'],
      [/\b(nope|nah)\b/gi, 'no']
    ];

    synonymMap.forEach(([pattern, replacement]) => {
      s = s.replace(pattern, replacement);
    });

    return s.replace(/\s+/g, ' ').trim();
  };

  const numberEquivalents: { [key: string]: string[] } = {
    "0": ["zero", "ноль"],
    "1": ["one", "один", "одна", "одно"],
    "2": ["two", "два", "две"],
    "3": ["three", "три"],
    "4": ["four", "четыре"],
    "5": ["five", "пять"],
    "6": ["six", "шесть"],
    "7": ["seven", "семь"],
    "8": ["eight", "восемь"],
    "9": ["nine", "девять"],
    "10": ["ten", "десять"],
    "11": ["eleven", "одиннадцать"],
    "12": ["twelve", "двенадцать"],
    "13": ["thirteen", "тринадцать"],
    "14": ["fourteen", "четырнадцать"],
    "15": ["fifteen", "пятнадцать"],
    "16": ["sixteen", "шестнадцать"],
    "17": ["seventeen", "семнадцать"],
    "18": ["eighteen", "восемьнадцать"],
    "19": ["nineteen", "девятнадцать"],
    "20": ["twenty", "двадцать"],
    "30": ["thirty", "тридцать"],
    "40": ["forty", "сорок"],
    "50": ["fifty", "пятьдесят"],
    "60": ["sixty", "шестьдесят"],
    "70": ["seventy", "семьдесят"],
    "80": ["eighty", "восемьдесят"],
    "90": ["ninety", "девяносто"],
    "100": ["hundred", "сто"]
  };

  const checkNumberEquivalence = (userAnswer: string, correctAnswer: string): boolean => {
    if (userAnswer === correctAnswer) return true;
    if (/^\d+$/.test(userAnswer)) {
      const possibleWordForms = numberEquivalents[userAnswer] || [];
      return possibleWordForms.some(wordForm => 
        correctAnswer === wordForm || correctAnswer.includes(wordForm)
      );
    } else {
      for (const [digit, wordForms] of Object.entries(numberEquivalents)) {
        if (wordForms.includes(userAnswer) && (correctAnswer === digit || correctAnswer.includes(digit))) {
          return true;
        }
      }
    }
    return false;
  };

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };

  // Build the complete list of all 209 curriculum questions
  const getAllQuestions = useCallback((): QuestionDef[] => {
    if (!data) return [];
    const questions: QuestionDef[] = [];

    if (data.alphabet && Array.isArray(data.alphabet)) {
      data.alphabet.forEach(item => {
        const char = item.character || item.letter || '';
        questions.push({
          item,
          isPrimaryDirection: true,
          id: `alphabet-${char}`,
          category: 'alphabet'
        });
      });
    }

    const categories = ['basicPhrases', 'numbers', 'commonWords'];
    categories.forEach(cat => {
      if (data[cat] && Array.isArray(data[cat])) {
        data[cat].forEach((item: PhraseItem) => {
          const phraseText = item.phrase || '';
          const meaningText = item.meaning || '';
          questions.push({
            item,
            isPrimaryDirection: true,
            id: `${cat}-${phraseText}-to-meaning`,
            category: cat
          });
          questions.push({
            item,
            isPrimaryDirection: false,
            id: `${cat}-${meaningText}-to-phrase`,
            category: cat
          });
        });
      }
    });

    return questions;
  }, [data]);

  const totalCurriculumQuestions = (data?.alphabet?.length || 0) +
    ((data?.basicPhrases?.length || 0) * 2) +
    ((data?.numbers?.length || 0) * 2) +
    ((data?.commonWords?.length || 0) * 2);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playAudio = useCallback((textToSpeak: string, rate: number = 0.92) => {
    if (!textToSpeak) return;
    setIsPlayingAudio(true);
    try {
      speak(
        textToSpeak,
        'en-US',
        'quiz-audio-controller',
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false),
        { rate }
      );
    } catch (err) {
      setIsPlayingAudio(false);
    }
  }, []);

  const getRandomQuestion = useCallback((overrideMastered?: Set<string>) => {
    setUserAnswer('');
    setIsCorrect(null);
    setShowNext(false);
    setIsWordJustMastered(false);

    if (!data) return;

    try {
      const allQuestions = getAllQuestions();
      if (allQuestions.length === 0) {
        setCurrentQuestion({
          type: 'dummy',
          prompt: 'No questions available',
          answer: '',
          hint: 'Please load some content first',
          target: ''
        });
        return;
      }

      const activeMastered = overrideMastered || masteredWordIdsRef.current || masteredWordIds;

      // Priority 1: Unmastered (masteryLevel < 5) AND not yet asked in current rotation
      let candidatePool = allQuestions.filter(q => 
        !activeMastered.has(q.id) && !askedQuestionsRef.current.has(q.id)
      );

      // Priority 2: If all unmastered were asked in this rotation, reset rotation and pick from unmastered
      if (candidatePool.length === 0) {
        askedQuestionsRef.current.clear();
        candidatePool = allQuestions.filter(q => !activeMastered.has(q.id));
      }

      // Priority 3: If ALL 209 questions are mastered, allow practicing mastered questions
      if (candidatePool.length === 0) {
        candidatePool = allQuestions.filter(q => !askedQuestionsRef.current.has(q.id));
        if (candidatePool.length === 0) {
          askedQuestionsRef.current.clear();
          candidatePool = allQuestions;
        }
      }

      const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      askedQuestionsRef.current.add(selected.id);

      if (selected.category === 'alphabet') {
        const item = selected.item as AlphabetItem;
        const character = (item as any).character || (item as any).letter || '';
        const pronunciation = item.pronunciation?.toString() || '';
        const example = item.example?.toString() || '';

        // English alphabet (A-Z)
        const exampleWords = example
          .replace(/^as in\s+/i, '')
          .split(/[,/&]/)
          .map(w => w.trim().toLowerCase())
          .filter(w => w.length > 0);

        const validAnswers: string[] = [character.toLowerCase(), ...exampleWords];
        if (pronunciation && !pronunciation.includes('/')) {
          validAnswers.push(pronunciation.toLowerCase());
        }

        const primaryExample = exampleWords[0] || 'apple';

        if (selected.isPrimaryDirection) {
          // Visual Letter Phonics
          setCurrentQuestion({
            type: 'alphabet',
            prompt: character,
            answer: validAnswers.join(' / '),
            hint: pronunciation ? `Phonics sound: ${pronunciation} — Type letter or example word:` : 'Type the letter or an example word:',
            target: character,
            id: selected.id,
            badge: '🔤 Alphabet Phonics',
            audioText: `${character}. as in ${primaryExample}`
          });
        } else {
          // Phonics Listen & Type Mode
          setCurrentQuestion({
            type: 'alphabet',
            prompt: 'Letter Sound',
            answer: validAnswers.join(' / '),
            hint: 'Listen to the phonics sound and type the letter or an example word:',
            target: character,
            id: selected.id,
            badge: '🎧 Phonics & Sound',
            isAudioMode: true,
            audioText: `${primaryExample}. Letter ${character}.`
          });
        }
      } else if (selected.category === 'numbers') {
        const item = selected.item as PhraseItem;
        const wordForm = (item.phrase || '').toString();
        const digitRaw = (item.meaning || '').toString();

        // Check if item is a time phrase (e.g. "2:30", "2:00", "2:45")
        const timeMatch = digitRaw.match(/\b\d{1,2}:\d{2}\b/);
        const isTimeItem = Boolean(timeMatch);
        const digitsOnly = isTimeItem
          ? timeMatch![0]
          : (digitRaw.match(/\d[\d,]*/)?.[0]?.replace(',', '') || digitRaw);

        // English numbers
        if (selected.isPrimaryDirection) {
          // Words to Digits
          const promptInstruction = isTimeItem
            ? 'Type this time in digital format (e.g. 12:00):'
            : 'Type this number in digits:';

          setCurrentQuestion({
            type: selected.category,
            prompt: wordForm,
            answer: `${digitsOnly} / ${wordForm.toLowerCase()}`,
            hint: promptInstruction,
            target: wordForm,
            id: selected.id,
            badge: isTimeItem ? '⏰ Time & Digits' : '🔢 Digits',
            audioText: wordForm
          });
        } else {
          // Digits to English Words
          const promptInstruction = isTimeItem
            ? `Spell this time in English words (${wordForm.length} letters):`
            : `Spell this number in English words (${wordForm.length} letters):`;

          setCurrentQuestion({
            type: selected.category,
            prompt: digitsOnly,
            answer: `${wordForm.toLowerCase()} / ${digitsOnly}`,
            hint: promptInstruction,
            target: wordForm,
            id: selected.id,
            badge: isTimeItem ? '⏰ Time Telling' : '🔢 Number Spelling',
            audioText: wordForm
          });
        }
      } else if (selected.category === 'basicPhrases') {
        const item = selected.item as PhraseItem;
        const phrase = (item.phrase || '').toString();
        const situation = (item.meaning || '').toString();

        if (selected.isPrimaryDirection) {
          // Conversational Dialogue Cloze Completion
          const dialogue = findDialogue(phrase);
          if (dialogue) {
            const cleanMissing = dialogue.missingWord.replace(/[.,!?;:]/g, '');
            const firstLetter = cleanMissing.charAt(0);
            const slots = '_'.repeat(Math.max(1, cleanMissing.length - 1));
            const clozeDisplay = `${firstLetter}${slots}`;

            setCurrentQuestion({
              type: selected.category,
              prompt: `A: "${dialogue.speakerA}" | B: "${dialogue.speakerBPrefix} ${clozeDisplay}${dialogue.speakerBSuffix || ''}"`,
              answer: `${cleanMissing.toLowerCase()} / ${phrase.toLowerCase()}`,
              hint: `Complete Speaker B's reply (${cleanMissing.length} letters):`,
              target: phrase,
              id: selected.id,
              badge: '💬 Complete the Dialogue',
              audioText: phrase,
              dialogue: {
                speakerA: dialogue.speakerA,
                speakerBPrefix: dialogue.speakerBPrefix,
                clozeDisplay,
                speakerBSuffix: dialogue.speakerBSuffix,
                missingWord: cleanMissing,
                contextHint: dialogue.contextHint
              }
            });
          } else {
            // Dynamic cloze on last word
            const words = phrase.split(' ');
            let clozePrompt = phrase;
            let clozeAnswer = phrase.toLowerCase();
            let letterNotice = '';

            if (words.length >= 2) {
              const rawLast = words[words.length - 1];
              const cleanLast = rawLast.replace(/[.,!?;:]/g, '');
              const punctuation = rawLast.match(/[.,!?;:]+$/)?.[0] || '';
              const startWords = words.slice(0, -1).join(' ');
              const firstLetter = cleanLast.charAt(0);
              const slots = '_'.repeat(Math.max(1, cleanLast.length - 1));
              clozePrompt = `${startWords} ${firstLetter}${slots}${punctuation}`;
              clozeAnswer = `${cleanLast.toLowerCase()} / ${phrase.toLowerCase()}`;
              letterNotice = ` • ${cleanLast.length} letters`;
            }

            setCurrentQuestion({
              type: selected.category,
              prompt: clozePrompt,
              answer: clozeAnswer,
              hint: `Complete the phrase (${situation}${letterNotice}):`,
              target: phrase,
              id: selected.id,
              badge: '💬 Complete the Phrase',
              audioText: phrase
            });
          }
        } else {
          // Listen & Type Audio Dictation Mode
          const wordCount = phrase.trim().split(/\s+/).length;
          setCurrentQuestion({
            type: selected.category,
            prompt: 'Type what you hear',
            answer: phrase.toLowerCase(),
            hint: `Type what you hear (${wordCount} ${wordCount === 1 ? 'word' : 'words'}):`,
            target: phrase,
            id: selected.id,
            badge: '🎧 Listen & Type',
            isAudioMode: true,
            audioText: phrase
          });
        }
      } else {
        // commonWords
        const item = selected.item as PhraseItem;
        const word = (item.phrase || '').toString();
        const definition = (item.meaning || '').toString();

        const cleanWord = word.trim();
        const validTargets = [cleanWord.toLowerCase()];
        if (cleanWord.toLowerCase().startsWith('to ')) {
          validTargets.push(cleanWord.slice(3).toLowerCase());
        }
        const targetAnswer = validTargets.join(' / ');
        const firstLetter = cleanWord.charAt(0).toUpperCase();

        if (selected.isPrimaryDirection) {
          // Mode: Listen & Type Audio Dictation
          setCurrentQuestion({
            type: selected.category,
            prompt: 'Type what you hear',
            answer: targetAnswer,
            hint: `Type what you hear (Starts with "${firstLetter}" • ${cleanWord.length} letters):`,
            target: cleanWord,
            id: selected.id,
            badge: '🎧 Listen & Type',
            isAudioMode: true,
            audioText: cleanWord
          });
        } else {
          // Mode: Meaning and First-Letter Cloze Scaffold
          const slots = '_'.repeat(Math.max(1, cleanWord.length - 1));
          setCurrentQuestion({
            type: selected.category,
            prompt: definition,
            answer: targetAnswer,
            hint: `What is the English word? (${firstLetter}${slots} • ${cleanWord.length} letters):`,
            target: cleanWord,
            id: selected.id,
            badge: '📖 Vocabulary & Spelling',
            audioText: cleanWord
          });
        }
      }

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Error generating question:", error);
      setCurrentQuestion({
        type: 'emergency',
        prompt: 'Hello',
        answer: 'hello',
        hint: 'How do you say this in English?',
        target: 'Hello',
        id: 'emergency-hello'
      });
    }
  }, [data, getAllQuestions, masteredWordIds]);

  const handleNextQuestion = useCallback(() => {
    setSessionIndex(prev => prev + 1);
    getRandomQuestion();
  }, [getRandomQuestion]);

  const handleCompleteSession = useCallback(async () => {
    setIsSessionComplete(true);
    sessionStatsRef.current.isSaved = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      await ProgressService.recordQuizSession({
        category: 'mixed',
        score: sessionScore,
        totalQuestions: sessionGoal,
      });
    } catch (err) {
      console.warn('Could not record completed quiz session:', err);
    }
  }, [sessionScore, sessionGoal]);

  const startNewQuizSession = useCallback((newGoal?: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const goal = newGoal !== undefined ? newGoal : sessionGoal;
    if (newGoal !== undefined && newGoal !== sessionGoal) {
      setSessionGoal(goal);
      localStorage.setItem('english_quiz_goal', goal.toString());
    }
    setSessionIndex(1);
    setSessionScore(0);
    setSessionAnswered(0);
    setMissedInSession([]);
    setIsSessionComplete(false);
    setShowNext(false);
    setUserAnswer('');
    setIsCorrect(null);
    setIsWordJustMastered(false);
    sessionStatsRef.current = {
      score: 0,
      total: 0,
      category: 'mixed',
      isSaved: false
    };
    getRandomQuestion();
  }, [sessionGoal, getRandomQuestion]);

  const handleGoalChange = (newGoal: number) => {
    if (newGoal === sessionGoal) return;
    localStorage.setItem('english_quiz_goal', newGoal.toString());
    setSessionGoal(newGoal);

    // If user already reached or exceeded the new goal, finish session right away
    if (sessionAnswered >= newGoal) {
      setIsSessionComplete(true);
      sessionStatsRef.current.isSaved = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      ProgressService.recordQuizSession({
        category: 'mixed',
        score: sessionScore,
        totalQuestions: sessionAnswered,
      }).catch(err => console.warn('Could not save quiz session on goal adjustment:', err));
    }
  };

  // Global event listener for Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isSessionComplete) {
          e.preventDefault();
          startNewQuizSession();
        } else if (showNext && !(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
          if (sessionAnswered >= sessionGoal) {
            handleCompleteSession();
          } else {
            handleNextQuestion();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSessionComplete, showNext, sessionAnswered, sessionGoal, handleCompleteSession, handleNextQuestion, startNewQuizSession]);

  // Focus input when new question appears
  useEffect(() => {
    if (currentQuestion && !showNext && !isSessionComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion, showNext, isSessionComplete]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      getRandomQuestion();

      correctSoundRef.current = new Audio('audio/sounds/correct.mp3');
      incorrectSoundRef.current = new Audio('audio/sounds/incorrect.mp3');
    }
  }, [getRandomQuestion]);

  // Cleanup effect: save partial session if unmounting mid-quiz (at least 3 questions answered)
  useEffect(() => {
    return () => {
      const currentStats = sessionStatsRef.current;
      if (currentStats.total >= 3 && !currentStats.isSaved) {
        ProgressService.recordQuizSession({
          category: currentStats.category,
          score: currentStats.score,
          totalQuestions: currentStats.total,
        }).catch(err => console.warn('Could not save unmounted quiz session:', err));
      }

      if (correctSoundRef.current) correctSoundRef.current.pause();
      if (incorrectSoundRef.current) incorrectSoundRef.current.pause();
    };
  }, []);

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const userAnswerNormalized = normalizeText(userAnswer);
    let isAnswerCorrect = false;

    // Conversational synonym helper for common English scenarios
      const checkConversationalEquivalence = (user: string, target: string): boolean => {
        const u = normalizeEnglishPhrase(user);
        const t = normalizeEnglishPhrase(target);

        // Cafe & restaurant beverage orders (e.g. "may i please have a coffee" <=> "i would like a coffee, please" <=> "coffee")
        const coffeePhrases = [
          'i would like a coffee please',
          'i would like a coffee',
          'i like a coffee please',
          'id like a coffee please',
          'id like a coffee',
          'may i please have a coffee',
          'may i have a coffee please',
          'may i have a coffee',
          'can i please have a coffee',
          'can i have a coffee please',
          'can i have a coffee',
          'could i please have a coffee',
          'could i have a coffee please',
          'could i have a coffee',
          'could i get a coffee please',
          'could i get a coffee',
          'a coffee please',
          'coffee please',
          'a coffee',
          'coffee'
        ];
        const isUserCoffee = coffeePhrases.some(p => normalizeEnglishPhrase(p) === u);
        const isTargetCoffee = coffeePhrases.some(p => normalizeEnglishPhrase(p) === t);
        if (isUserCoffee && isTargetCoffee) {
          return true;
        }

        // Bottled water requests
        const waterPhrases = [
          'a bottle of water please',
          'a bottle of water',
          'bottle of water please',
          'bottle of water',
          'water please',
          'water'
        ];
        const isUserWater = waterPhrases.some(p => normalizeEnglishPhrase(p) === u);
        const isTargetWater = waterPhrases.some(p => normalizeEnglishPhrase(p) === t);
        if (isUserWater && isTargetWater) {
          return true;
        }

        // Asking for the restroom / bathroom
        const restroomPhrases = [
          'where is the restroom',
          'where is the bathroom',
          'where is the toilet',
          'where is restroom',
          'where is bathroom',
          'wheres the restroom',
          'wheres the bathroom',
          'wheres the toilet',
          'restroom',
          'bathroom',
          'toilet'
        ];
        const isUserRestroom = restroomPhrases.some(p => normalizeEnglishPhrase(p) === u);
        const isTargetRestroom = restroomPhrases.some(p => normalizeEnglishPhrase(p) === t);
        if (isUserRestroom && isTargetRestroom) {
          return true;
        }

        // Polite check / bill requests
        const billPhrases = [
          'check please',
          'the check please',
          'bill please',
          'the bill please',
          'could i have the check please',
          'could i have the bill please',
          'can i have the check please',
          'can i have the bill please',
          'check',
          'bill'
        ];
        const isUserBill = billPhrases.some(p => normalizeEnglishPhrase(p) === u);
        const isTargetBill = billPhrases.some(p => normalizeEnglishPhrase(p) === t);
        if (isUserBill && isTargetBill) {
          return true;
        }

        // Welcome / polite responses
        const welcomePhrases = [
          'you are welcome',
          'youre welcome',
          'welcome',
          'no problem',
          'not at all',
          'my pleasure'
        ];
        const isUserWelcome = welcomePhrases.some(p => normalizeEnglishPhrase(p) === u);
        const isTargetWelcome = welcomePhrases.some(p => normalizeEnglishPhrase(p) === t);
        if (isUserWelcome && isTargetWelcome) {
          return true;
        }

        return false;
      };

      // Collect all valid target answers (split by '/' if present, filtering out empty entries)
      const rawTargets = currentQuestion.answer.includes('/')
        ? currentQuestion.answer.split('/')
        : [currentQuestion.answer];

      const expandedTargets: string[] = [];
      rawTargets.forEach((target: string) => {
        const clean = target.trim().replace(/^[\/\\()]+|[\/\\()]+$/g, '').trim();
        if (clean.length > 0) {
          expandedTargets.push(clean);
          const noParens = clean.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
          if (noParens && noParens !== clean) {
            expandedTargets.push(noParens);
          }
        }
      });

      for (const target of expandedTargets) {
        if (isAnswerCorrect) break;

        const targetNormalized = normalizeText(target);

        // 1. Exact match after standard normalization
        if (userAnswerNormalized === targetNormalized) {
          isAnswerCorrect = true;
          break;
        }

        // 2. Number equivalence (e.g. '1' <=> 'one' <=> 'один')
        if (checkNumberEquivalence(userAnswerNormalized, targetNormalized)) {
          isAnswerCorrect = true;
          break;
        }

        // 3. Conversational equivalence
        if (checkConversationalEquivalence(userAnswer, target)) {
          isAnswerCorrect = true;
          break;
        }

        // 4. English phrase matching with contraction expansion, synonyms, and article tolerance
        const userEnglishNorm = normalizeEnglishPhrase(userAnswer);
        const targetEnglishNorm = normalizeEnglishPhrase(target);

        if (userEnglishNorm === targetEnglishNorm) {
          isAnswerCorrect = true;
          break;
        }

        // Article tolerance ("where is restroom" === "where is the bathroom")
        const stripArticles = (s: string) => s.replace(/\b(the|a|an)\b/gi, '').replace(/\s+/g, ' ').trim();
        if (stripArticles(userEnglishNorm) === stripArticles(targetEnglishNorm)) {
          isAnswerCorrect = true;
          break;
        }

        // Substring inclusion with high length overlap (e.g. formal/informal or phrase inclusion)
        if (userEnglishNorm.includes(targetEnglishNorm) || targetEnglishNorm.includes(userEnglishNorm)) {
          const minLen = Math.min(userEnglishNorm.length, targetEnglishNorm.length);
          const maxLen = Math.max(userEnglishNorm.length, targetEnglishNorm.length);
          if (minLen / maxLen >= 0.6) {
            isAnswerCorrect = true;
            break;
          }
        }

        // English Levenshtein typo tolerance (only for words of 3+ letters, forgiving 1 typo in 4-8 chars, 2 in longer)
        if (targetEnglishNorm.length >= 3) {
          const engMaxErrors = Math.max(0, Math.floor((targetEnglishNorm.length - 1) / 5));
          if (engMaxErrors > 0) {
            const engDistance = levenshteinDistance(userEnglishNorm, targetEnglishNorm);
            if (engDistance <= engMaxErrors) {
              isAnswerCorrect = true;
              break;
            }
          }
        }
      }

    setIsCorrect(isAnswerCorrect);
    setShowNext(true);
    const newSessionAnswered = sessionAnswered + 1;
    const newSessionScore = isAnswerCorrect ? sessionScore + 1 : sessionScore;
    setSessionAnswered(newSessionAnswered);

    if (isAnswerCorrect) {
      setSessionScore(newSessionScore);
      playSound(correctSoundRef.current, "correct");
    } else {
      playSound(incorrectSoundRef.current, "incorrect");
      setMissedInSession(prev => [
        ...prev,
        {
          prompt: currentQuestion.prompt,
          answer: currentQuestion.answer,
          userAnswer: userAnswer,
          category: currentQuestion.type,
          target: currentQuestion.target
        }
      ]);
    }

    sessionStatsRef.current = {
      score: newSessionScore,
      total: newSessionAnswered,
      category: currentQuestion?.type || 'mixed',
      isSaved: false
    };

    // Record word attempt in background and check if it reached mastery (level 5)
    if (currentQuestion) {
      ProgressService.recordWordAttempt({
        category: currentQuestion.type || 'alphabet',
        wordId: currentQuestion.id || `${currentQuestion.type}-${currentQuestion.prompt}`,
        prompt: currentQuestion.prompt || '',
        answer: currentQuestion.answer || '',
        isCorrect: isAnswerCorrect,
      }).then(updatedWord => {
        if (updatedWord && updatedWord.masteryLevel >= 5) {
          setIsWordJustMastered(true);
          masteredWordIdsRef.current.add(updatedWord.wordId);
          setMasteredWordIds(prev => {
            const next = new Set(prev);
            next.add(updatedWord.wordId);
            return next;
          });
        }
      }).catch(err => console.warn('Could not record word attempt:', err));
    }
  };

  const playSound = (audio: HTMLAudioElement | null, type: string) => {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn(`Could not play ${type} sound`, e);
        });
      }
    } catch (e) {
      console.warn(`Error playing ${type} sound`, e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!showNext) {
        checkAnswer();
      } else {
        if (sessionAnswered >= sessionGoal) {
          handleCompleteSession();
        } else {
          handleNextQuestion();
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserAnswer(newValue);
    setLastInput(newValue);
  };

  const handleCheckAnswer = () => {
    checkAnswer();
  };

  // --- RENDER RECAP SCREEN WHEN SESSION IS COMPLETE ---
  if (isSessionComplete) {
    const percentage = sessionGoal > 0 ? Math.round((sessionScore / sessionGoal) * 100) : 0;
    const masteredCount = masteredWordIds.size;
    const remainingToMaster = Math.max(0, totalCurriculumQuestions - masteredCount);

    let headlineTitle = '';
    let headlinePronunciation = '';
    let headlineEnglish = '';
    let recapIcon = null;

    if (percentage === 100) {
      headlineTitle = 'Outstanding!';
      headlinePronunciation = '';
      headlineEnglish = 'Perfect score! You mastered every question in this session.';
      recapIcon = <FaTrophy className="recap-icon gold" />;
    } else if (percentage >= 80) {
      headlineTitle = 'Great Job!';
      headlinePronunciation = '';
      headlineEnglish = 'Outstanding job! Your English skills are getting stronger.';
      recapIcon = <FaTrophy className="recap-icon silver" />;
    } else if (percentage >= 60) {
      headlineTitle = 'Well Done!';
      headlinePronunciation = '';
      headlineEnglish = 'Solid progress! A little more practice and you will ace it.';
      recapIcon = <FaStar className="recap-icon bronze" />;
    } else {
      headlineTitle = 'Keep Practicing!';
      headlinePronunciation = '';
      headlineEnglish = 'Practice makes perfect. Every question brings you closer!';
      recapIcon = <FaGraduationCap className="recap-icon practice" />;
    }

    return (
      <div className="section quiz-section quiz-recap-section">
        <h2 className="quiz-recap-title">Quiz Session Complete!</h2>

        <div className="quiz-card quiz-recap-card">
          <div className="recap-header">
            <div className="recap-title-row">
              <span className="recap-icon-inline">{recapIcon}</span>
              <h3 className="recap-headline-title">{headlineTitle}</h3>
            </div>
            <div className="recap-subtitle-row">
              {headlinePronunciation && (
                <span className="recap-pronunciation">
                  Pronunciation: <span className="pronunciation-text">{headlinePronunciation}</span>
                </span>
              )}
              <span className="recap-separator">·</span>
              <span className="recap-english-subtitle">{headlineEnglish}</span>
            </div>
          </div>

          <div className="recap-score-display">
            <div className="recap-score-main">
              <span className="recap-score-percent">{percentage}%</span>
              <span className="recap-score-ratio">{sessionScore} / {sessionGoal} correct</span>
            </div>

            <div className="recap-stats-row" role="group" aria-label="Session summary stats">
              <div className="recap-stat-pill">
                <span className="stat-label">Goal</span>
                <span className="stat-value">{sessionGoal} Qs</span>
              </div>
              <div className="recap-stat-pill correct">
                <span className="stat-label">Correct</span>
                <span className="stat-value">{sessionScore} ✓</span>
              </div>
              <div className="recap-stat-pill highlight">
                <span className="stat-label">Mastered</span>
                <span className="stat-value">{masteredCount} / {totalCurriculumQuestions}</span>
              </div>
              <div className="recap-stat-pill pool-left">
                <span className="stat-label">Remaining</span>
                <span className="stat-value">{remainingToMaster}</span>
              </div>
            </div>

            <p className="recap-save-notice">
              <FaCheckCircle className="notice-icon" /> Logged as 1 completed quiz in your learning progress
            </p>
          </div>

          {missedInSession.length > 0 && (
            <div className="recap-missed-section">
              <h4>Words to Review from This Session ({missedInSession.length})</h4>
              <p className="missed-hint">Listen to the correct pronunciation to reinforce your memory:</p>
              <div className="missed-words-list">
                {missedInSession.map((item, idx) => (
                  <div key={idx} className="missed-word-item">
                    <div className="missed-word-details">
                      <div className="missed-word-prompt">{item.prompt}</div>
                      <div className="missed-word-answers">
                        <span className="correct-answer-text">Answer: <strong>{item.answer.split('/')[0]}</strong></span>
                        {item.userAnswer && (
                          <span className="user-answer-text">You typed: <span className="strikethrough">{item.userAnswer}</span></span>
                        )}
                      </div>
                    </div>
                    <PronunciationButton
                      text={item.target || item.prompt}
                      audioCategory={getAudioCategory(item.category)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recap-next-session">
            <div className="recap-goal-picker">
              <span className="goal-picker-label">Choose next quiz length:</span>
              <div className="goal-picker-buttons" role="group" aria-label="Next quiz length">
                {[5, 10, 20].map(count => (
                  <button
                    key={count}
                    type="button"
                    className={`recap-goal-btn ${sessionGoal === count ? 'active' : ''}`}
                    onClick={() => {
                      setSessionGoal(count);
                      localStorage.setItem('english_quiz_goal', count.toString());
                    }}
                    title={`Set next quiz to ${count} questions`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-buttons recap-quiz-buttons">
              <button 
                className="next-button start-new-quiz-button" 
                onClick={() => startNewQuizSession(sessionGoal)}
                autoFocus
                title="Start next quiz session"
                aria-label={`Start Next Quiz (${sessionGoal} Qs)`}
              >
                <span className="btn-main-label">
                  <FaRedo className="btn-icon" /> Start Next Quiz ({sessionGoal} Qs)
                </span>
                <span className="btn-hint-badge">
                  press <span className="btn-kbd">↵ Enter</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER LOADING STATE ---
  if (!data || !currentQuestion) {
    return (
      <div className="section quiz-section">
        <h2>Test Your Knowledge</h2>
        <div className="quiz-card">
          <h3>Loading quiz questions...</h3>
          <p>Please wait while we prepare your questions.</p>
        </div>
      </div>
    );
  }

  // --- RENDER ACTIVE QUIZ SESSION ---
  const masteredCount = masteredWordIds.size;
  const remainingToMaster = Math.max(0, totalCurriculumQuestions - masteredCount);
  const progressPercent = sessionGoal > 0 ? Math.min(100, Math.round((sessionAnswered / sessionGoal) * 100)) : 0;
  const questionsLeft = Math.max(0, sessionGoal - sessionAnswered);

  return (
    <div className="section quiz-section">
      <h2 className="quiz-page-title">Test Your Knowledge</h2>

      {/* Modern Compact Quiz Header Panel / Game HUD */}
      <div className="quiz-header-panel">
        <div className="quiz-progress-bar-container" aria-label="Session progress bar">
          <div 
            className="quiz-progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="quiz-top-bar">
          <div className="session-progress-counter">
            <span className="counter-label">Question</span>
            <span className="counter-current">{sessionIndex}</span>
            <span className="counter-total">of {sessionGoal}</span>
          </div>

          <div className="session-score-badge">
            <span>Score: <strong>{sessionScore}</strong> / {sessionAnswered}</span>
          </div>

          <div className="quiz-goal-selector" role="group" aria-label="Session question count">
            {[5, 10, 20].map(count => (
              <button
                key={count}
                type="button"
                className={`goal-pill ${sessionGoal === count ? 'active' : ''}`}
                onClick={() => handleGoalChange(count)}
                title={`Set quiz session to ${count} questions`}
              >
                {count} Qs
              </button>
            ))}
          </div>
        </div>

        <div className="curriculum-pool-badge" title="Mastered words are removed from future questions">
          <span className="pool-icon">🏆</span>
          <span>Mastered: <strong>{masteredCount}</strong> / {totalCurriculumQuestions}</span>
          <span className="pool-remaining-tag">({remainingToMaster} remaining)</span>
        </div>
      </div>

      <div className="quiz-card">
        {/* Category & Mode Badge */}
        {currentQuestion.badge && (
          <div className="quiz-mode-pill-container">
            <span className="quiz-mode-pill">{currentQuestion.badge}</span>
          </div>
        )}

        <h3 className="quiz-question-hint">{currentQuestion.hint}</h3>

        {/* Dialogue Cloze Card if Dialogue Mode */}
        {currentQuestion.dialogue ? (
          <div className="quiz-dialogue-card" role="region" aria-label="Conversation dialogue">
            <div className="dialogue-bubble speaker-a">
              <span className="dialogue-avatar" aria-hidden="true">A</span>
              <div className="dialogue-content">
                <span className="dialogue-text">"{currentQuestion.dialogue.speakerA}"</span>
              </div>
            </div>
            <div className="dialogue-bubble speaker-b">
              <span className="dialogue-avatar" aria-hidden="true">B</span>
              <div className="dialogue-content">
                <span className="dialogue-text">
                  {currentQuestion.dialogue.speakerBPrefix}{' '}
                  <strong className="dialogue-cloze-target">{currentQuestion.dialogue.clozeDisplay}</strong>
                  {currentQuestion.dialogue.speakerBSuffix || ''}
                </span>
              </div>
            </div>
          </div>
        ) : currentQuestion.isAudioMode ? null : (
          <div className="quiz-prompt">
            <span className="quiz-prompt-text">{currentQuestion.prompt}</span>
            {currentQuestion.type !== 'alphabet' && currentQuestion.target && !currentQuestion.isAudioMode && (
              <PronunciationButton 
                text={currentQuestion.target}
                className="quiz-prompt-audio margin-left"
                audioCategory={getAudioCategory(currentQuestion.type)}
              />
            )}
          </div>
        )}

        {/* Dedicated Audio Controller for Audio Mode or Spoken English Prompts */}
        {(currentQuestion.isAudioMode || currentQuestion.audioText || currentQuestion.target) && (
          <div className={`quiz-audio-controller ${currentQuestion.isAudioMode ? 'hero-audio' : ''}`} role="toolbar" aria-label="Audio controls">
            <button
              type="button"
              className={`quiz-audio-btn primary ${isPlayingAudio ? 'playing' : ''}`}
              onClick={() => playAudio(currentQuestion.audioText || currentQuestion.target, 0.92)}
              aria-label="Play audio"
            >
              <FaVolumeUp className={isPlayingAudio ? "pulse-animation" : ""} />
              <span>{isPlayingAudio ? "Speaking..." : "Play Audio"}</span>
            </button>
            <button
              type="button"
              className="quiz-audio-btn slow"
              onClick={() => playAudio(currentQuestion.audioText || currentQuestion.target, 0.72)}
              aria-label="Play audio slowly at 0.7x speed"
              title="Listen at slower 0.7x speed"
            >
              <span className="slow-icon" aria-hidden="true">🐢</span>
              <span>Slow (0.7x)</span>
            </button>
          </div>
        )}
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            className="quiz-input"
            value={userAnswer}
            onChange={handleInputChange} 
            onKeyDown={handleKeyDown}
            placeholder="Your answer here..."
            disabled={showNext}
            autoFocus
          />
        </div>

        <div className="quiz-buttons">
          {!showNext && (
            <button className="check-button" onClick={handleCheckAnswer} aria-label="Check Answer">
              <span className="btn-main-label">Check Answer</span>
              <span className="btn-hint-badge">
                press <span className="btn-kbd">↵ Enter</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Fluid Duolingo-style Bottom Feedback Sheet */}
      {showNext && isCorrect !== null && (
        <div 
          className={`quiz-feedback-drawer ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
          role="region"
          aria-live="polite"
        >
          <div className="feedback-drawer-inner">
            <div className="feedback-info-area">
              <div className="feedback-header-row">
                {isCorrect ? (
                  <FaCheckCircle className="feedback-icon correct-icon" />
                ) : (
                  <FaTimesCircle className="feedback-icon incorrect-icon" />
                )}
                <div className="feedback-text-content">
                  <span className="feedback-title">
                    {isCorrect ? 'Correct!' : 'Not quite'}
                  </span>
                  {!isCorrect && (
                    <div className="feedback-answer-line">
                      <span>The correct answer is: </span>
                      <strong className="feedback-correct-word">
                        {currentQuestion.answer.includes('/') 
                          ? currentQuestion.answer.split('/')[0]
                          : currentQuestion.answer}
                      </strong>
                    </div>
                  )}

                  {isCorrect && isWordJustMastered && (
                    <div className="word-mastered-note">
                      🏆 <strong>Word Mastered (5/5)!</strong> Removed from upcoming questions.
                    </div>
                  )}
                </div>
              </div>

              {/* Audio button in feedback sheet if available */}
              {currentQuestion.target && (
                <div className="feedback-audio-action">
                  <PronunciationButton 
                    text={currentQuestion.target}
                    className="feedback-pronounce-btn"
                    audioCategory={getAudioCategory(currentQuestion.type)}
                  />
                </div>
              )}
            </div>

            <div className="feedback-action-area">
              {sessionAnswered < sessionGoal ? (
                <button 
                  className={`feedback-continue-button ${isCorrect ? 'btn-next-correct' : 'btn-next-incorrect'}`} 
                  onClick={handleNextQuestion} 
                  autoFocus
                  aria-label={`Next Question (${sessionIndex + 1}/${sessionGoal})`}
                >
                  <span className="btn-main-label">Next Question ({sessionIndex + 1}/{sessionGoal})</span>
                  <span className="btn-hint-badge">
                    press <span className="btn-kbd">↵ Enter</span>
                  </span>
                </button>
              ) : (
                <button 
                  className="feedback-continue-button finish-quiz-button" 
                  onClick={handleCompleteSession} 
                  autoFocus
                  aria-label="Complete Quiz & View Results"
                >
                  <span className="btn-main-label">
                    <FaCheckCircle className="btn-icon" /> Complete Quiz & View Results 🎉
                  </span>
                  <span className="btn-hint-badge">
                    press <span className="btn-kbd">↵ Enter</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;