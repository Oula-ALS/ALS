import { describe, expect, it } from "vitest";
import { LEVELS } from "./data";
import { searchWords } from "./search";

const all = LEVELS.flatMap((l) => l.words);
const english = (q: string) => searchWords(all, q).map((w) => w.english);

describe("searchWords", () => {
  it("finds Arabic with or without tashkeel", () => {
    expect(searchWords(all, "مرحبا")[0].english).toBe("Hello");
    expect(searchWords(all, "مَرحباً")[0].english).toBe("Hello");
    expect(searchWords(all, "كيفك").map((w) => w.gender)).toEqual(expect.arrayContaining(["m", "f"]));
  });

  it("finds any alternative form", () => {
    expect(searchWords(all, "بصحى").map((w) => w.english)).toContain("I wake up");
  });

  it("finds English, ignoring case and 'to'", () => {
    expect(english("hello")[0]).toBe("Hello");
    expect(english("WRITE")).toContain("to write");
    expect(english("bill").length).toBeGreaterThanOrEqual(3);
  });

  it("finds Arabizi, ignoring spaces, hyphens and case", () => {
    expect(english("marhaba")).toContain("Hello");
    expect(english("sabah el kheir")).toContain("Good morning");
    expect(english("Sabah el-kheir")).toContain("Good morning");
  });

  it("puts exact matches first", () => {
    expect(english("tea")[0]).toBe("tea");
  });

  it("returns nothing for empty or unknown queries", () => {
    expect(searchWords(all, "  ")).toEqual([]);
    expect(searchWords(all, "zzzzqqq")).toEqual([]);
  });
});
