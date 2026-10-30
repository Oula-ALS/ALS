// Picks the wrong options for multiple-choice questions.
//
// Rules:
// - same level, same part of speech (POS); words from the same unit first;
// - never the right answer again: no shared Arabic form (ignoring tashkeel, so
//   كيفَك / كيفِك can't both appear) and no shared English meaning (so two "Bill"
//   words or "How are you? (m)/(f)" can't both appear);
// - the options are all different from each other.
// Only if a level has too few words of that POS do we fill up with other POS
// from the same level (e.g. B1 has only 3 prepositions).
import type { Word } from "../types";
import { normalizeArabic } from "./arabic";
import { shuffled, type Rng } from "./random";

function arabicKeys(w: Word): string[] {
  return [...w.alternatives, w.display].map(normalizeArabic);
}

function englishKeys(w: Word): string[] {
  const full = w.english.toLowerCase().replace(/\s+/g, " ").trim();
  const parts = full
    .split(/[\/\\,]/)
    .map((s) => s.replace(/\(.*?\)/g, "").replace(/^to\s+/, "").trim())
    .filter(Boolean);
  return [full, ...parts];
}

function clashes(a: Word, b: Word): boolean {
  const ar = new Set(arabicKeys(a));
  if (arabicKeys(b).some((k) => ar.has(k))) return true;
  const en = new Set(englishKeys(a));
  return englishKeys(b).some((k) => en.has(k));
}

export function pickDistractors(target: Word, pool: readonly Word[], count = 3, rng: Rng = Math.random): Word[] {
  const sameLevel = pool.filter((w) => w.level === target.level && w.id !== target.id);
  const tiers = [
    sameLevel.filter((w) => w.pos === target.pos && w.unitId === target.unitId),
    sameLevel.filter((w) => w.pos === target.pos && w.unitId !== target.unitId),
    sameLevel.filter((w) => w.pos !== target.pos),
  ];

  const picked: Word[] = [];
  for (const tier of tiers) {
    for (const w of shuffled(tier, rng)) {
      if (picked.length >= count) return picked;
      if (clashes(w, target) || picked.some((p) => clashes(p, w))) continue;
      picked.push(w);
    }
  }
  return picked;
}

/** The right answer plus distractors, in random order. */
export function buildOptions(target: Word, pool: readonly Word[], rng: Rng = Math.random): Word[] {
  return shuffled([target, ...pickDistractors(target, pool, 3, rng)], rng);
}
