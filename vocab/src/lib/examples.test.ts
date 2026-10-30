import { describe, expect, it } from "vitest";
import { LEVELS } from "./data";
import { normalizeArabic } from "./arabic";
import { approvedExample, BLANK, EXAMPLES, findSpan, makeCloze, sentenceUsesWord, splitAround, type ExamplesFile } from "./examples";
import type { Word } from "../types";

const all = LEVELS.flatMap((l) => l.words);
const find = (arabic: string) => all.find((x) => x.alternatives.includes(arabic))!;

describe("makeCloze", () => {
  it("replaces the target word, keeping punctuation", () => {
    expect(makeCloze("كم كتاب عندك؟", "كتاب")).toBe(`كم ${BLANK} عندك؟`);
    expect(makeCloze("أنا من لبنان.", "لبنان")).toBe(`أنا من ${BLANK}.`);
  });
  it("ignores tashkeel differences between sentence and word", () => {
    expect(makeCloze("بدّي قهوة وحدة", "وحده")).toBe(`بدّي قهوة ${BLANK}`);
  });
  it("handles multi-word answers", () => {
    expect(makeCloze("كل يوم بشرب قهوة.", "كل يوم")).toBe(`${BLANK} بشرب قهوة.`);
  });
  it("matches whole words only", () => {
    expect(findSpan("عالكرسي", "كرسي")).toBeNull();
    expect(makeCloze("عندي كتابين", "كتاب")).toBeNull();
  });
  it("splits around the target for highlighting", () => {
    expect(splitAround("في كتاب على الطاولة.", "كتاب")).toEqual({ before: "في ", target: "كتاب", after: " على الطاولة." });
  });
});

describe("sentenceUsesWord", () => {
  const book = find("كتاب");
  it("finds the word with or without tashkeel", () => {
    expect(sentenceUsesWord("عم إقرا كتاب حلو", book)).toBe(true);
    expect(sentenceUsesWord("عم إقرا كِتاب حلو", book)).toBe(true);
  });
  it("accepts a small word joined to the front", () => {
    expect(sentenceUsesWord("حطّيت القلم بالكتاب", book)).toBe(true);
    expect(sentenceUsesWord("هيدا الكتاب حلو", book)).toBe(true);
  });
  it("rejects a sentence without the word", () => {
    expect(sentenceUsesWord("عم إقرا مجلة", book)).toBe(false);
    expect(sentenceUsesWord("", book)).toBe(false);
  });
  it("accepts any alternative form", () => {
    expect(sentenceUsesWord("الصبح بصحى بكير", find("بفيق"))).toBe(true);
  });
});

describe("approvedExample", () => {
  const word = { id: "x" } as Word;
  const entry = { arabic: "a", arabizi: "", english: "", answer: "a", cloze: BLANK, source: "ai" };
  it("only returns teacher-approved sentences", () => {
    expect(approvedExample(word, { x: { ...entry, reviewed: false } } as ExamplesFile)).toBeUndefined();
    expect(approvedExample(word, { x: { ...entry, reviewed: true, rejected: true } } as ExamplesFile)).toBeUndefined();
    expect(approvedExample(word, { x: { ...entry, reviewed: true } } as ExamplesFile)).toBeDefined();
  });
});

describe("examples.json", () => {
  it("every saved sentence belongs to a real word and its cloze is consistent", () => {
    const ids = new Set(all.map((w) => w.id));
    for (const [id, e] of Object.entries(EXAMPLES)) {
      expect(ids.has(id), id).toBe(true);
      const w = all.find((x) => x.id === id)!;
      expect(w.alternatives.map(normalizeArabic), id).toContain(normalizeArabic(e.answer));
      expect(e.cloze, id).toBe(makeCloze(e.arabic, e.answer));
    }
  });
});
