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
    russianWord: 'Apple',
    englishWord: 'Noun: A sweet round fruit',
    icon: '🍎'
  },
  {
    letter: 'B',
    pronunciation: '/biː/',
    example: 'as in Book, Boy',
    russianWord: 'Book',
    englishWord: 'Noun: Pages with words to read',
    icon: '📖'
  },
  {
    letter: 'C',
    pronunciation: '/siː/ & /k/',
    example: 'as in Cat, Car',
    russianWord: 'Cat',
    englishWord: 'Noun: A small furry pet',
    icon: '🐱'
  },
  {
    letter: 'D',
    pronunciation: '/diː/',
    example: 'as in Dog, Door',
    russianWord: 'Dog',
    englishWord: 'Noun: A friendly loyal pet',
    icon: '🐶'
  },
  {
    letter: 'E',
    pronunciation: '/iː/ & /ɛ/',
    example: 'as in Egg, Elephant',
    russianWord: 'Egg',
    englishWord: 'Noun: Breakfast food from birds',
    icon: '🥚'
  },
  {
    letter: 'F',
    pronunciation: '/ɛf/',
    example: 'as in Friend, Fish',
    russianWord: 'Fish',
    englishWord: 'Noun: Animal that swims in water',
    icon: '🐟'
  },
  {
    letter: 'G',
    pronunciation: '/dʒiː/ & /ɡ/',
    example: 'as in Good, Girl',
    russianWord: 'Good',
    englishWord: 'Adjective: Positive, fine, nice',
    icon: '👍'
  },
  {
    letter: 'H',
    pronunciation: '/eɪtʃ/',
    example: 'as in House, Hello',
    russianWord: 'House',
    englishWord: 'Noun: A building where people live',
    icon: '🏠'
  },
  {
    letter: 'I',
    pronunciation: '/aɪ/ & /ɪ/',
    example: 'as in Ice, Island',
    russianWord: 'Ice',
    englishWord: 'Noun: Frozen solid water',
    icon: '🧊'
  },
  {
    letter: 'J',
    pronunciation: '/dʒeɪ/',
    example: 'as in Juice, Job',
    russianWord: 'Juice',
    englishWord: 'Noun: Drink made from fruit',
    icon: '🧃'
  },
  {
    letter: 'K',
    pronunciation: '/keɪ/',
    example: 'as in Key, Kitchen',
    russianWord: 'Key',
    englishWord: 'Noun: Metal tool to open doors',
    icon: '🔑'
  },
  {
    letter: 'L',
    pronunciation: '/ɛl/',
    example: 'as in Light, Love',
    russianWord: 'Light',
    englishWord: 'Noun: Brightness from sun or lamp',
    icon: '💡'
  },
  {
    letter: 'M',
    pronunciation: '/ɛm/',
    example: 'as in Mother, Milk',
    russianWord: 'Milk',
    englishWord: 'Noun: White dairy drink',
    icon: '🥛'
  },
  {
    letter: 'N',
    pronunciation: '/ɛn/',
    example: 'as in Name, Night',
    russianWord: 'Name',
    englishWord: 'Noun: What a person is called',
    icon: '🏷️'
  },
  {
    letter: 'O',
    pronunciation: '/oʊ/ & /ɒ/',
    example: 'as in Open, Orange',
    russianWord: 'Orange',
    englishWord: 'Noun: Round citrus fruit and color',
    icon: '🍊'
  },
  {
    letter: 'P',
    pronunciation: '/piː/',
    example: 'as in Please, Phone',
    russianWord: 'Phone',
    englishWord: 'Noun: Mobile device for calling',
    icon: '📱'
  },
  {
    letter: 'Q',
    pronunciation: '/kjuː/',
    example: 'as in Question, Quick',
    russianWord: 'Quiet',
    englishWord: 'Adjective: Making very little sound',
    icon: '🤫'
  },
  {
    letter: 'R',
    pronunciation: '/ɑːr/',
    example: 'as in Rain, Road',
    russianWord: 'Road',
    englishWord: 'Noun: Street for cars to drive',
    icon: '🛣️'
  },
  {
    letter: 'S',
    pronunciation: '/ɛs/',
    example: 'as in School, Sun',
    russianWord: 'School',
    englishWord: 'Noun: A place of learning',
    icon: '🏫'
  },
  {
    letter: 'T',
    pronunciation: '/tiː/',
    example: 'as in Time, Tea',
    russianWord: 'Tea',
    englishWord: 'Noun: Hot herbal or leaf drink',
    icon: '🍵'
  },
  {
    letter: 'U',
    pronunciation: '/juː/ & /ʌ/',
    example: 'as in Umbrella, Up',
    russianWord: 'Umbrella',
    englishWord: 'Noun: Shield used against rain',
    icon: '☂️'
  },
  {
    letter: 'V',
    pronunciation: '/viː/',
    example: 'as in Voice, Vacation',
    russianWord: 'Voice',
    englishWord: 'Noun: Sound made when speaking',
    icon: '🗣️'
  },
  {
    letter: 'W',
    pronunciation: '/ˈdʌbəl.juː/',
    example: 'as in Water, Window',
    russianWord: 'Water',
    englishWord: 'Noun: Essential clear liquid',
    icon: '💧'
  },
  {
    letter: 'X',
    pronunciation: '/ɛks/',
    example: 'as in Box, X-ray',
    russianWord: 'X-ray',
    englishWord: 'Noun: Medical picture of bones',
    icon: '🩻'
  },
  {
    letter: 'Y',
    pronunciation: '/waɪ/',
    example: 'as in Yes, Yellow',
    russianWord: 'Yellow',
    englishWord: 'Adjective: Color of the sun',
    icon: '💛'
  },
  {
    letter: 'Z',
    pronunciation: '/zɛd/ or /ziː/',
    example: 'as in Zoo, Zero',
    russianWord: 'Zero',
    englishWord: 'Noun: The number 0',
    icon: '0️⃣'
  }
];

// Essential everyday English phrases
const basicPhrases: PhraseItem[] = [
  // Greetings & Introductions
  {
    russian: 'Hello',
    english: 'Universal friendly greeting (any time of day)',
    pronunciation: '/həˈloʊ/ (heh-LOH)',
    icon: '👋'
  },
  {
    russian: 'Good morning',
    english: 'Polite greeting used from dawn until 12:00 PM',
    pronunciation: '/ɡʊd ˈmɔːrnɪŋ/ (good MOR-ning)',
    icon: '🌅'
  },
  {
    russian: 'Good afternoon',
    english: 'Greeting used between 12:00 PM and evening',
    pronunciation: '/ɡʊd ˌæftərˈnuːn/ (good af-ter-NOON)',
    icon: '☀️'
  },
  {
    russian: 'Good evening',
    english: 'Polite greeting used after 6:00 PM',
    pronunciation: '/ɡʊd ˈiːvnɪŋ/ (good EEV-ning)',
    icon: '🌆'
  },
  {
    russian: 'How are you?',
    english: 'Common inquiry about someone\'s well-being',
    pronunciation: '/haʊ ɑːr juː/ (how ar yoo)',
    icon: '😊'
  },
  {
    russian: 'Nice to meet you',
    english: 'Polite phrase said when meeting someone for the first time',
    pronunciation: '/naɪs tuː miːt juː/ (nys to meet yoo)',
    icon: '🤝'
  },
  {
    russian: 'What is your name?',
    english: 'Polite question to ask someone their name',
    pronunciation: '/wʌt ɪz jʊər neɪm/ (wuht iz yor naym)',
    icon: '❓'
  },
  {
    russian: 'My name is...',
    english: 'Standard way to introduce yourself',
    pronunciation: '/maɪ neɪm ɪz/ (my naym iz)',
    icon: '🏷️'
  },
  {
    russian: 'Goodbye',
    english: 'Standard farewell phrase',
    pronunciation: '/ɡʊdˈbaɪ/ (good-BY)',
    icon: '👋'
  },
  {
    russian: 'Have a great day',
    english: 'Warm, friendly closing remark',
    pronunciation: '/hæv ə ɡreɪt deɪ/ (hav a grayt day)',
    icon: '🌟'
  },

  // Polite Essentials
  {
    russian: 'Please',
    english: 'Essential courtesy word when asking for anything',
    pronunciation: '/pliːz/ (pleez)',
    icon: '🙏'
  },
  {
    russian: 'Thank you very much',
    english: 'Expressing sincere gratitude',
    pronunciation: '/θæŋk juː ˈvɛri mʌtʃ/ (thank yoo veh-ree much)',
    icon: '💖'
  },
  {
    russian: 'You are welcome',
    english: 'Standard polite reply to thank you',
    pronunciation: '/jʊər ˈwɛlkəm/ (yor WEL-kum)',
    icon: '🤗'
  },
  {
    russian: 'Excuse me',
    english: 'Getting attention politely or stepping past someone',
    pronunciation: '/ɪkˈskjuːz miː/ (ik-SKYOOZ mee)',
    icon: '🙋'
  },
  {
    russian: 'I am sorry',
    english: 'Apologizing for an error or bump',
    pronunciation: '/aɪ æm ˈsɒri/ (eye am SAH-ree)',
    icon: '🙇'
  },
  {
    russian: 'Yes',
    english: 'Affirmative response',
    pronunciation: '/jɛs/ (yes)',
    icon: '✅'
  },
  {
    russian: 'No',
    english: 'Negative response',
    pronunciation: '/noʊ/ (noh)',
    icon: '❌'
  },

  // Travel & Directions
  {
    russian: 'Where is the restroom?',
    english: 'Asking where the toilet or bathroom is located',
    pronunciation: '/wɛər ɪz ðə ˈrɛstruːm/ (wear iz the REST-room)',
    icon: '🚻'
  },
  {
    russian: 'Where is the bus stop?',
    english: 'Asking for public transit location',
    pronunciation: '/wɛər ɪz ðə bʌs stɒp/ (wear iz the bus stop)',
    icon: '🚏'
  },
  {
    russian: 'How do I get to the airport?',
    english: 'Asking for directions to airport',
    pronunciation: '/haʊ duː aɪ ɡɛt tuː ði ˈɛərpɔːrt/ (how doo eye get to the AIR-port)',
    icon: '✈️'
  },
  {
    russian: 'Is it far from here?',
    english: 'Inquiring about walking or travel distance',
    pronunciation: '/ɪz ɪt fɑːr frʌm hɪər/ (iz it far from heer)',
    icon: '🗺️'
  },

  // Dining & Ordering
  {
    russian: 'Can I have the check, please?',
    english: 'Asking the server for the restaurant bill',
    pronunciation: '/kæn aɪ hæv ðə tʃɛk pliːz/ (kan eye hav the chek pleez)',
    icon: '🧾'
  },
  {
    russian: 'I would like a coffee, please',
    english: 'Ordering a beverage politely at a cafe',
    pronunciation: '/aɪ wʊd laɪk ə ˈkɒfi pliːz/ (eye wood lyk a KAW-fee pleez)',
    icon: '☕'
  },
  {
    russian: 'A bottle of water, please',
    english: 'Ordering drinking water',
    pronunciation: '/ə ˈbɒtəl ʌv ˈwɔːtər pliːz/ (a BAH-tul uv WAH-ter pleez)',
    icon: '💧'
  },
  {
    russian: 'How much does this cost?',
    english: 'Asking the price of an item in a store',
    pronunciation: '/haʊ mʌtʃ dʌz ðɪs kɒst/ (how much duz this kawst)',
    icon: '🏷️'
  },

  // Communication & Assistance
  {
    russian: 'Do you speak English?',
    english: 'Asking if the other person knows English',
    pronunciation: '/duː juː spiːk ˈɪŋɡlɪʃ/ (doo yoo speek ING-glish)',
    icon: '🗣️'
  },
  {
    russian: 'Could you speak slower, please?',
    english: 'Polite request when someone speaks too quickly',
    pronunciation: '/kʊd juː spiːk ˈsloʊər pliːz/ (kood yoo speek SLOH-er pleez)',
    icon: '🐢'
  },
  {
    russian: 'I do not understand',
    english: 'Expressing that you need clarification',
    pronunciation: '/aɪ duː nɒt ˌʌndərˈstænd/ (eye doo not un-der-STAND)',
    icon: '🤔'
  },
  {
    russian: 'Could you repeat that, please?',
    english: 'Asking someone to say something again',
    pronunciation: '/kʊd juː rɪˈpiːt ðæt pliːz/ (kood yoo ree-PEET that pleez)',
    icon: '🔁'
  },
  {
    russian: 'Can you help me?',
    english: 'Asking for assistance or support',
    pronunciation: '/kæn juː hɛlp miː/ (kan yoo help mee)',
    icon: '🆘'
  }
];

// English numbers & time
const numbers: PhraseItem[] = [
  { russian: 'Zero', english: '0 - The starting number', pronunciation: '/ˈzɪəroʊ/ (ZEE-roh)', icon: '0️⃣' },
  { russian: 'One', english: '1 - Single unit', pronunciation: '/wʌn/ (wun)', icon: '1️⃣' },
  { russian: 'Two', english: '2 - A pair', pronunciation: '/tuː/ (too)', icon: '2️⃣' },
  { russian: 'Three', english: '3', pronunciation: '/θriː/ (three)', icon: '3️⃣' },
  { russian: 'Four', english: '4', pronunciation: '/fɔːr/ (for)', icon: '4️⃣' },
  { russian: 'Five', english: '5', pronunciation: '/faɪv/ (fyv)', icon: '5️⃣' },
  { russian: 'Six', english: '6', pronunciation: '/sɪks/ (siks)', icon: '6️⃣' },
  { russian: 'Seven', english: '7', pronunciation: '/ˈsɛvən/ (SEH-vun)', icon: '7️⃣' },
  { russian: 'Eight', english: '8', pronunciation: '/eɪt/ (ayt)', icon: '8️⃣' },
  { russian: 'Nine', english: '9', pronunciation: '/naɪn/ (nyn)', icon: '9️⃣' },
  { russian: 'Ten', english: '10', pronunciation: '/tɛn/ (ten)', icon: '🔟' },
  { russian: 'Eleven', english: '11', pronunciation: '/ɪˈlɛvən/ (ee-LEV-un)', icon: '1️⃣1️⃣' },
  { russian: 'Twelve', english: '12 (a dozen)', pronunciation: '/twɛlv/ (twelv)', icon: '1️⃣2️⃣' },
  { russian: 'Thirteen', english: '13', pronunciation: '/ˌθɜːrˈtiːn/ (ther-TEEN)', icon: '1️⃣3️⃣' },
  { russian: 'Fourteen', english: '14', pronunciation: '/ˌfɔːrˈtiːn/ (for-TEEN)', icon: '1️⃣4️⃣' },
  { russian: 'Fifteen', english: '15', pronunciation: '/ˌfɪfˈtiːn/ (fif-TEEN)', icon: '1️⃣5️⃣' },
  { russian: 'Sixteen', english: '16', pronunciation: '/ˌsɪksˈtiːn/ (siks-TEEN)', icon: '1️⃣6️⃣' },
  { russian: 'Seventeen', english: '17', pronunciation: '/ˌsɛvənˈtiːn/ (sev-un-TEEN)', icon: '1️⃣7️⃣' },
  { russian: 'Eighteen', english: '18', pronunciation: '/ˌeɪˈtiːn/ (ay-TEEN)', icon: '1️⃣8️⃣' },
  { russian: 'Nineteen', english: '19', pronunciation: '/ˌnaɪnˈtiːn/ (nyn-TEEN)', icon: '1️⃣9️⃣' },
  { russian: 'Twenty', english: '20', pronunciation: '/ˈtwɛnti/ (TWEN-tee)', icon: '2️⃣0️⃣' },
  { russian: 'Thirty', english: '30', pronunciation: '/ˈθɜːrti/ (THER-tee)', icon: '3️⃣0️⃣' },
  { russian: 'Forty', english: '40', pronunciation: '/ˈfɔːrti/ (FOR-tee)', icon: '4️⃣0️⃣' },
  { russian: 'Fifty', english: '50', pronunciation: '/ˈfɪfti/ (FIF-tee)', icon: '5️⃣0️⃣' },
  { russian: 'Sixty', english: '60', pronunciation: '/ˈsɪksti/ (SIKS-tee)', icon: '6️⃣0️⃣' },
  { russian: 'Seventy', english: '70', pronunciation: '/ˈsɛvənti/ (SEV-un-tee)', icon: '7️⃣0️⃣' },
  { russian: 'Eighty', english: '80', pronunciation: '/ˈeɪti/ (AY-tee)', icon: '8️⃣0️⃣' },
  { russian: 'Ninety', english: '90', pronunciation: '/ˈnaɪnti/ (NYN-tee)', icon: '9️⃣0️⃣' },
  { russian: 'One hundred', english: '100', pronunciation: '/wʌn ˈhʌndrəd/ (wun HUN-dred)', icon: '💯' },
  { russian: 'One thousand', english: '1,000', pronunciation: '/wʌn ˈθaʊzənd/ (wun THOW-zund)', icon: '🔢' },
  { russian: 'What time is it?', english: 'Asking for the current time', pronunciation: '/wʌt taɪm ɪz ɪt/ (wuht tym iz it)', icon: '⏰' },
  { russian: 'Two o\'clock', english: '2:00 sharp', pronunciation: '/tuː əˈklɒk/ (too uh-KLOK)', icon: '🕑' },
  { russian: 'Half past two', english: '2:30 (30 minutes past 2)', pronunciation: '/hæf pæst tuː/ (haf past too)', icon: '🕝' },
  { russian: 'Quarter to three', english: '2:45 (15 minutes until 3)', pronunciation: '/ˈkwɔːrtər tuː θriː/ (KWOR-ter to three)', icon: '🕒' }
];

// High-frequency core vocabulary (Oxford 3000 beginner selection)
const commonWords: PhraseItem[] = [
  // Food & Drink
  { russian: 'Water', english: 'Noun: Essential drink for life', pronunciation: '/ˈwɔːtər/ (WAH-ter)', icon: '💧' },
  { russian: 'Bread', english: 'Noun: Baked staple food', pronunciation: '/brɛd/ (bred)', icon: '🍞' },
  { russian: 'Coffee', english: 'Noun: Popular brewed morning beverage', pronunciation: '/ˈkɒfi/ (KAW-fee)', icon: '☕' },
  { russian: 'Tea', english: 'Noun: Hot or iced herbal/leaf infusion', pronunciation: '/tiː/ (tee)', icon: '🍵' },
  { russian: 'Food', english: 'Noun: Nourishment to eat', pronunciation: '/fuːd/ (food)', icon: '🍲' },
  { russian: 'Breakfast', english: 'Noun: First meal of the day', pronunciation: '/ˈbrɛkfəst/ (BREK-fust)', icon: '🍳' },
  { russian: 'Lunch', english: 'Noun: Midday meal', pronunciation: '/lʌntʃ/ (lunch)', icon: '🥪' },
  { russian: 'Dinner', english: 'Noun: Evening meal', pronunciation: '/ˈdɪnər/ (DIN-er)', icon: '🍽️' },
  { russian: 'Restaurant', english: 'Noun: Place to buy and eat meals', pronunciation: '/ˈrɛstərɒnt/ (RES-tuh-rahnt)', icon: '🍴' },

  // Places & Travel
  { russian: 'Airport', english: 'Noun: Hub for airplanes and flights', pronunciation: '/ˈɛərpɔːrt/ (AIR-port)', icon: '✈️' },
  { russian: 'Hotel', english: 'Noun: Place with rooms for travelers', pronunciation: '/hoʊˈtɛl/ (hoh-TEL)', icon: '🏨' },
  { russian: 'Station', english: 'Noun: Stop for trains, metro, or buses', pronunciation: '/ˈsteɪʃən/ (STAY-shun)', icon: '🚉' },
  { russian: 'Hospital', english: 'Noun: Medical center for illness/injury', pronunciation: '/ˈhɒspɪtəl/ (HAHS-pi-tul)', icon: '🏥' },
  { russian: 'Pharmacy', english: 'Noun: Store for medicine and prescriptions', pronunciation: '/ˈfɑːrməsi/ (FAR-muh-see)', icon: '💊' },
  { russian: 'Supermarket', english: 'Noun: Large grocery store', pronunciation: '/ˈsuːpərˌmɑːrkɪt/ (SOO-per-mar-kit)', icon: '🛒' },
  { russian: 'Bank', english: 'Noun: Financial institution for money', pronunciation: '/bæŋk/ (bank)', icon: '🏦' },
  { russian: 'City', english: 'Noun: Large populated urban area', pronunciation: '/ˈsɪti/ (SIT-ee)', icon: '🏙️' },

  // People & Family
  { russian: 'Family', english: 'Noun: Parents, children, and relatives', pronunciation: '/ˈfæməli/ (FAM-uh-lee)', icon: '👨‍👩‍👧' },
  { russian: 'Friend', english: 'Noun: A close companion you care about', pronunciation: '/frɛnd/ (frend)', icon: '🤝' },
  { russian: 'Mother', english: 'Noun: Female parent', pronunciation: '/ˈmʌðər/ (MUH-ther)', icon: '👩' },
  { russian: 'Father', english: 'Noun: Male parent', pronunciation: '/ˈfɑːðər/ (FAH-ther)', icon: '👨' },
  { russian: 'Child', english: 'Noun: Young person (plural: children)', pronunciation: '/tʃaɪld/ (chyld)', icon: '🧒' },
  { russian: 'Teacher', english: 'Noun: Instructor at school', pronunciation: '/ˈtiːtʃər/ (TEE-cher)', icon: '🧑‍🏫' },
  { russian: 'Student', english: 'Noun: A learner taking classes', pronunciation: '/ˈstjuːdənt/ (STOO-dent)', icon: '🎒' },

  // Objects & Everyday Essentials
  { russian: 'Money', english: 'Noun: Currency used to purchase goods', pronunciation: '/ˈmʌni/ (MUN-ee)', icon: '💵' },
  { russian: 'Ticket', english: 'Noun: Pass for transit, cinema, or events', pronunciation: '/ˈtɪkɪt/ (TIK-it)', icon: '🎟️' },
  { russian: 'Passport', english: 'Noun: Official travel identification document', pronunciation: '/ˈpæspɔːrt/ (PASS-port)', icon: '🛂' },
  { russian: 'Phone', english: 'Noun: Mobile smartphone', pronunciation: '/foʊn/ (fohn)', icon: '📱' },
  { russian: 'Computer', english: 'Noun: Electronic machine for work/browsing', pronunciation: '/kəmˈpjuːtər/ (kum-PYOO-ter)', icon: '💻' },
  { russian: 'Book', english: 'Noun: Printed literature or study material', pronunciation: '/bʊk/ (book)', icon: '📖' },

  // Core Verbs / Actions
  { russian: 'To learn', english: 'Verb: Gain knowledge or skill', pronunciation: '/tuː lɜːrn/ (to lern)', icon: '🧠' },
  { russian: 'To speak', english: 'Verb: Say words, communicate in a language', pronunciation: '/tuː spiːk/ (to speek)', icon: '💬' },
  { russian: 'To eat', english: 'Verb: Consume food', pronunciation: '/tuː iːt/ (to eet)', icon: '🍴' },
  { russian: 'To drink', english: 'Verb: Swallow liquids', pronunciation: '/tuː drɪŋk/ (to drink)', icon: '🥤' },
  { russian: 'To go', english: 'Verb: Move or travel somewhere', pronunciation: '/tuː ɡoʊ/ (to goh)', icon: '🚶' },
  { russian: 'To understand', english: 'Verb: Grasp the meaning', pronunciation: '/tuː ˌʌndərˈstænd/ (to un-der-STAND)', icon: '💡' }
];

export const englishData: AppData = {
  alphabet,
  basicPhrases,
  numbers,
  commonWords
};

export default englishData;
