import { describe, expect, it } from "vitest";
import { importVocabCsv, parseCsv } from "@/lib/content/csv";

const HEADER = "Section,POS,العربي,Pronunciation (chat),English";

describe("parseCsv", () => {
  it("handles quotes, commas inside quotes, CRLF and a BOM", () => {
    const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n\r\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ]);
  });
});

describe("importVocabCsv", () => {
  it("groups words by Section and names Book 1 units", () => {
    const csv = [
      HEADER,
      "01_Unit1,phrase,مرحبا,marhaba,hello",
      "01_Unit1,noun,اسم,esem,name",
      "04_Unit4,verb,بروح,brou7,I go",
    ].join("\n");
    const { units, warnings } = importVocabCsv(csv, "book1");
    expect(warnings).toEqual([]);
    expect(units.map((u) => [u.id, u.title, u.words.length])).toEqual([
      ["unit-1", "Greetings & me", 2],
      ["unit-4", "Verbs & days", 1],
    ]);
    expect(units[0].words[0]).toEqual({ id: "book1-unit-1-1", ar: "مرحبا", chat: "marhaba", en: "hello", pos: "phrase" });
  });

  it("uses B1 unit names and keeps a suffix name when there is no table entry", () => {
    const csv = [HEADER, "04_Unit4_Travel,noun,سفر,safar,travel"].join("\n");
    expect(importVocabCsv(csv, "b1").units[0].title).toBe("Travel");
    expect(importVocabCsv(csv, "advanced").units[0].title).toBe("Travel");
  });

  it("names Advanced topics with their Arabic title", () => {
    const csv = [HEADER, "05_التكنولوجيا,noun,حاسوب,7asoub,computer"].join("\n");
    const unit = importVocabCsv(csv, "advanced").units[0];
    expect(unit).toMatchObject({ id: "topic-5", title: "التكنولوجيا", titleIsArabic: true });
  });

  it("fixes the three known garbled B1 rows", () => {
    const csv = [
      HEADER,
      "02_Unit2,verb,وصلwos`el,,arrived",
      "02_Unit2,verb,وَصّل was`sal,,delivered",
      "02_Unit2,noun,شَنْاتي>شَنْتة,shante,bag",
    ].join("\n");
    const { units, warnings } = importVocabCsv(csv, "b1");
    expect(units[0].words.map((w) => [w.ar, w.chat])).toEqual([
      ["وصل", "wosel"],
      ["وصّل", "wassal"],
      ["شنتة / شناتي", "shante"],
    ]);
    expect(warnings.filter((w) => w.includes("fixed"))).toHaveLength(3);
    expect(warnings.some((w) => w.includes("Latin"))).toBe(false);
  });

  it("reports suspicious rows instead of hiding them", () => {
    const csv = [
      HEADER,
      "01_Unit1,noun,كتابbook,ktab,book",
      "01_Unit1,noun,,x,empty",
      "01_Unit1,noun,بيت,,house",
      "01_Unit1,noun,بيت,beit,house",
    ].join("\n");
    const { units, warnings } = importVocabCsv(csv, "book1", "test.csv");
    expect(units[0].words).toHaveLength(2); // empty row skipped, duplicate kept once
    expect(warnings.join("\n")).toMatch(/Latin letters/);
    expect(warnings.join("\n")).toMatch(/skipped, missing Arabic/);
    expect(warnings.join("\n")).toMatch(/no chat spelling/);
    expect(warnings.join("\n")).toMatch(/duplicate/);
  });

  it("refuses a file with the wrong columns", () => {
    const { units, warnings } = importVocabCsv("Word,Meaning\nx,y", "book1", "bad.csv");
    expect(units).toEqual([]);
    expect(warnings[0]).toMatch(/missing column/);
  });
});
