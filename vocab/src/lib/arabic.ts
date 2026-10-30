// Arabic text helpers shared by the data scripts and the app.

// Short vowels, shadda, sukun, tanween, dagger alef and Quranic marks.
const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;

export function stripTashkeel(text: string): string {
  return text.replace(TASHKEEL, "").replace(TATWEEL, "");
}

/**
 * Lenient form used to compare a student's answer with the right answer:
 * no tashkeel or tatweel, أ/إ/آ = ا, ة = ه, ى = ي, no punctuation, single spaces.
 */
export function normalizeArabic(text: string): string {
  return stripTashkeel(text)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[؟?!.,،؛;:…"'()\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasArabic(text: string): boolean {
  return /[؀-ۿ]/.test(text);
}
