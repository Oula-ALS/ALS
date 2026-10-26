import { describe, expect, it } from "vitest";
import type { Word } from "@/lib/content/types";
import { generateQuiz } from "@/lib/games/quiz";
import { seeded } from "@/lib/games/random";

const w = (id: number, ar: string, en: string, pos = "noun"): Word => ({ id: `w${id}`, ar, chat: `c${id}`, en, pos });
const words: Word[] = [
  w(1, "قطة", "cat"),
  w(2, "كلب", "dog"),
  w(3, "حصان", "horse"),
  w(4, "أسد", "lion"),
  w(5, "فيل", "elephant"),
  w(6, "طويل", "tall", "adjective"),
  w(7, "قصير", "short", "adjective"),
  w(8, "ذكي", "smart", "adjective"),
  w(9, "هادي", "calm", "adjective"),
  w(10, "طيّب", "kind", "adjective"),
  w(11, "مضحك", "funny", "adjective"),
  w(12, "قطّة", "Cat"), // same English as w1, different spelling
];

describe("generateQuiz", () => {
  const quiz = generateQuiz(words, { rng: seeded(1) });

  it("makes 10 questions about different words", () => {
    expect(quiz).toHaveLength(10);
    expect(new Set(quiz.map((q) => q.word.id)).size).toBe(10);
  });

  it("mixes both directions", () => {
    const dirs = quiz.map((q) => q.direction);
    expect(dirs.filter((d) => d === "ar-en")).toHaveLength(5);
    expect(dirs.filter((d) => d === "en-ar")).toHaveLength(5);
  });

  it("has 4 options, exactly one of them correct, and no look-alike answers", () => {
    for (const q of quiz) {
      expect(q.options).toHaveLength(4);
      expect(q.options[q.answerIndex].id).toBe(q.word.id);
      const shown = q.options.map((o) => (q.direction === "ar-en" ? o.en : o.ar).toLowerCase());
      expect(new Set(shown).size).toBe(4);
    }
  });

  it("prefers wrong options with the same part of speech", () => {
    for (const q of quiz) {
      const same = q.options.filter((o) => o.pos === q.word.pos).length;
      expect(same).toBe(4); // there are ≥4 nouns and ≥4 adjectives
    }
  });

  it("is repeatable with the same seed and copes with tiny units", () => {
    expect(generateQuiz(words, { rng: seeded(7) })).toEqual(generateQuiz(words, { rng: seeded(7) }));
    const tiny = generateQuiz(words.slice(0, 2), { rng: seeded(2) });
    expect(tiny).toHaveLength(2);
    expect(tiny.every((q) => q.options.length === 2)).toBe(true);
  });
});
