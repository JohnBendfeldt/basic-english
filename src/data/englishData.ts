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
    englishWord: 'Noun: A sweet round fruit'
  },
  {
    letter: 'B',
    pronunciation: '/biː/',
    example: 'as in Book, Boy',
    russianWord: 'Book',
    englishWord: 'Noun: Pages with words to read'
  },
  {
    letter: 'C',
    pronunciation: '/siː/ & /k/',
    example: 'as in Cat, Car',
    russianWord: 'Cat',
    englishWord: 'Noun: A small furry pet'
  },
  {
    letter: 'D',
    pronunciation: '/diː/',
    example: 'as in Dog, Door',
    russianWord: 'Dog',
    englishWord: 'Noun: A friendly loyal pet'
  },
  {
    letter: 'E',
    pronunciation: '/iː/ & /ɛ/',
    example: 'as in Egg, Elephant',
    russianWord: 'Egg',
    englishWord: 'Noun: Breakfast food from birds'
  },
  {
    letter: 'F',
    pronunciation: '/ɛf/',
    example: 'as in Friend, Fish',
    russianWord: 'Fish',
    englishWord: 'Noun: Animal that swims in water'
  },
  {
    letter: 'G',
    pronunciation: '/dʒiː/ & /ɡ/',
    example: 'as in Good, Girl',
    russianWord: 'Good',
    englishWord: 'Adjective: Positive, fine, nice'
  },
  {
    letter: 'H',
    pronunciation: '/eɪtʃ/',
    example: 'as in House, Hello',
    russianWord: 'House',
    englishWord: 'Noun: A building where people live'
  },
  {
    letter: 'I',
    pronunciation: '/aɪ/ & /ɪ/',
    example: 'as in Ice, Island',
    russianWord: 'Ice',
    englishWord: 'Noun: Frozen solid water'
  },
  {
    letter: 'J',
    pronunciation: '/dʒeɪ/',
    example: 'as in Juice, Job',
    russianWord: 'Juice',
    englishWord: 'Noun: Drink made from fruit'
  },
  {
    letter: 'K',
    pronunciation: '/keɪ/',
    example: 'as in Key, Kitchen',
    russianWord: 'Key',
    englishWord: 'Noun: Metal tool to open doors'
  },
  {
    letter: 'L',
    pronunciation: '/ɛl/',
    example: 'as in Light, Love',
    russianWord: 'Light',
    englishWord: 'Noun: Brightness from sun or lamp'
  },
  {
    letter: 'M',
    pronunciation: '/ɛm/',
    example: 'as in Mother, Milk',
    russianWord: 'Milk',
    englishWord: 'Noun: White dairy drink'
  },
  {
    letter: 'N',
    pronunciation: '/ɛn/',
    example: 'as in Name, Night',
    russianWord: 'Name',
    englishWord: 'Noun: What a person is called'
  },
  {
    letter: 'O',
    pronunciation: '/oʊ/ & /ɒ/',
    example: 'as in Open, Orange',
    russianWord: 'Orange',
    englishWord: 'Noun: Round citrus fruit and color'
  },
  {
    letter: 'P',
    pronunciation: '/piː/',
    example: 'as in Please, Phone',
    russianWord: 'Phone',
    englishWord: 'Noun: Mobile device for calling'
  },
  {
    letter: 'Q',
    pronunciation: '/kjuː/',
    example: 'as in Question, Quick',
    russianWord: 'Quiet',
    englishWord: 'Adjective: Making very little sound'
  },
  {
    letter: 'R',
    pronunciation: '/ɑːr/',
    example: 'as in Rain, Road',
    russianWord: 'Road',
    englishWord: 'Noun: Street for cars to drive'
  },
  {
    letter: 'S',
    pronunciation: '/ɛs/',
    example: 'as in School, Sun',
    russianWord: 'School',
    englishWord: 'Noun: A place of learning'
  },
  {
    letter: 'T',
    pronunciation: '/tiː/',
    example: 'as in Time, Tea',
    russianWord: 'Tea',
    englishWord: 'Noun: Hot herbal or leaf drink'
  },
  {
    letter: 'U',
    pronunciation: '/juː/ & /ʌ/',
    example: 'as in Umbrella, Up',
    russianWord: 'Umbrella',
    englishWord: 'Noun: Shield used against rain'
  },
  {
    letter: 'V',
    pronunciation: '/viː/',
    example: 'as in Voice, Vacation',
    russianWord: 'Voice',
    englishWord: 'Noun: Sound made when speaking'
  },
  {
    letter: 'W',
    pronunciation: '/ˈdʌbəl.juː/',
    example: 'as in Water, Window',
    russianWord: 'Water',
    englishWord: 'Noun: Essential clear liquid'
  },
  {
    letter: 'X',
    pronunciation: '/ɛks/',
    example: 'as in Box, X-ray',
    russianWord: 'X-ray',
    englishWord: 'Noun: Medical picture of bones'
  },
  {
    letter: 'Y',
    pronunciation: '/waɪ/',
    example: 'as in Yes, Yellow',
    russianWord: 'Yellow',
    englishWord: 'Adjective: Color of the sun'
  },
  {
    letter: 'Z',
    pronunciation: '/zɛd/ or /ziː/',
    example: 'as in Zoo, Zero',
    russianWord: 'Zero',
    englishWord: 'Noun: The number 0'
  }
];

// Essential everyday English phrases
const basicPhrases: PhraseItem[] = [
  // Greetings & Introductions
  {
    russian: 'Hello',
    english: 'Universal friendly greeting (any time of day)',
    pronunciation: '/həˈloʊ/ (heh-LOH)'
  },
  {
    russian: 'Good morning',
    english: 'Polite greeting used from dawn until 12:00 PM',
    pronunciation: '/ɡʊd ˈmɔːrnɪŋ/ (good MOR-ning)'
  },
  {
    russian: 'Good afternoon',
    english: 'Greeting used between 12:00 PM and evening',
    pronunciation: '/ɡʊd ˌæftərˈnuːn/ (good af-ter-NOON)'
  },
  {
    russian: 'Good evening',
    english: 'Polite greeting used after 6:00 PM',
    pronunciation: '/ɡʊd ˈiːvnɪŋ/ (good EEV-ning)'
  },
  {
    russian: 'How are you?',
    english: 'Common inquiry about someone\'s well-being',
    pronunciation: '/haʊ ɑːr juː/ (how ar yoo)'
  },
  {
    russian: 'Nice to meet you',
    english: 'Polite phrase said when meeting someone for the first time',
    pronunciation: '/naɪs tuː miːt juː/ (nys to meet yoo)'
  },
  {
    russian: 'What is your name?',
    english: 'Polite question to ask someone their name',
    pronunciation: '/wʌt ɪz jʊər neɪm/ (wuht iz yor naym)'
  },
  {
    russian: 'My name is...',
    english: 'Standard way to introduce yourself',
    pronunciation: '/maɪ neɪm ɪz/ (my naym iz)'
  },
  {
    russian: 'Goodbye',
    english: 'Standard farewell phrase',
    pronunciation: '/ɡʊdˈbaɪ/ (good-BY)'
  },
  {
    russian: 'Have a great day',
    english: 'Warm, friendly closing remark',
    pronunciation: '/hæv ə ɡreɪt deɪ/ (hav a grayt day)'
  },

  // Polite Essentials
  {
    russian: 'Please',
    english: 'Essential courtesy word when asking for anything',
    pronunciation: '/pliːz/ (pleez)'
  },
  {
    russian: 'Thank you very much',
    english: 'Expressing sincere gratitude',
    pronunciation: '/θæŋk juː ˈvɛri mʌtʃ/ (thank yoo veh-ree much)'
  },
  {
    russian: 'You are welcome',
    english: 'Standard polite reply to thank you',
    pronunciation: '/jʊər ˈwɛlkəm/ (yor WEL-kum)'
  },
  {
    russian: 'Excuse me',
    english: 'Getting attention politely or stepping past someone',
    pronunciation: '/ɪkˈskjuːz miː/ (ik-SKYOOZ mee)'
  },
  {
    russian: 'I am sorry',
    english: 'Apologizing for an error or bump',
    pronunciation: '/aɪ æm ˈsɒri/ (eye am SAH-ree)'
  },
  {
    russian: 'Yes',
    english: 'Affirmative response',
    pronunciation: '/jɛs/ (yes)'
  },
  {
    russian: 'No',
    english: 'Negative response',
    pronunciation: '/noʊ/ (noh)'
  },

  // Travel & Directions
  {
    russian: 'Where is the restroom?',
    english: 'Asking where the toilet or bathroom is located',
    pronunciation: '/wɛər ɪz ðə ˈrɛstruːm/ (wear iz the REST-room)'
  },
  {
    russian: 'Where is the bus stop?',
    english: 'Asking for public transit location',
    pronunciation: '/wɛər ɪz ðə bʌs stɒp/ (wear iz the bus stop)'
  },
  {
    russian: 'How do I get to the airport?',
    english: 'Asking for directions to airport',
    pronunciation: '/haʊ duː aɪ ɡɛt tuː ði ˈɛərpɔːrt/ (how doo eye get to the AIR-port)'
  },
  {
    russian: 'Is it far from here?',
    english: 'Inquiring about walking or travel distance',
    pronunciation: '/ɪz ɪt fɑːr frʌm hɪər/ (iz it far from heer)'
  },

  // Dining & Ordering
  {
    russian: 'Can I have the check, please?',
    english: 'Asking the server for the restaurant bill',
    pronunciation: '/kæn aɪ hæv ðə tʃɛk pliːz/ (kan eye hav the chek pleez)'
  },
  {
    russian: 'I would like a coffee, please',
    english: 'Ordering a beverage politely at a cafe',
    pronunciation: '/aɪ wʊd laɪk ə ˈkɒfi pliːz/ (eye wood lyk a KAW-fee pleez)'
  },
  {
    russian: 'A bottle of water, please',
    english: 'Ordering drinking water',
    pronunciation: '/ə ˈbɒtəl ʌv ˈwɔːtər pliːz/ (a BAH-tul uv WAH-ter pleez)'
  },
  {
    russian: 'How much does this cost?',
    english: 'Asking the price of an item in a store',
    pronunciation: '/haʊ mʌtʃ dʌz ðɪs kɒst/ (how much duz this kawst)'
  },

  // Communication & Assistance
  {
    russian: 'Do you speak English?',
    english: 'Asking if the other person knows English',
    pronunciation: '/duː juː spiːk ˈɪŋɡlɪʃ/ (doo yoo speek ING-glish)'
  },
  {
    russian: 'Could you speak slower, please?',
    english: 'Polite request when someone speaks too quickly',
    pronunciation: '/kʊd juː spiːk ˈsloʊər pliːz/ (kood yoo speek SLOH-er pleez)'
  },
  {
    russian: 'I do not understand',
    english: 'Expressing that you need clarification',
    pronunciation: '/aɪ duː nɒt ˌʌndərˈstænd/ (eye doo not un-der-STAND)'
  },
  {
    russian: 'Could you repeat that, please?',
    english: 'Asking someone to say something again',
    pronunciation: '/kʊd juː rɪˈpiːt ðæt pliːz/ (kood yoo ree-PEET that pleez)'
  },
  {
    russian: 'Can you help me?',
    english: 'Asking for assistance or support',
    pronunciation: '/kæn juː hɛlp miː/ (kan yoo help mee)'
  }
];

// English numbers & time
const numbers: PhraseItem[] = [
  { russian: 'Zero', english: '0 - The starting number', pronunciation: '/ˈzɪəroʊ/ (ZEE-roh)' },
  { russian: 'One', english: '1 - Single unit', pronunciation: '/wʌn/ (wun)' },
  { russian: 'Two', english: '2 - A pair', pronunciation: '/tuː/ (too)' },
  { russian: 'Three', english: '3', pronunciation: '/θriː/ (three)' },
  { russian: 'Four', english: '4', pronunciation: '/fɔːr/ (for)' },
  { russian: 'Five', english: '5', pronunciation: '/faɪv/ (fyv)' },
  { russian: 'Six', english: '6', pronunciation: '/sɪks/ (siks)' },
  { russian: 'Seven', english: '7', pronunciation: '/ˈsɛvən/ (SEH-vun)' },
  { russian: 'Eight', english: '8', pronunciation: '/eɪt/ (ayt)' },
  { russian: 'Nine', english: '9', pronunciation: '/naɪn/ (nyn)' },
  { russian: 'Ten', english: '10', pronunciation: '/tɛn/ (ten)' },
  { russian: 'Eleven', english: '11', pronunciation: '/ɪˈlɛvən/ (ee-LEV-un)' },
  { russian: 'Twelve', english: '12 (a dozen)', pronunciation: '/twɛlv/ (twelv)' },
  { russian: 'Thirteen', english: '13', pronunciation: '/ˌθɜːrˈtiːn/ (ther-TEEN)' },
  { russian: 'Fourteen', english: '14', pronunciation: '/ˌfɔːrˈtiːn/ (for-TEEN)' },
  { russian: 'Fifteen', english: '15', pronunciation: '/ˌfɪfˈtiːn/ (fif-TEEN)' },
  { russian: 'Sixteen', english: '16', pronunciation: '/ˌsɪksˈtiːn/ (siks-TEEN)' },
  { russian: 'Seventeen', english: '17', pronunciation: '/ˌsɛvənˈtiːn/ (sev-un-TEEN)' },
  { russian: 'Eighteen', english: '18', pronunciation: '/ˌeɪˈtiːn/ (ay-TEEN)' },
  { russian: 'Nineteen', english: '19', pronunciation: '/ˌnaɪnˈtiːn/ (nyn-TEEN)' },
  { russian: 'Twenty', english: '20', pronunciation: '/ˈtwɛnti/ (TWEN-tee)' },
  { russian: 'Thirty', english: '30', pronunciation: '/ˈθɜːrti/ (THER-tee)' },
  { russian: 'Forty', english: '40', pronunciation: '/ˈfɔːrti/ (FOR-tee)' },
  { russian: 'Fifty', english: '50', pronunciation: '/ˈfɪfti/ (FIF-tee)' },
  { russian: 'Sixty', english: '60', pronunciation: '/ˈsɪksti/ (SIKS-tee)' },
  { russian: 'Seventy', english: '70', pronunciation: '/ˈsɛvənti/ (SEV-un-tee)' },
  { russian: 'Eighty', english: '80', pronunciation: '/ˈeɪti/ (AY-tee)' },
  { russian: 'Ninety', english: '90', pronunciation: '/ˈnaɪnti/ (NYN-tee)' },
  { russian: 'One hundred', english: '100', pronunciation: '/wʌn ˈhʌndrəd/ (wun HUN-dred)' },
  { russian: 'One thousand', english: '1,000', pronunciation: '/wʌn ˈθaʊzənd/ (wun THOW-zund)' },
  { russian: 'What time is it?', english: 'Asking for the current time', pronunciation: '/wʌt taɪm ɪz ɪt/ (wuht tym iz it)' },
  { russian: 'Two o\'clock', english: '2:00 sharp', pronunciation: '/tuː əˈklɒk/ (too uh-KLOK)' },
  { russian: 'Half past two', english: '2:30 (30 minutes past 2)', pronunciation: '/hæf pæst tuː/ (haf past too)' },
  { russian: 'Quarter to three', english: '2:45 (15 minutes until 3)', pronunciation: '/ˈkwɔːrtər tuː θriː/ (KWOR-ter to three)' }
];

// High-frequency core vocabulary (Oxford 3000 beginner selection)
const commonWords: PhraseItem[] = [
  // Food & Drink
  { russian: 'Water', english: 'Noun: Essential drink for life', pronunciation: '/ˈwɔːtər/ (WAH-ter)' },
  { russian: 'Bread', english: 'Noun: Baked staple food', pronunciation: '/brɛd/ (bred)' },
  { russian: 'Coffee', english: 'Noun: Popular brewed morning beverage', pronunciation: '/ˈkɒfi/ (KAW-fee)' },
  { russian: 'Tea', english: 'Noun: Hot or iced herbal/leaf infusion', pronunciation: '/tiː/ (tee)' },
  { russian: 'Food', english: 'Noun: Nourishment to eat', pronunciation: '/fuːd/ (food)' },
  { russian: 'Breakfast', english: 'Noun: First meal of the day', pronunciation: '/ˈbrɛkfəst/ (BREK-fust)' },
  { russian: 'Lunch', english: 'Noun: Midday meal', pronunciation: '/lʌntʃ/ (lunch)' },
  { russian: 'Dinner', english: 'Noun: Evening meal', pronunciation: '/ˈdɪnər/ (DIN-er)' },
  { russian: 'Restaurant', english: 'Noun: Place to buy and eat meals', pronunciation: '/ˈrɛstərɒnt/ (RES-tuh-rahnt)' },

  // Places & Travel
  { russian: 'Airport', english: 'Noun: Hub for airplanes and flights', pronunciation: '/ˈɛərpɔːrt/ (AIR-port)' },
  { russian: 'Hotel', english: 'Noun: Place with rooms for travelers', pronunciation: '/hoʊˈtɛl/ (hoh-TEL)' },
  { russian: 'Station', english: 'Noun: Stop for trains, metro, or buses', pronunciation: '/ˈsteɪʃən/ (STAY-shun)' },
  { russian: 'Hospital', english: 'Noun: Medical center for illness/injury', pronunciation: '/ˈhɒspɪtəl/ (HAHS-pi-tul)' },
  { russian: 'Pharmacy', english: 'Noun: Store for medicine and prescriptions', pronunciation: '/ˈfɑːrməsi/ (FAR-muh-see)' },
  { russian: 'Supermarket', english: 'Noun: Large grocery store', pronunciation: '/ˈsuːpərˌmɑːrkɪt/ (SOO-per-mar-kit)' },
  { russian: 'Bank', english: 'Noun: Financial institution for money', pronunciation: '/bæŋk/ (bank)' },
  { russian: 'City', english: 'Noun: Large populated urban area', pronunciation: '/ˈsɪti/ (SIT-ee)' },

  // People & Family
  { russian: 'Family', english: 'Noun: Parents, children, and relatives', pronunciation: '/ˈfæməli/ (FAM-uh-lee)' },
  { russian: 'Friend', english: 'Noun: A close companion you care about', pronunciation: '/frɛnd/ (frend)' },
  { russian: 'Mother', english: 'Noun: Female parent', pronunciation: '/ˈmʌðər/ (MUH-ther)' },
  { russian: 'Father', english: 'Noun: Male parent', pronunciation: '/ˈfɑːðər/ (FAH-ther)' },
  { russian: 'Child', english: 'Noun: Young person (plural: children)', pronunciation: '/tʃaɪld/ (chyld)' },
  { russian: 'Teacher', english: 'Noun: Instructor at school', pronunciation: '/ˈtiːtʃər/ (TEE-cher)' },
  { russian: 'Student', english: 'Noun: A learner taking classes', pronunciation: '/ˈstjuːdənt/ (STOO-dent)' },

  // Objects & Everyday Essentials
  { russian: 'Money', english: 'Noun: Currency used to purchase goods', pronunciation: '/ˈmʌni/ (MUN-ee)' },
  { russian: 'Ticket', english: 'Noun: Pass for transit, cinema, or events', pronunciation: '/ˈtɪkɪt/ (TIK-it)' },
  { russian: 'Passport', english: 'Noun: Official travel identification document', pronunciation: '/ˈpæspɔːrt/ (PASS-port)' },
  { russian: 'Phone', english: 'Noun: Mobile smartphone', pronunciation: '/foʊn/ (fohn)' },
  { russian: 'Computer', english: 'Noun: Electronic machine for work/browsing', pronunciation: '/kəmˈpjuːtər/ (kum-PYOO-ter)' },
  { russian: 'Book', english: 'Noun: Printed literature or study material', pronunciation: '/bʊk/ (book)' },

  // Core Verbs / Actions
  { russian: 'To learn', english: 'Verb: Gain knowledge or skill', pronunciation: '/tuː lɜːrn/ (to lern)' },
  { russian: 'To speak', english: 'Verb: Say words, communicate in a language', pronunciation: '/tuː spiːk/ (to speek)' },
  { russian: 'To eat', english: 'Verb: Consume food', pronunciation: '/tuː iːt/ (to eet)' },
  { russian: 'To drink', english: 'Verb: Swallow liquids', pronunciation: '/tuː drɪŋk/ (to drink)' },
  { russian: 'To go', english: 'Verb: Move or travel somewhere', pronunciation: '/tuː ɡoʊ/ (to goh)' },
  { russian: 'To understand', english: 'Verb: Grasp the meaning', pronunciation: '/tuː ˌʌndərˈstænd/ (to un-der-STAND)' }
];

export const englishData: AppData = {
  alphabet,
  basicPhrases,
  numbers,
  commonWords
};

export default englishData;
