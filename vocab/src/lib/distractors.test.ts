import { describe, expect, it } from "vitest";
import { LEVELS } from "./data";
import { normalizeArabic } from "./arabic";
import { buildOptions, pickDistractors } from "./distractors";
import { seeded } from "./random";
import type { Word } from "../types";

const all = LEVELS.flatMap((l) => l.words);
const find = (arabic: string) => all.find((x) => x.alternatives.includes(arabic))!;

const word = (id: string, pos: string, arabic: string, english: string, unitId = "beginner/unit-1"): Word => ({
  id,
  level: "beginner",
  unitId,
  unitTitle: unitId,
  unitOrder: 1,
  pos,
  arabic,
  alternatives: [arabic],
  display: arabic,
  arabizi: id,
  arabiziAlternatives: [id],
  english,
});

describe("pickDistractors", () => {
  it("uses the same part of speech and level, and prefers the same unit", () => {
    const target = word("t", "noun", "بيت", "house");
    const pool = [
      target,
      word("a", "noun", "قلم", "pen"),
      word("b", "noun", "كتاب", "book"),
      word("c", "noun", "باب", "door", "beginner/unit-2"),
      word("d", "noun", "شباك", "window", "beginner/unit-2"),
      word("e", "verb", "بيكتب", "to write"),
      { ...word("f", "noun", "سوق", "market"), level: "advanced" as const },
    ];
    const ids = pickDistractors(target, pool, 3, seeded(1)).map((w) => w.id);
    expect(ids).toHaveLength(3);
    expect(ids).toEqual(expect.arrayContaining(["a", "b"])); // same unit first
    expect(ids).not.toContain("e"); // other POS
    expect(ids).not.toContain("f"); // other level
  });

  it("never offers a word with the same Arabic (ignoring tashkeel) or the same meaning", () => {
    const masc = find("كيفَك");
    const options = pickDistractors(masc, all, 3, seeded(2));
    for (const o of options) {
      expect(normalizeArabic(o.arabic)).not.toBe("كيفك");
      expect(o.english.toLowerCase()).not.toBe("how are you?");
    }
  });

  it("does not offer a second 'Bill' for حساب / فاتورة", () => {
    const bill = find("حساب");
    for (let seed = 0; seed < 50; seed++) {
      for (const o of pickDistractors(bill, all, 3, seeded(seed))) expect(o.english.toLowerCase()).not.toContain("bill");
    }
  });

  it("holds for every real word: same POS when possible, no duplicates of the answer", () => {
    for (const level of LEVELS) {
      for (const target of level.words) {
        const options = buildOptions(target, level.words, seeded(target.id.length));
        expect(options[0] === target || options.includes(target)).toBe(true);
        const others = options.filter((o) => o !== target);
        const samePos = level.words.filter((w) => w.pos === target.pos && w.id !== target.id).length;
        if (samePos >= 12) for (const o of others) expect(o.pos, `${target.id}`).toBe(target.pos);
        const arabic = options.map((o) => normalizeArabic(o.display));
        const english = options.map((o) => o.english.toLowerCase());
        expect(new Set(arabic).size, `${target.id} arabic`).toBe(options.length);
        expect(new Set(english).size, `${target.id} english`).toBe(options.length);
        expect(others.length).toBe(3);
      }
    }
  });
});
