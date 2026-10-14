// The 28 Arabic letters in alphabet order.
// `name` is the Arabic letter name exactly as recorded — it is also the key
// in assets/audio/manifest.json, so playAudio(letter.name) plays the recording.
// `joins: false` marks the 6 letters that never connect to the next letter.

export const LETTERS = [
  { char: 'ا', name: 'أَلِف', latin: 'alif', joins: false },
  { char: 'ب', name: 'بَاء', latin: 'baa' },
  { char: 'ت', name: 'تَاء', latin: 'taa' },
  { char: 'ث', name: 'ثَاء', latin: 'thaa' },
  { char: 'ج', name: 'جِيم', latin: 'jeem' },
  { char: 'ح', name: 'حَاء', latin: 'Haa', hard: true },
  { char: 'خ', name: 'خَاء', latin: 'khaa', hard: true },
  { char: 'د', name: 'دَال', latin: 'daal', joins: false },
  { char: 'ذ', name: 'ذَال', latin: 'dhaal', joins: false },
  { char: 'ر', name: 'رَاء', latin: 'raa', joins: false },
  { char: 'ز', name: 'زَاي', latin: 'zay', joins: false },
  { char: 'س', name: 'سِين', latin: 'seen' },
  { char: 'ش', name: 'شِين', latin: 'sheen' },
  { char: 'ص', name: 'صَاد', latin: 'Saad', hard: true },
  { char: 'ض', name: 'ضَاد', latin: 'Daad', hard: true },
  { char: 'ط', name: 'طَاء', latin: 'Taa', hard: true },
  { char: 'ظ', name: 'ظَاء', latin: 'Zaa', hard: true },
  { char: 'ع', name: 'عَيْن', latin: 'ayn', hard: true },
  { char: 'غ', name: 'غَيْن', latin: 'ghayn', hard: true },
  { char: 'ف', name: 'فَاء', latin: 'faa' },
  { char: 'ق', name: 'قَاف', latin: 'qaaf', hard: true },
  { char: 'ك', name: 'كَاف', latin: 'kaaf' },
  { char: 'ل', name: 'لَام', latin: 'laam' },
  { char: 'م', name: 'مِيم', latin: 'meem' },
  { char: 'ن', name: 'نُون', latin: 'noon' },
  { char: 'ه', name: 'هَاء', latin: 'haa' },
  { char: 'و', name: 'وَاو', latin: 'waaw', joins: false },
  { char: 'ي', name: 'يَاء', latin: 'yaa' },
];
