// Builds multiple-choice questions that mix both directions:
// "ar-en" shows Arabic and asks for the English; "en-ar" the other way round.

import type { Word } from "../content/types";
import { shuffle, type Rng } from "./random";

export type Direction = "ar-en" | "en-ar";
export type Question = {
  word: Word;
  direction: Direction;
  options: Word[];
  answerIndex: number;
};

const answerText = (w: Word, d: Direction) => (d === "ar-en" ? w.en : w.ar).trim().toLowerCase();

/**
 * @param words  the words to ask about (usually one unit)
 * @param pool   words that may be used as wrong options (defaults to `words`)
 */
export function generateQuiz(
  words: Word[],
  { count = 10, optionCount = 4, pool = words, rng = Math.random }: {
    count?: number;
    optionCount?: number;
    pool?: Word[];
    rng?: Rng;
  } = {},
): Question[] {
  const picked = shuffle(words, rng).slice(0, Math.min(count, words.length));
  // Half each way, then shuffled, so a round always mixes both directions.
  const directions = shuffle(
    picked.map((_, i): Direction => (i % 2 === 0 ? "ar-en" : "en-ar")),
    rng,
  );

  return picked.map((word, i) => {
    const direction = directions[i];
    const seen = new Set([answerText(word, direction)]);
    const candidates = shuffle(
      pool.filter((w) => w.id !== word.id),
      rng,
    ).sort((a, b) => Number(b.pos === word.pos) - Number(a.pos === word.pos)); // same POS first
    const wrong: Word[] = [];
    for (const w of candidates) {
      if (wrong.length >= optionCount - 1) break;
      const t = answerText(w, direction);
      if (seen.has(t)) continue; // never two options that look the same
      seen.add(t);
      wrong.push(w);
    }
    const options = shuffle([word, ...wrong], rng);
    return { word, direction, options, answerIndex: options.indexOf(word) };
  });
}
