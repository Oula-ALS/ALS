// The 28 Arabic letters in alphabet order, with everything a letter page shows.
//
//   char   the letter            name   Arabic letter name = audio key in manifest.json
//   latin  simple spelling       joins  false for the 6 letters that never join the next letter
//   hard   extra-care sound      sound  audio key for the letter's sound (letter + fatha)
//   tip    how to say it (honest; no fake English equivalents for hard sounds)
//   shami  how it sounds in everyday Levantine (Shami) speech, when that differs from MSA
//   word   example word: ar (also its audio key), latin (Shami), en, emoji, msa (if MSA differs)
//   forms  the letter's shapes inside real words: alone / start / middle / end
//          (non-joining letters only have alone and end)

export const LETTERS = [
  {
    char: 'ا', name: 'أَلِف', latin: 'alif', joins: false,
    tip: 'Alif has no consonant sound of its own. After a letter it makes a long "aa" (بَا = baa). At the start of a word it usually carries a hamza (أ), which you hear as a short a, i or u.',
    word: { ar: 'أرنب', latin: 'arnab', en: 'rabbit', emoji: '🐇' },
    forms: [{ pos: 'alone', word: 'أرنب', latin: 'arnab' }, { pos: 'end', word: 'باب', latin: 'bāb' }],
  },
  {
    char: 'ب', name: 'بَاء', latin: 'baa', sound: 'بَ',
    tip: 'Like English "b". Arabic has no "p", so a "p" in borrowed words is often said as "b".',
    word: { ar: 'بيت', latin: 'beit', en: 'house', emoji: '🏠' },
    forms: [
      { pos: 'alone', word: 'دب', latin: 'dibb', en: 'bear' }, { pos: 'start', word: 'بيت', latin: 'beit', en: 'house' },
      { pos: 'middle', word: 'كبير', latin: 'kbīr', en: 'big' }, { pos: 'end', word: 'حب', latin: 'ḥubb', en: 'love' },
    ],
  },
  {
    char: 'ت', name: 'تَاء', latin: 'taa',
    tip: 'Like English "t", but the tip of the tongue touches the back of the top front teeth.',
    word: { ar: 'تفاحة', latin: 'tiffāḥa', en: 'apple', emoji: '🍎' },
    forms: [
      { pos: 'alone', word: 'بنات', latin: 'banāt', en: 'girls' }, { pos: 'start', word: 'تفاحة', latin: 'tiffāḥa', en: 'apple' },
      { pos: 'middle', word: 'كتاب', latin: 'ktāb', en: 'book' }, { pos: 'end', word: 'بيت', latin: 'beit', en: 'house' },
    ],
  },
  {
    char: 'ث', name: 'ثَاء', latin: 'thaa',
    tip: 'In formal Arabic (MSA) it is "th" as in "think".',
    shami: 'In everyday Shami it usually sounds like ت (t) — ثلج is "talj", ثلاثة is "tlēte" — and in some words like س (s).',
    word: { ar: 'ثلج', latin: 'talj', en: 'snow', emoji: '❄️', msa: 'thalj' },
    forms: [
      { pos: 'alone', word: 'تراث', latin: 'turās', en: 'heritage' }, { pos: 'start', word: 'ثلج', latin: 'talj', en: 'snow' },
      { pos: 'middle', word: 'مثل', latin: 'mitl', en: 'like' }, { pos: 'end', word: 'بحث', latin: 'baḥs', en: 'search' },
    ],
  },
  {
    char: 'ج', name: 'جِيم', latin: 'jeem',
    tip: 'In formal Arabic it is "j" as in "jam".',
    shami: 'In Syria and Lebanon it is usually softer, like the "s" in "measure". In Jordan and Palestine many people say "j" as in "jam".',
    word: { ar: 'جبنة', latin: 'jibne', en: 'cheese', emoji: '🧀' },
    forms: [
      { pos: 'alone', word: 'درج', latin: 'daraj', en: 'stairs' }, { pos: 'start', word: 'جبنة', latin: 'jibne', en: 'cheese' },
      { pos: 'middle', word: 'شجرة', latin: 'shajara', en: 'tree' }, { pos: 'end', word: 'ثلج', latin: 'talj', en: 'snow' },
    ],
  },
  {
    char: 'ح', name: 'حَاء', latin: 'Haa', hard: true,
    tip: 'A strong, breathy "h" made deep in the throat. Tighten your throat and breathe out hard, as if you were fogging up a cold window. It has no buzz and no scrape — different from ه (light h) and خ (raspy).',
    word: { ar: 'حليب', latin: 'ḥalīb', en: 'milk', emoji: '🥛' },
    forms: [
      { pos: 'alone', word: 'مفتاح', latin: 'muftāḥ', en: 'key' }, { pos: 'start', word: 'حليب', latin: 'ḥalīb', en: 'milk' },
      { pos: 'middle', word: 'بحر', latin: 'baḥr', en: 'sea' }, { pos: 'end', word: 'ملح', latin: 'milḥ', en: 'salt' },
    ],
  },
  {
    char: 'خ', name: 'خَاء', latin: 'khaa', hard: true,
    tip: 'A raspy sound made where the back of the tongue nearly touches the soft part of the roof of the mouth — close to the "ch" in Scottish "loch" or German "Bach".',
    word: { ar: 'خبز', latin: 'khebez', en: 'bread', emoji: '🍞' },
    forms: [
      { pos: 'alone', word: 'صاروخ', latin: 'ṣārūkh', en: 'rocket' }, { pos: 'start', word: 'خبز', latin: 'khebez', en: 'bread' },
      { pos: 'middle', word: 'بخير', latin: 'bkhēr', en: 'fine, well' }, { pos: 'end', word: 'مطبخ', latin: 'maṭbakh', en: 'kitchen' },
    ],
  },
  {
    char: 'د', name: 'دَال', latin: 'daal', joins: false, sound: 'دَ',
    tip: 'Like English "d", with the tongue touching the back of the top front teeth.',
    word: { ar: 'دار', latin: 'dār', en: 'home', emoji: '🏡' },
    forms: [{ pos: 'alone', word: 'ورد', latin: 'ward', en: 'roses' }, { pos: 'end', word: 'بلد', latin: 'balad', en: 'country' }],
  },
  {
    char: 'ذ', name: 'ذَال', latin: 'dhaal', joins: false,
    tip: 'In formal Arabic it is "th" as in "this".',
    shami: 'In everyday Shami it usually sounds like د (d) — ذهب is "dahab" — and in some words like ز (z), e.g. ذكي "zaki" (clever).',
    word: { ar: 'ذهب', latin: 'dahab', en: 'gold', emoji: '🥇', msa: 'dhahab' },
    forms: [{ pos: 'alone', word: 'ذهب', latin: 'dahab', en: 'gold' }, { pos: 'end', word: 'لذيذ', latin: 'laziz', en: 'delicious' }],
  },
  {
    char: 'ر', name: 'رَاء', latin: 'raa', joins: false, sound: 'رَ',
    tip: 'A rolled or tapped "r", made with the tip of the tongue — like the "tt" in American "butter", or a Spanish "r".',
    word: { ar: 'رز', latin: 'rizz', en: 'rice', emoji: '🍚' },
    forms: [{ pos: 'alone', word: 'رز', latin: 'rizz', en: 'rice' }, { pos: 'end', word: 'بحر', latin: 'baḥr', en: 'sea' }],
  },
  {
    char: 'ز', name: 'زَاي', latin: 'zay', joins: false,
    tip: 'Like English "z" in "zoo".',
    word: { ar: 'زيتون', latin: 'zeitūn', en: 'olives', emoji: '🫒' },
    forms: [{ pos: 'alone', word: 'زيتون', latin: 'zeitūn', en: 'olives' }, { pos: 'end', word: 'خبز', latin: 'khebez', en: 'bread' }],
  },
  {
    char: 'س', name: 'سِين', latin: 'seen', sound: 'سَ',
    tip: 'Like English "s" in "sun". Compare it with the heavy ص.',
    word: { ar: 'سمك', latin: 'samak', en: 'fish', emoji: '🐟' },
    forms: [
      { pos: 'alone', word: 'فلوس', latin: 'flūs', en: 'money' }, { pos: 'start', word: 'سمك', latin: 'samak', en: 'fish' },
      { pos: 'middle', word: 'مسا', latin: 'masa', en: 'evening' }, { pos: 'end', word: 'شمس', latin: 'shams', en: 'sun' },
    ],
  },
  {
    char: 'ش', name: 'شِين', latin: 'sheen',
    tip: 'Like English "sh" in "shop".',
    word: { ar: 'شمس', latin: 'shams', en: 'sun', emoji: '☀️' },
    forms: [
      { pos: 'alone', word: 'قماش', latin: 'ʾmāsh', en: 'fabric' }, { pos: 'start', word: 'شمس', latin: 'shams', en: 'sun' },
      { pos: 'middle', word: 'مشط', latin: 'mushṭ', en: 'comb' }, { pos: 'end', word: 'ريش', latin: 'rīsh', en: 'feathers' },
    ],
  },
  {
    char: 'ص', name: 'صَاد', latin: 'Saad', hard: true,
    tip: 'A "heavy" s. Say س, then pull the back of your tongue down and back so your mouth feels fuller. The vowels next to it sound deeper (صابون sounds darker than سابون would).',
    word: { ar: 'صابون', latin: 'ṣābūn', en: 'soap', emoji: '🧼' },
    forms: [
      { pos: 'alone', word: 'خاص', latin: 'khāṣṣ', en: 'private' }, { pos: 'start', word: 'صابون', latin: 'ṣābūn', en: 'soap' },
      { pos: 'middle', word: 'بصل', latin: 'baṣal', en: 'onions' }, { pos: 'end', word: 'خلص', latin: 'khalaṣ', en: 'enough! / done' },
    ],
  },
  {
    char: 'ض', name: 'ضَاد', latin: 'Daad', hard: true,
    tip: 'A "heavy" d. Say د, then pull the back of your tongue down and back. Arabic is sometimes called "the language of ض" because this sound is so special.',
    word: { ar: 'ضفدع', latin: 'ḍifdaʿ', en: 'frog', emoji: '🐸' },
    forms: [
      { pos: 'alone', word: 'أرض', latin: 'arḍ', en: 'ground' }, { pos: 'start', word: 'ضفدع', latin: 'ḍifdaʿ', en: 'frog' },
      { pos: 'middle', word: 'أخضر', latin: 'akhḍar', en: 'green' }, { pos: 'end', word: 'أبيض', latin: 'abyaḍ', en: 'white' },
    ],
  },
  {
    char: 'ط', name: 'طَاء', latin: 'Taa', hard: true,
    tip: 'A "heavy" t. Say ت with the tongue pressed flatter against the roof of the mouth and pulled back. The vowels next to it sound deeper.',
    word: { ar: 'طاولة', latin: 'ṭāwle', en: 'table', emoji: '🪑', msa: 'ṭāwila' },
    forms: [
      { pos: 'alone', word: 'شرط', latin: 'sharṭ', en: 'condition' }, { pos: 'start', word: 'طاولة', latin: 'ṭāwle', en: 'table' },
      { pos: 'middle', word: 'مطبخ', latin: 'maṭbakh', en: 'kitchen' }, { pos: 'end', word: 'خط', latin: 'khaṭṭ', en: 'line' },
    ],
  },
  {
    char: 'ظ', name: 'ظَاء', latin: 'Zaa', hard: true,
    tip: 'In formal Arabic it is a "heavy" version of ذ (the "th" in "this").',
    shami: 'In everyday Shami it usually sounds like a heavy ز (z) — ظرف is "ẓarf" — and in some words like ض.',
    word: { ar: 'ظرف', latin: 'ẓarf', en: 'envelope', emoji: '✉️', msa: 'ẓarf (heavy "th")' },
    forms: [
      { pos: 'alone', word: null }, { pos: 'start', word: 'ظرف', latin: 'ẓarf', en: 'envelope' },
      { pos: 'middle', word: 'نظارات', latin: 'naḍḍārāt', en: 'glasses' }, { pos: 'end', word: 'حظ', latin: 'ḥaẓẓ', en: 'luck' },
    ],
  },
  {
    char: 'ع', name: 'عَيْن', latin: 'ayn', hard: true,
    tip: 'There is no English sound like it. Squeeze the middle of your throat (as if gently about to gag) while your voice is on. Listen to the recording several times and copy it — it gets easier with practice.',
    word: { ar: 'عنب', latin: 'ʿinab', en: 'grapes', emoji: '🍇' },
    forms: [
      { pos: 'alone', word: 'شارع', latin: 'shāreʿ', en: 'street' }, { pos: 'start', word: 'عنب', latin: 'ʿinab', en: 'grapes' },
      { pos: 'middle', word: 'معلم', latin: 'mʿallem', en: 'teacher' }, { pos: 'end', word: 'سبع', latin: 'sabʿ', en: 'seven' },
    ],
  },
  {
    char: 'غ', name: 'غَيْن', latin: 'ghayn', hard: true,
    tip: 'Like خ but with your voice on — a soft gargle at the back of the mouth, close to the French "r" in "Paris".',
    word: { ar: 'غيمة', latin: 'ghēme', en: 'cloud', emoji: '☁️' },
    forms: [
      { pos: 'alone', word: 'فراغ', latin: 'farāgh', en: 'empty space' }, { pos: 'start', word: 'غيمة', latin: 'ghēme', en: 'cloud' },
      { pos: 'middle', word: 'صغير', latin: 'ṣghīr', en: 'small' }, { pos: 'end', word: 'صمغ', latin: 'ṣamgh', en: 'glue' },
    ],
  },
  {
    char: 'ف', name: 'فَاء', latin: 'faa',
    tip: 'Like English "f" in "fun". Arabic has no "v", so a "v" in borrowed words is often said as "f".',
    word: { ar: 'فلافل', latin: 'falāfel', en: 'falafel', emoji: '🧆' },
    forms: [
      { pos: 'alone', word: 'خروف', latin: 'kharūf', en: 'sheep' }, { pos: 'start', word: 'فلافل', latin: 'falāfel', en: 'falafel' },
      { pos: 'middle', word: 'صفر', latin: 'ṣifr', en: 'zero' }, { pos: 'end', word: 'صيف', latin: 'ṣēf', en: 'summer' },
    ],
  },
  {
    char: 'ق', name: 'قَاف', latin: 'qaaf', hard: true,
    tip: 'In formal Arabic it is a deep "k" made further back, where the tongue touches the very back of the mouth.',
    shami: 'In city Shami (Damascus, Beirut, Jerusalem) it usually becomes a glottal stop — the tiny catch in the middle of "uh-oh". قهوة is "ʾahwe". In some villages and in Jordan many people say "g".',
    word: { ar: 'قهوة', latin: 'ʾahwe', en: 'coffee', emoji: '☕', msa: 'qahwa' },
    forms: [
      { pos: 'alone', word: 'ورق', latin: 'waraʾ', en: 'paper' }, { pos: 'start', word: 'قهوة', latin: 'ʾahwe', en: 'coffee' },
      { pos: 'middle', word: 'بقرة', latin: 'baʾara', en: 'cow' }, { pos: 'end', word: 'فستق', latin: 'fistuʾ', en: 'pistachios' },
    ],
  },
  {
    char: 'ك', name: 'كَاف', latin: 'kaaf',
    tip: 'Like English "k" in "kite". Compare it with the deeper ق.',
    word: { ar: 'كتاب', latin: 'ktāb', en: 'book', emoji: '📖' },
    forms: [
      { pos: 'alone', word: 'شباك', latin: 'shibbāk', en: 'window' }, { pos: 'start', word: 'كتاب', latin: 'ktāb', en: 'book' },
      { pos: 'middle', word: 'سكر', latin: 'sikkar', en: 'sugar' }, { pos: 'end', word: 'ملك', latin: 'malik', en: 'king' },
    ],
  },
  {
    char: 'ل', name: 'لَام', latin: 'laam', sound: 'لَ',
    tip: 'Like English "l" in "lemon", with the tongue tip behind the top teeth. When ل is followed by ا they join into one special shape: لا.',
    word: { ar: 'ليمون', latin: 'laymūn', en: 'lemon', emoji: '🍋' },
    forms: [
      { pos: 'alone', word: 'مال', latin: 'māl', en: 'money' }, { pos: 'start', word: 'ليمون', latin: 'laymūn', en: 'lemon' },
      { pos: 'middle', word: 'حليب', latin: 'ḥalīb', en: 'milk' }, { pos: 'end', word: 'جمل', latin: 'jamal', en: 'camel' },
    ],
  },
  {
    char: 'م', name: 'مِيم', latin: 'meem', sound: 'مَ',
    tip: 'Like English "m" in "moon".',
    word: { ar: 'موز', latin: 'mōz', en: 'bananas', emoji: '🍌' },
    forms: [
      { pos: 'alone', word: 'يوم', latin: 'yōm', en: 'day' }, { pos: 'start', word: 'موز', latin: 'mōz', en: 'bananas' },
      { pos: 'middle', word: 'سمك', latin: 'samak', en: 'fish' }, { pos: 'end', word: 'قلم', latin: 'ʾalam', en: 'pen' },
    ],
  },
  {
    char: 'ن', name: 'نُون', latin: 'noon', sound: 'نَ',
    tip: 'Like English "n" in "night".',
    word: { ar: 'نور', latin: 'nūr', en: 'light', emoji: '💡' },
    forms: [
      { pos: 'alone', word: 'زمان', latin: 'zamān', en: 'long ago' }, { pos: 'start', word: 'نور', latin: 'nūr', en: 'light' },
      { pos: 'middle', word: 'بنت', latin: 'bint', en: 'girl' }, { pos: 'end', word: 'لبن', latin: 'laban', en: 'yoghurt' },
    ],
  },
  {
    char: 'ه', name: 'هَاء', latin: 'haa',
    tip: 'A light "h" as in "hello", pronounced even at the end of a word (فواكه = fawākeh). Don\'t confuse it with ة (ta marbuta), which looks similar but sounds like "-e" or "-a" in Shami.',
    word: { ar: 'هوا', latin: 'hawa', en: 'air, wind', emoji: '🌬️', msa: 'هواء hawāʾ' },
    forms: [
      { pos: 'alone', word: 'انتباه', latin: 'intibāh', en: 'attention' }, { pos: 'start', word: 'هوا', latin: 'hawa', en: 'air' },
      { pos: 'middle', word: 'شهر', latin: 'shahr', en: 'month' }, { pos: 'end', word: 'فواكه', latin: 'fawākeh', en: 'fruit' },
    ],
  },
  {
    char: 'و', name: 'وَاو', latin: 'waaw', joins: false,
    tip: 'At the start of a syllable it is "w" as in "water". After a letter it is a long vowel: "oo" (نور = nūr) or, in Shami, often "ō" (موز = mōz).',
    word: { ar: 'ورد', latin: 'ward', en: 'roses', emoji: '🌹' },
    forms: [{ pos: 'alone', word: 'ورد', latin: 'ward', en: 'roses' }, { pos: 'end', word: 'حلو', latin: 'ḥilu', en: 'sweet, nice' }],
  },
  {
    char: 'ي', name: 'يَاء', latin: 'yaa',
    tip: 'At the start of a syllable it is "y" as in "yes". After a letter it is a long vowel: "ee" (حليب = ḥalīb) or, in Shami, often "ē" (بيت = beit/bēt).',
    word: { ar: 'ياسمين', latin: 'yasmīn', en: 'jasmine', emoji: '🌼' },
    forms: [
      { pos: 'alone', word: 'شاي', latin: 'shāy', en: 'tea' }, { pos: 'start', word: 'يوم', latin: 'yōm', en: 'day' },
      { pos: 'middle', word: 'بيت', latin: 'beit', en: 'house' }, { pos: 'end', word: 'عربي', latin: 'ʿarabi', en: 'Arabic' },
    ],
  },
];

// Letters that are easy to mix up (used for the "find the letter" activity).
export const LOOKALIKES = [
  ['ب', 'ت', 'ث', 'ن', 'ي'], ['ج', 'ح', 'خ'], ['د', 'ذ'], ['ر', 'ز'], ['س', 'ش'],
  ['ص', 'ض'], ['ط', 'ظ'], ['ع', 'غ'], ['ف', 'ق'], ['ك', 'ل'], ['ه', 'م'], ['ا', 'ل'], ['و', 'ر'],
];

// The two groups of letters (Alsama Alphabet Workbook):
//   Group 1 — ا د ذ ر ز و: only 2 shapes; they never join the letter after them.
//   Group 2 — all the others: 4 shapes; they join on both sides (except after a Group 1 letter).
export const groupOf = L => (L.joins === false ? 1 : 2);
export const GROUP_1 = LETTERS.filter(L => groupOf(L) === 1).map(L => L.char);
export const GROUP_2 = LETTERS.filter(L => groupOf(L) === 2).map(L => L.char);
