// Lenient answer checking for typed answers.
import type { Word } from "../types";
import { normalizeArabic } from "./arabic";

/**
 * Arabizi: lower case, no accents (ṭ → t, é → e), no spaces, hyphens or apostrophes,
 * so "el-ghurfe", "El ghurfe" and "elghurfe" all match.
 */
export function normalizeArabizi(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Every Arabic form we accept: each alternative, and the whole cell as written. */
export function acceptedArabic(word: Word): string[] {
  return [...new Set([...word.alternatives, word.display].map(normalizeArabic).filter(Boolean))];
}

export function acceptedArabizi(word: Word): string[] {
  return [...new Set([...word.arabiziAlternatives, word.arabizi].map(normalizeArabizi).filter(Boolean))];
}

export function checkArabic(input: string, word: Word): boolean {
  const answer = normalizeArabic(input);
  return !!answer && acceptedArabic(word).includes(answer);
}

export function checkArabizi(input: string, word: Word): boolean {
  const answer = normalizeArabizi(input);
  return !!answer && acceptedArabizi(word).includes(answer);
}
