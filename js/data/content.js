// Lesson content for the six sections. Spoken language: Lebanese Arabic.
// Every `audio` value is a key in assets/audio/manifest.json. Items without a
// recording still work as reading/writing exercises and show "Recording coming soon".

// The 7 letters recorded with all short and long vowels (from the original app).
export const CONSONANTS = [
  { c: 'ب', latin: 'b' }, { c: 'م', latin: 'm' }, { c: 'ل', latin: 'l' }, { c: 'ن', latin: 'n' },
  { c: 'س', latin: 's' }, { c: 'ر', latin: 'r' }, { c: 'د', latin: 'd' },
];

// Short vowels (harakat) and the long vowel letter that goes with each one — taught as in the
// Alsama Alphabet Workbook: order a, o, i; each short vowel is "half" of its long vowel (aa, oo, ee).
export const VOWELS = [
  { id: 'fatha', mark: 'َ', name: 'Fatḥa', ar: 'فتحة', short: 'a', long: 'aa', longLetter: 'ا', longName: 'aleph',
    where: 'a small line above the letter',
    lebanese: 'In Lebanese it often sounds like "a" — and at the end of many words it moves towards "e" (طاولة = ṭāwle).' },
  { id: 'damma', mark: 'ُ', name: 'Ḍamma', ar: 'ضمة', short: 'o', long: 'oo', longLetter: 'و', longName: 'waw',
    where: 'a small curl (like a tiny و) above the letter',
    lebanese: 'In Lebanese it often sounds between "o" and "u" (كُل = kol, "eat!").' },
  { id: 'kasra', mark: 'ِ', name: 'Kasra', ar: 'كسرة', short: 'i', long: 'ee', longLetter: 'ي', longName: 'ya',
    where: 'a small line below the letter',
    lebanese: 'In Lebanese it often sounds between "i" and "e" (مِن = min / men).' },
];

// Syllable = consonant + short vowel, or consonant + short vowel + long letter.
// Their text is also the audio key (e.g. 'بَ', 'بَا').
export const SYLLABLES = CONSONANTS.flatMap(k => VOWELS.flatMap(v => [
  { text: k.c + v.mark, c: k.c, vowel: v.id, length: 'short', latin: k.latin + v.short },
  { text: k.c + v.mark + v.longLetter, c: k.c, vowel: v.id, length: 'long', latin: k.latin + v.long },
]));

// Words with Alsama recordings. `vowelled` shows the short vowels.
export const WORDS = [
  { ar: 'باب', vowelled: 'بَاب', latin: 'bāb', en: 'door', emoji: '🚪', long: 'ا' },
  { ar: 'بيت', vowelled: 'بَيْت', latin: 'beit', en: 'house', emoji: '🏠', long: 'ي' },
  { ar: 'نور', vowelled: 'نُور', latin: 'nūr', en: 'light', emoji: '💡', long: 'و' },
  { ar: 'دار', vowelled: 'دَار', latin: 'dār', en: 'home', emoji: '🏡', long: 'ا' },
  { ar: 'موز', vowelled: 'مُوز', latin: 'mōz', en: 'bananas', emoji: '🍌', long: 'و' },
  { ar: 'ملك', vowelled: 'مَلِك', latin: 'malek', en: 'king', emoji: '👑' },
  { ar: 'سمك', vowelled: 'سَمَك', latin: 'samak', en: 'fish', emoji: '🐟' },
  { ar: 'ورد', vowelled: 'وَرْد', latin: 'ward', en: 'roses', emoji: '🌹' },
  { ar: 'وعد', vowelled: 'وَعْد', latin: 'waʿd', en: 'promise', emoji: '🤝' },
].map(w => ({ ...w, audio: w.ar }));

// "Complete the word" with the right short-vowel syllable.
export const COMPLETE_SHORT = [
  { word: 'سمك', parts: ['سَ', 'مَ', 'ك'], gap: 1, options: ['مَ', 'مِ', 'مُ'] },
  { word: 'ملك', parts: ['مَ', 'لِ', 'ك'], gap: 1, options: ['لَ', 'لِ', 'لُ'] },
  { word: 'سمك', parts: ['سَ', 'مَ', 'ك'], gap: 0, options: ['سَ', 'سِ', 'سُ'] },
  { word: 'ملك', parts: ['مَ', 'لِ', 'ك'], gap: 0, options: ['مَ', 'مِ', 'مُ'] },
];

// Short, everyday Lebanese sentences built from words the learner already knows.
// No sentence recordings yet — these are reading/writing exercises.
export const SENTENCES = [
  { ar: 'هيدا بيت', words: ['هيدا', 'بيت'], latin: 'hayda beit', en: 'This is a house.' },
  { ar: 'هيدا باب', words: ['هيدا', 'باب'], latin: 'hayda bāb', en: 'This is a door.' },
  { ar: 'بدي موز', words: ['بدي', 'موز'], latin: 'baddi mōz', en: 'I want bananas.' },
  { ar: 'الورد حلو', words: ['الورد', 'حلو'], latin: 'el-ward ḥilu', en: 'The roses are pretty.' },
  { ar: 'وين الباب', words: ['وين', 'الباب'], latin: 'wein el-bāb?', en: 'Where is the door?' },
  { ar: 'بحب السمك', words: ['بحب', 'السمك'], latin: 'baḥebb es-samak', en: 'I love fish.' },
  { ar: 'البيت كبير', words: ['البيت', 'كبير'], latin: 'el-beit kbīr', en: 'The house is big.' },
  { ar: 'هيدا بيتي الكبير', words: ['هيدا', 'بيتي', 'الكبير'], latin: 'hayda beiti l-kbīr', en: 'This is my big house.' },
];

// "Fix the spelling": one wrong letter (usually a look-alike or sound-alike).
export const MISSPELLINGS = [
  { wrong: 'بيط', right: 'بيت', hint: 'ت (t), not the heavy ط' },
  { wrong: 'سمق', right: 'سمك', hint: 'ك (k), not ق' },
  { wrong: 'موذ', right: 'موز', hint: 'ز (z) — in Lebanese ذ also often sounds like z, but this word is spelled with ز' },
  { wrong: 'ورض', right: 'ورد', hint: 'د (d), not the heavy ض' },
  { wrong: 'ملق', right: 'ملك', hint: 'ك (k), not ق' },
  { wrong: 'نوذ', right: 'نور', hint: 'ر (r), not ذ' },
];
