// Auto-ticks the writing checklist. Works with Arabic script and chat letters.
// Arabic is compared without short vowels/shadda and with common spelling variants
// unified (أ إ آ → ا, ى → ي, ة → ه), so "لأنّو" and "لانو" both count.

import type { Rule } from "@/content/writing";

const ARABIC_PREFIXES = ["و", "ب", "ل", "ع", "ف"];

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // harakat, shadda, tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[-_]/g, " ");
}

/** Words of the text (Arabic letters, Latin letters, digits used in chat, apostrophes). */
export function tokens(text: string): string[] {
  return normalize(text).match(/[ء-ي0-9a-z'’]+/g) ?? [];
}

function sameWord(token: string, term: string, first: boolean) {
  if (token === term) return true;
  // Allow و/ب/ل/ع/ف stuck to the front of an Arabic word: "وبعدين", "بالعادة".
  return first && token.length > term.length && ARABIC_PREFIXES.includes(token[0]) && token.slice(1) === term;
}

/** True if `term` (one or more words) appears in the text as whole words. */
export function containsTerm(textTokens: string[], term: string): boolean {
  const t = tokens(term);
  if (!t.length) return false;
  for (let i = 0; i + t.length <= textTokens.length; i++) {
    if (t.every((w, j) => sameWord(textTokens[i + j], w, j === 0))) return true;
  }
  return false;
}

/** How many different words from the list appear. */
export function countTerms(textTokens: string[], terms: string[]): number {
  const unique = [...new Set(terms.map((t) => tokens(t).join(" ")).filter(Boolean))];
  return unique.filter((t) => containsTerm(textTokens, t)).length;
}

export function countSentences(text: string): number {
  return text
    .split(/[.!?؟\n]+/)
    .filter((s) => tokens(s).length > 0).length;
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** true / false, or null for items the student ticks themselves. */
export function checkRule(rule: Rule, text: string): boolean | null {
  const tk = tokens(text);
  switch (rule.kind) {
    case "contains":
      return rule.any.some((term) => containsTerm(tk, term));
    case "count":
      return countTerms(tk, rule.from) >= rule.min;
    case "sentences":
      return countSentences(text) >= rule.min;
    case "manual":
      return null;
  }
}
