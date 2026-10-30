import { describe, expect, it } from "vitest";
import { LEVELS } from "./data";
import { normalizeArabic } from "./arabic";
import { checkArabic, checkArabizi, normalizeArabizi } from "./answer";
import type { Word } from "../types";

const all = LEVELS.flatMap((l) => l.words);
const find = (arabic: string) => {
  const w = all.find((x) => x.alternatives.includes(arabic));
  if (!w) throw new Error(`word ${arabic} not in data`);
  return w;
};

describe("normalizeArabic", () => {
  it("removes tashkeel, tanween, shadda and tatweel", () => {
    expect(normalizeArabic("مَرحباً")).toBe("مرحبا");
    expect(normalizeArabic("تشرّفنا")).toBe("تشرفنا");
    expect(normalizeArabic("بـ")).toBe("ب");
  });
  it("treats أ إ آ as ا, ة as ه, ى as ي", () => {
    expect(normalizeArabic("أهلين")).toBe("اهلين");
    expect(normalizeArabic("إخت")).toBe("اخت");
    expect(normalizeArabic("آمن")).toBe("امن");
    expect(normalizeArabic("منيحة")).toBe("منيحه");
    expect(normalizeArabic("مستشفى")).toBe("مستشفي");
  });
  it("ignores extra spaces and punctuation", () => {
    expect(normalizeArabic("  صباح   الخير ")).toBe("صباح الخير");
    expect(normalizeArabic("شو اسمَك؟")).toBe("شو اسمك");
    expect(normalizeArabic("أنا اسمي…")).toBe("انا اسمي");
  });
});

describe("checkArabic", () => {
  const hello = find("مرحبا");

  it("accepts مرحبا, مرحباً and مَرحبا for Hello", () => {
    expect(hello.english).toBe("Hello");
    for (const input of ["مرحبا", "مرحباً", "مَرحبا", " مرحبا  "]) expect(checkArabic(input, hello)).toBe(true);
  });

  it("rejects wrong or empty answers", () => {
    expect(checkArabic("مرحب", hello)).toBe(false);
    expect(checkArabic("", hello)).toBe(false);
    expect(checkArabic("   ", hello)).toBe(false);
  });

  it("accepts every alternative form", () => {
    const wake = find("بفيق");
    expect(wake.alternatives.length).toBe(3);
    for (const input of ["بفيق", "بوعى", "بوعي", "بصحى"]) expect(checkArabic(input, wake)).toBe(true);
  });

  it("accepts ة written as ه and hamza-less alef", () => {
    expect(checkArabic("منيحه", find("منيحة"))).toBe(true);
    expect(checkArabic("اهلين", find("أهلين"))).toBe(true);
  });

  it("accepts the right answer for every word in the data", () => {
    for (const w of all) for (const form of w.alternatives) expect(checkArabic(form, w), `${w.id} ${form}`).toBe(true);
  });
});

describe("checkArabizi", () => {
  const word = { arabizi: "el-ghurfe", arabiziAlternatives: ["el-ghurfe"] } as Word;

  it("ignores case, spaces, hyphens, apostrophes and accents", () => {
    expect(normalizeArabizi("El-Ṭabakh’")).toBe("eltabakh");
    for (const input of ["el-ghurfe", "El ghurfe", "elghurfe", "ELGHURFE"]) expect(checkArabizi(input, word)).toBe(true);
  });

  it("accepts any Arabizi alternative", () => {
    const father = find("أب");
    for (const input of ["ab", "baba", "bay"]) expect(checkArabizi(input, father)).toBe(true);
    expect(checkArabizi("mama", father)).toBe(false);
  });
});
