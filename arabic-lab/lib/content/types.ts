export type LevelId = "book1" | "b1" | "advanced";

export type Word = {
  id: string;
  ar: string;
  chat: string;
  en: string;
  pos: string;
};

export type Unit = {
  id: string; // e.g. "unit-4" or "topic-12" (used in the URL)
  level: LevelId;
  number: number;
  section: string; // the raw Section value from the CSV
  title: string;
  titleIsArabic: boolean;
  words: Word[];
};

export type VocabFile = {
  generatedAt: string;
  /** true while only the sample list is loaded (real CSVs not imported yet) */
  sample: boolean;
  units: Unit[];
};

export const LEVEL_NAMES: Record<LevelId, string> = {
  book1: "Book 1",
  b1: "B1",
  advanced: "Advanced",
};
