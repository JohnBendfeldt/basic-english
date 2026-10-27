/**
 * English language curriculum data for basicenglish.school and basicenglish.academy
 * Comprehensive beginner foundation: Alphabet & Phonics, Essential Phrases, Numbers, and Core Vocabulary.
 */
import { AlphabetItem, PhraseItem, AppData } from '../types/index';

// English alphabet (A-Z) with phonics sounds and beginner vocabulary
const alphabet: AlphabetItem[] = [
  {
    letter: 'A',
    pronunciation: '/eɪ/ & /æ/',
    example: 'as in Apple, Ant',
    word: 'Apple',
    meaning: 'Noun: A sweet round fruit',
    icon: '🍎'
  },
  {
    letter: 'B',
    pronunciation: '/biː/',
    example: 'as in Book, Boy',
    word: 'Book',
    meaning: 'Noun: Pages with words to read',
    icon: '📖'
  },
  {
    letter: 'C',
    pronunciation: '/siː/ & /k/',
    example: 'as in Cat, Car',
    word: 'Cat',
    meaning: 'Noun: A small furry pet',
    icon: '🐱'
  },
  {
    letter: 'D',
    pronunciation: '/diː/',
    example: 'as in Dog, Door',
    word: 'Dog',
    meaning: 'Noun: A friendly loyal pet',
    icon: '🐶'
  },
  {
    letter: 'E',
    pronunciation: '/iː/ & /ɛ/',
    example: 'as in Egg, Elephant',
    word: 'Egg',
    meaning: 'Noun: Breakfast food from birds',
    icon: '🥚'
  },
  {
    letter: 'F',
    pronunciation: '/ɛf/',
    example: 'as in Friend, Fish',
    word: 'Fish',
    meaning: 'Noun: Animal that swims in water',
    icon: '🐟'
  },
  {
    letter: 'G',
    pronunciation: '/dʒiː/ & /ɡ/',
    example: 'as in Good, Girl',
    word: 'Good',
    meaning: 'Adjective: Positive, fine, nice',
    icon: '👍'
  },
  {
    letter: 'H',
    pronunciation: '/eɪtʃ/',
    example: 'as in House, Hello',
    word: 'House',
    meaning: 'Noun: A building where people live',
    icon: '🏠'
  },
  {
    letter: 'I',
    pronunciation: '/aɪ/ & /ɪ/',
    example: 'as in Ice, Island',
    word: 'Ice',
    meaning: 'Noun: Frozen solid water',
    icon: '🧊'
  },
  {
    letter: 'J',
    pronunciation: '/dʒeɪ/',
    example: 'as in Juice, Job',
    word: 'Juice',
    meaning: 'Noun: Drink made from fruit',
    icon: '🧃'
  },
  {
    letter: 'K',
    pronunciation: '/keɪ/',
    example: 'as in Key, Kitchen',
    word: 'Key',
    meaning: 'Noun: Metal tool to open doors',
    icon: '🔑'
  },
  {
    letter: 'L',
    pronunciation: '/ɛl/',
    example: 'as in Light, Love',
    word: 'Light',
    meaning: 'Noun: Brightness from sun or lamp',
    icon: '💡'
  },
  {
    letter: 'M',
    pronunciation: '/ɛm/',
    example: 'as in Mother, Milk',
    word: 'Milk',
    meaning: 'Noun: White dairy drink',
    icon: '🥛'
  },
  {
    letter: 'N',
    pronunciation: '/ɛn/',
    example: 'as in Name, Night',
    word: 'Name',
    meaning: 'Noun: What a person is called',
    icon: '🏷️'
  },
  {
    letter: 'O',
    pronunciation: '/oʊ/ & /ɒ/',
    example: 'as in Open, Orange',
    word: 'Orange',
    meaning: 'Noun: Round citrus fruit and color',
    icon: '🍊'
  },
  {
    letter: 'P',
    pronunciation: '/piː/',
    example: 'as in Please, Phone',
    word: 'Phone',
    meaning: 'Noun: Mobile device for calling',
    icon: '📱'
  },
  {
    letter: 'Q',
    pronunciation: '/kjuː/',
    example: 'as in Question, Quick',
    word: 'Quiet',
    meaning: 'Adjective: Making very little sound',
    icon: '🤫'
  },
  {
    letter: 'R',
    pronunciation: '/ɑːr/',
    example: 'as in Rain, Road',
    word: 'Road',
    meaning: 'Noun: Street for cars to drive',
    icon: '🛣️'
  },
  {
    letter: 'S',
    pronunciation: '/ɛs/',
    example: 'as in School, Sun',
    word: 'School',
    meaning: 'Noun: A place of learning',
    icon: '🏫'
  },
  {
    letter: 'T',
    pronunciation: '/tiː/',
    example: 'as in Time, Tea',
    word: 'Tea',
    meaning: 'Noun: Hot herbal or leaf drink',
    icon: '🍵'
  },
  {
    letter: 'U',
    pronunciation: '/juː/ & /ʌ/',
    example: 'as in Umbrella, Up',
    word: 'Umbrella',
    meaning: 'Noun: Shield used against rain',
    icon: '☂️'
  },
  {
    letter: 'V',
    pronunciation: '/viː/',
    example: 'as in Voice, Vacation',
    word: 'Voice',
    meaning: 'Noun: Sound made when speaking',
    icon: '🗣️'
  },
  {
    letter: 'W',
    pronunciation: '/ˈdʌbəl.juː/',
    example: 'as in Water, Window',
    word: 'Water',
    meaning: 'Noun: Essential clear liquid',
    icon: '💧'
  },
  {
    letter: 'X',
    pronunciation: '/ɛks/',
    example: 'as in Box, X-ray',
    word: 'X-ray',
    meaning: 'Noun: Medical picture of bones',
    icon: '🩻'
  },
  {
    letter: 'Y',
    pronunciation: '/waɪ/',
    example: 'as in Yes, Yellow',
    word: 'Yellow',
    meaning: 'Adjective: Color of the sun',
    icon: '💛'
  },
  {
    letter: 'Z',
    pronunciation: '/zɛd/ or /ziː/',
    example: 'as in Zoo, Zero',
    word: 'Zero',
    meaning: 'Noun: The number 0',
    icon: '0️⃣'
  }
];

// Essential everyday English phrases
const basicPhrases: PhraseItem[] = [
  // Greetings & Introductions
  {
    phrase: 'Hello',
    meaning: 'Universal friendly greeting (any time of day)',
    pronunciation: '/həˈloʊ/ (heh-LOH)',
    icon: '👋'
  },
  {
    phrase: 'Good morning',
    meaning: 'Polite greeting used from dawn until 12:00 PM',
    pronunciation: '/ɡʊd ˈmɔːrnɪŋ/ (good MOR-ning)',
    icon: '🌅'
  },
  {
    phrase: 'Good afternoon',
    meaning: 'Greeting used between 12:00 PM and evening',
    pronunciation: '/ɡʊd ˌæftərˈnuːn/ (good af-ter-NOON)',
    icon: '☀️'
  },
  {
    phrase: 'Good evening',
    meaning: 'Polite greeting used after 6:00 PM',
    pronunciation: '/ɡʊd ˈiːvnɪŋ/ (good EEV-ning)',
    icon: '🌆'
  },
  {
    phrase: 'How are you?',
    meaning: 'Common inquiry about someone\'s well-being',
    pronunciation: '/haʊ ɑːr juː/ (how ar yoo)',
    icon: '😊'
  },
  {
    phrase: 'Nice to meet you',
    meaning: 'Polite phrase said when meeting someone for the first time',
    pronunciation: '/naɪs tuː miːt juː/ (nys to meet yoo)',
    icon: '🤝'
  },
  {
    phrase: 'What is your name?',
    meaning: 'Polite question to ask someone their name',
    pronunciation: '/wʌt ɪz jʊər neɪm/ (wuht iz yor naym)',
    icon: '❓'
  },
  {
    phrase: 'My name is...',
    meaning: 'Standard way to introduce yourself',
    pronunciation: '/maɪ neɪm ɪz/ (my naym iz)',
    icon: '🏷️'
  },
  {
    phrase: 'Goodbye',
    meaning: 'Standard farewell phrase',
    pronunciation: '/ɡʊdˈbaɪ/ (good-BY)',
    icon: '👋'
  },
  {
    phrase: 'Have a great day',
    meaning: 'Warm, friendly closing remark',
    pronunciation: '/hæv ə ɡreɪt deɪ/ (hav a grayt day)',
    icon: '🌟'
  },

  // Polite Essentials
  {
    phrase: 'Please',
    meaning: 'Essential courtesy word when asking for anything',
    pronunciation: '/pliːz/ (pleez)',
    icon: '🙏'
  },
  {
    phrase: 'Thank you very much',
    meaning: 'Expressing sincere gratitude',
    pronunciation: '/θæŋk juː ˈvɛri mʌtʃ/ (thank yoo veh-ree much)',
    icon: '💖'
  },
  {
    phrase: 'You are welcome',
    meaning: 'Standard polite reply to thank you',
    pronunciation: '/jʊər ˈwɛlkəm/ (yor WEL-kum)',
    icon: '🤗'
  },
  {
    phrase: 'Excuse me',
    meaning: 'Getting attention politely or stepping past someone',
    pronunciation: '/ɪkˈskjuːz miː/ (ik-SKYOOZ mee)',
    icon: '🙋'
  },
  {
    phrase: 'I am sorry',
    meaning: 'Apologizing for an error or bump',
    pronunciation: '/aɪ æm ˈsɒri/ (eye am SAH-ree)',
    icon: '🙇'
  },
  {
    phrase: 'Yes',
    meaning: 'Affirmative response',
    pronunciation: '/jɛs/ (yes)',
    icon: '✅'
  },
  {
    phrase: 'No',
    meaning: 'Negative response',
    pronunciation: '/noʊ/ (noh)',
    icon: '❌'
  },

  // Travel & Directions
  {
    phrase: 'Where is the restroom?',
    meaning: 'Asking where the toilet or bathroom is located',
    pronunciation: '/wɛər ɪz ðə ˈrɛstruːm/ (wear iz the REST-room)',
    icon: '🚻'
  },
  {
    phrase: 'Where is the bus stop?',
    meaning: 'Asking for public transit location',
    pronunciation: '/wɛər ɪz ðə bʌs stɒp/ (wear iz the bus stop)',
    icon: '🚏'
  },
  {
    phrase: 'How do I get to the airport?',
    meaning: 'Asking for directions to airport',
    pronunciation: '/haʊ duː aɪ ɡɛt tuː ði ˈɛərpɔːrt/ (how doo eye get to the AIR-port)',
    icon: '✈️'
  },
  {
    phrase: 'Is it far from here?',
    meaning: 'Inquiring about walking or travel distance',
    pronunciation: '/ɪz ɪt fɑːr frʌm hɪər/ (iz it far from heer)',
    icon: '🗺️'
  },

  // Dining & Ordering
  {
    phrase: 'Can I have the check, please?',
    meaning: 'Asking the server for the restaurant bill',
    pronunciation: '/kæn aɪ hæv ðə tʃɛk pliːz/ (kan eye hav the chek pleez)',
    icon: '🧾'
  },
  {
    phrase: 'I would like a coffee, please',
    meaning: 'Ordering a beverage politely at a cafe',
    pronunciation: '/aɪ wʊd laɪk ə ˈkɒfi pliːz/ (eye wood lyk a KAW-fee pleez)',
    icon: '☕'
  },
  {
    phrase: 'A bottle of water, please',
    meaning: 'Ordering drinking water',
    pronunciation: '/ə ˈbɒtəl ʌv ˈwɔːtər pliːz/ (a BAH-tul uv WAH-ter pleez)',
    icon: '💧'
  },
  {
    phrase: 'How much does this cost?',
    meaning: 'Asking the price of an item in a store',
    pronunciation: '/haʊ mʌtʃ dʌz ðɪs kɒst/ (how much duz this kawst)',
    icon: '🏷️'
  },

  // Communication & Assistance
  {
    phrase: 'Do you speak English?',
    meaning: 'Asking if the other person knows English',
    pronunciation: '/duː juː spiːk ˈɪŋɡlɪʃ/ (doo yoo speek ING-glish)',
    icon: '🗣️'
  },
  {
    phrase: 'Could you speak slower, please?',
    meaning: 'Polite request when someone speaks too quickly',
    pronunciation: '/kʊd juː spiːk ˈsloʊər pliːz/ (kood yoo speek SLOH-er pleez)',
    icon: '🐢'
  },
  {
    phrase: 'I do not understand',
    meaning: 'Expressing that you need clarification',
    pronunciation: '/aɪ duː nɒt ˌʌndərˈstænd/ (eye doo not un-der-STAND)',
    icon: '🤔'
  },
  {
    phrase: 'Could you repeat that, please?',
    meaning: 'Asking someone to say something again',
    pronunciation: '/kʊd juː rɪˈpiːt ðæt pliːz/ (kood yoo ree-PEET that pleez)',
    icon: '🔁'
  },
  {
    phrase: 'Can you help me?',
    meaning: 'Asking for assistance or support',
    pronunciation: '/kæn juː hɛlp miː/ (kan yoo help mee)',
    icon: '🆘'
  }
];

// English numbers & time
const numbers: PhraseItem[] = [
  { phrase: 'Zero', meaning: '0 - The starting number', pronunciation: '/ˈzɪəroʊ/ (ZEE-roh)', icon: '0️⃣' },
  { phrase: 'One', meaning: '1 - Single unit', pronunciation: '/wʌn/ (wun)', icon: '1️⃣' },
  { phrase: 'Two', meaning: '2 - A pair', pronunciation: '/tuː/ (too)', icon: '2️⃣' },
  { phrase: 'Three', meaning: '3', pronunciation: '/θriː/ (three)', icon: '3️⃣' },
  { phrase: 'Four', meaning: '4', pronunciation: '/fɔːr/ (for)', icon: '4️⃣' },
  { phrase: 'Five', meaning: '5', pronunciation: '/faɪv/ (fyv)', icon: '5️⃣' },
  { phrase: 'Six', meaning: '6', pronunciation: '/sɪks/ (siks)', icon: '6️⃣' },
  { phrase: 'Seven', meaning: '7', pronunciation: '/ˈsɛvən/ (SEH-vun)', icon: '7️⃣' },
  { phrase: 'Eight', meaning: '8', pronunciation: '/eɪt/ (ayt)', icon: '8️⃣' },
  { phrase: 'Nine', meaning: '9', pronunciation: '/naɪn/ (nyn)', icon: '9️⃣' },
  { phrase: 'Ten', meaning: '10', pronunciation: '/tɛn/ (ten)', icon: '🔟' },
  { phrase: 'Eleven', meaning: '11', pronunciation: '/ɪˈlɛvən/ (ee-LEV-un)', icon: '1️⃣1️⃣' },
  { phrase: 'Twelve', meaning: '12 (a dozen)', pronunciation: '/twɛlv/ (twelv)', icon: '1️⃣2️⃣' },
  { phrase: 'Thirteen', meaning: '13', pronunciation: '/ˌθɜːrˈtiːn/ (ther-TEEN)', icon: '1️⃣3️⃣' },
  { phrase: 'Fourteen', meaning: '14', pronunciation: '/ˌfɔːrˈtiːn/ (for-TEEN)', icon: '1️⃣4️⃣' },
  { phrase: 'Fifteen', meaning: '15', pronunciation: '/ˌfɪfˈtiːn/ (fif-TEEN)', icon: '1️⃣5️⃣' },
  { phrase: 'Sixteen', meaning: '16', pronunciation: '/ˌsɪksˈtiːn/ (siks-TEEN)', icon: '1️⃣6️⃣' },
  { phrase: 'Seventeen', meaning: '17', pronunciation: '/ˌsɛvənˈtiːn/ (sev-un-TEEN)', icon: '1️⃣7️⃣' },
  { phrase: 'Eighteen', meaning: '18', pronunciation: '/ˌeɪˈtiːn/ (ay-TEEN)', icon: '1️⃣8️⃣' },
  { phrase: 'Nineteen', meaning: '19', pronunciation: '/ˌnaɪnˈtiːn/ (nyn-TEEN)', icon: '1️⃣9️⃣' },
  { phrase: 'Twenty', meaning: '20', pronunciation: '/ˈtwɛnti/ (TWEN-tee)', icon: '2️⃣0️⃣' },
  { phrase: 'Thirty', meaning: '30', pronunciation: '/ˈθɜːrti/ (THER-tee)', icon: '3️⃣0️⃣' },
  { phrase: 'Forty', meaning: '40', pronunciation: '/ˈfɔːrti/ (FOR-tee)', icon: '4️⃣0️⃣' },
  { phrase: 'Fifty', meaning: '50', pronunciation: '/ˈfɪfti/ (FIF-tee)', icon: '5️⃣0️⃣' },
  { phrase: 'Sixty', meaning: '60', pronunciation: '/ˈsɪksti/ (SIKS-tee)', icon: '6️⃣0️⃣' },
  { phrase: 'Seventy', meaning: '70', pronunciation: '/ˈsɛvənti/ (SEV-un-tee)', icon: '7️⃣0️⃣' },
  { phrase: 'Eighty', meaning: '80', pronunciation: '/ˈeɪti/ (AY-tee)', icon: '8️⃣0️⃣' },
  { phrase: 'Ninety', meaning: '90', pronunciation: '/ˈnaɪnti/ (NYN-tee)', icon: '9️⃣0️⃣' },
  { phrase: 'One hundred', meaning: '100', pronunciation: '/wʌn ˈhʌndrəd/ (wun HUN-dred)', icon: '💯' },
  { phrase: 'One thousand', meaning: '1,000', pronunciation: '/wʌn ˈθaʊzənd/ (wun THOW-zund)', icon: '🔢' },
  { phrase: 'What time is it?', meaning: 'Asking for the current time', pronunciation: '/wʌt taɪm ɪz ɪt/ (wuht tym iz it)', icon: '⏰' },
  { phrase: 'Two o\'clock', meaning: '2:00 sharp', pronunciation: '/tuː əˈklɒk/ (too uh-KLOK)', icon: '🕑' },
  { phrase: 'Half past two', meaning: '2:30 (30 minutes past 2)', pronunciation: '/hæf pæst tuː/ (haf past too)', icon: '🕝' },
  { phrase: 'Quarter to three', meaning: '2:45 (15 minutes until 3)', pronunciation: '/ˈkwɔːrtər tuː θriː/ (KWOR-ter to three)', icon: '🕒' }
];

// High-frequency core vocabulary (Oxford 3000 beginner selection)
const commonWords: PhraseItem[] = [
  // Food & Drink
  { phrase: 'Water', meaning: 'Noun: Essential drink for life', pronunciation: '/ˈwɔːtər/ (WAH-ter)', icon: '💧' },
  { phrase: 'Bread', meaning: 'Noun: Baked staple food', pronunciation: '/brɛd/ (bred)', icon: '🍞' },
  { phrase: 'Coffee', meaning: 'Noun: Popular brewed morning beverage', pronunciation: '/ˈkɒfi/ (KAW-fee)', icon: '☕' },
  { phrase: 'Tea', meaning: 'Noun: Hot or iced herbal/leaf infusion', pronunciation: '/tiː/ (tee)', icon: '🍵' },
  { phrase: 'Food', meaning: 'Noun: Nourishment to eat', pronunciation: '/fuːd/ (food)', icon: '🍲' },
  { phrase: 'Breakfast', meaning: 'Noun: First meal of the day', pronunciation: '/ˈbrɛkfəst/ (BREK-fust)', icon: '🍳' },
  { phrase: 'Lunch', meaning: 'Noun: Midday meal', pronunciation: '/lʌntʃ/ (lunch)', icon: '🥪' },
  { phrase: 'Dinner', meaning: 'Noun: Evening meal', pronunciation: '/ˈdɪnər/ (DIN-er)', icon: '🍽️' },
  { phrase: 'Restaurant', meaning: 'Noun: Place to buy and eat meals', pronunciation: '/ˈrɛstərɒnt/ (RES-tuh-rahnt)', icon: '🍴' },

  // Places & Travel
  { phrase: 'Airport', meaning: 'Noun: Hub for airplanes and flights', pronunciation: '/ˈɛərpɔːrt/ (AIR-port)', icon: '✈️' },
  { phrase: 'Hotel', meaning: 'Noun: Place with rooms for travelers', pronunciation: '/hoʊˈtɛl/ (hoh-TEL)', icon: '🏨' },
  { phrase: 'Station', meaning: 'Noun: Stop for trains, metro, or buses', pronunciation: '/ˈsteɪʃən/ (STAY-shun)', icon: '🚉' },
  { phrase: 'Hospital', meaning: 'Noun: Medical center for illness/injury', pronunciation: '/ˈhɒspɪtəl/ (HAHS-pi-tul)', icon: '🏥' },
  { phrase: 'Pharmacy', meaning: 'Noun: Store for medicine and prescriptions', pronunciation: '/ˈfɑːrməsi/ (FAR-muh-see)', icon: '💊' },
  { phrase: 'Supermarket', meaning: 'Noun: Large grocery store', pronunciation: '/ˈsuːpərˌmɑːrkɪt/ (SOO-per-mar-kit)', icon: '🛒' },
  { phrase: 'Bank', meaning: 'Noun: Financial institution for money', pronunciation: '/bæŋk/ (bank)', icon: '🏦' },
  { phrase: 'City', meaning: 'Noun: Large populated urban area', pronunciation: '/ˈsɪti/ (SIT-ee)', icon: '🏙️' },

  // People & Family
  { phrase: 'Family', meaning: 'Noun: Parents, children, and relatives', pronunciation: '/ˈfæməli/ (FAM-uh-lee)', icon: '👨‍👩‍👧' },
  { phrase: 'Friend', meaning: 'Noun: A close companion you care about', pronunciation: '/frɛnd/ (frend)', icon: '🤝' },
  { phrase: 'Mother', meaning: 'Noun: Female parent', pronunciation: '/ˈmʌðər/ (MUH-ther)', icon: '👩' },
  { phrase: 'Father', meaning: 'Noun: Male parent', pronunciation: '/ˈfɑːðər/ (FAH-ther)', icon: '👨' },
  { phrase: 'Child', meaning: 'Noun: Young person (plural: children)', pronunciation: '/tʃaɪld/ (chyld)', icon: '🧒' },
  { phrase: 'Teacher', meaning: 'Noun: Instructor at school', pronunciation: '/ˈtiːtʃər/ (TEE-cher)', icon: '🧑‍🏫' },
  { phrase: 'Student', meaning: 'Noun: A learner taking classes', pronunciation: '/ˈstjuːdənt/ (STOO-dent)', icon: '🎒' },

  // Objects & Everyday Essentials
  { phrase: 'Money', meaning: 'Noun: Currency used to purchase goods', pronunciation: '/ˈmʌni/ (MUN-ee)', icon: '💵' },
  { phrase: 'Ticket', meaning: 'Noun: Pass for transit, cinema, or events', pronunciation: '/ˈtɪkɪt/ (TIK-it)', icon: '🎟️' },
  { phrase: 'Passport', meaning: 'Noun: Official travel identification document', pronunciation: '/ˈpæspɔːrt/ (PASS-port)', icon: '🛂' },
  { phrase: 'Phone', meaning: 'Noun: Mobile smartphone', pronunciation: '/foʊn/ (fohn)', icon: '📱' },
  { phrase: 'Computer', meaning: 'Noun: Electronic machine for work/browsing', pronunciation: '/kəmˈpjuːtər/ (kum-PYOO-ter)', icon: '💻' },
  { phrase: 'Book', meaning: 'Noun: Printed literature or study material', pronunciation: '/bʊk/ (book)', icon: '📖' },

  // Core Verbs / Actions
  { phrase: 'To learn', meaning: 'Verb: Gain knowledge or skill', pronunciation: '/tuː lɜːrn/ (to lern)', icon: '🧠' },
  { phrase: 'To speak', meaning: 'Verb: Say words, communicate in a language', pronunciation: '/tuː spiːk/ (to speek)', icon: '💬' },
  { phrase: 'To eat', meaning: 'Verb: Consume food', pronunciation: '/tuː iːt/ (to eet)', icon: '🍴' },
  { phrase: 'To drink', meaning: 'Verb: Swallow liquids', pronunciation: '/tuː drɪŋk/ (to drink)', icon: '🥤' },
  { phrase: 'To go', meaning: 'Verb: Move or travel somewhere', pronunciation: '/tuː ɡoʊ/ (to goh)', icon: '🚶' },
  { phrase: 'To understand', meaning: 'Verb: Grasp the meaning', pronunciation: '/tuː ˌʌndərˈstænd/ (to un-der-STAND)', icon: '💡' }
];

export const englishData: AppData = {
  alphabet,
  basicPhrases,
  numbers,
  commonWords
};

export default englishData;
