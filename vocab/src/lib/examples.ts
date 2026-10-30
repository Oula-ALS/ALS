// Example sentences: one per word, written by AI or a teacher, checked by a teacher.
// Students only ever see sentences a teacher approved (reviewed: true).
import examplesFile from "../data/examples.json";
import type { Word } from "../types";
import { normalizeArabic } from "./arabic";

export interface ExampleEntry {
  arabic: string;
  arabizi: string;
  english: string;
  /** The target word exactly as it appears in the sentence. */
  answer: string;
  /** The sentence with the target word replaced by ____. */
  cloze: string;
  reviewed: boolean;
  rejected?: boolean;
  /** Who wrote it: "ai" (generate-examples script), "claude-sample" or "teacher". */
  source: string;
}

export type ExamplesFile = Record<string, ExampleEntry>;

export const EXAMPLES: ExamplesFile = examplesFile as ExamplesFile;

export const BLANK = "____";

/** Only teacher-approved sentences. */
export function approvedExample(word: Word, file: ExamplesFile = EXAMPLES): ExampleEntry | undefined {
  const e = file[word.id];
  return e && e.reviewed && !e.rejected && e.cloze.includes(BLANK) ? e : undefined;
}

// ---------- finding the target word in a sentence ----------

interface Token {
  core: string; // normalized, no punctuation
  start: number; // char index of the word itself (without punctuation)
  end: number;
}

function tokens(sentence: string): Token[] {
  const out: Token[] = [];
  for (const m of sentence.matchAll(/\S+/g)) {
    const raw = m[0];
    const lead = raw.match(/^[\p{P}\p{S}]*/u)![0].length;
    const trail = raw.match(/[\p{P}\p{S}]*$/u)![0].length;
    const inner = raw.slice(lead, raw.length - trail);
    if (!inner) continue;
    out.push({ core: normalizeArabic(inner), start: m.index! + lead, end: m.index! + raw.length - trail });
  }
  return out;
}

/** Where `answer` (one or more whole words) appears in `sentence`, ignoring tashkeel and punctuation. */
export function findSpan(sentence: string, answer: string): [number, number] | null {
  const want = normalizeArabic(answer).split(" ").filter(Boolean);
  if (!want.length) return null;
  const toks = tokens(sentence);
  for (let i = 0; i + want.length <= toks.length; i++) {
    if (want.every((w, j) => toks[i + j].core === w)) return [toks[i].start, toks[i + want.length - 1].end];
  }
  return null;
}

export function makeCloze(sentence: string, answer: string): string | null {
  const span = findSpan(sentence, answer);
  return span ? sentence.slice(0, span[0]) + BLANK + sentence.slice(span[1]) : null;
}

/** The sentence split around the target word, for highlighting it. */
export function splitAround(sentence: string, answer: string): { before: string; target: string; after: string } {
  const span = findSpan(sentence, answer);
  if (!span) return { before: sentence, target: "", after: "" };
  return { before: sentence.slice(0, span[0]), target: sentence.slice(span[0], span[1]), after: sentence.slice(span[1]) };
}

/** Which accepted form of the word the sentence uses (null if none). */
export function formUsed(sentence: string, word: Word): string | null {
  return word.alternatives.find((form) => findSpan(sentence, form)) ?? null;
}

// Small words that join the front of the next word in spoken Arabic: بالبيت, عالطاولة, وكتاب…
const PREFIXES = ["و", "ب", "ل", "ف", "ك", "ع", "ال", "بال", "وال", "لل", "عال", "فال", "وب", "ول", "وع"];

/**
 * Does a student's own sentence contain the word? Lenient: no tashkeel needed, and a
 * one-word answer may have a small word joined to its front (بالبيت counts for بيت).
 * The word itself is not graded for grammar.
 */
export function sentenceUsesWord(sentence: string, word: Word): boolean {
  if (formUsed(sentence, word)) return true;
  const toks = tokens(sentence).map((t) => t.core);
  return word.alternatives
    .map(normalizeArabic)
    .filter((f) => f && !f.includes(" "))
    .some((f) => toks.some((t) => PREFIXES.some((p) => t === p + f || t === p + f.replace(/^ال/, ""))));
}
