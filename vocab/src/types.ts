export type Level = "beginner" | "intermediate" | "advanced";
export type Gender = "m" | "f" | "pl";

export interface Example {
  arabic: string;
  arabizi: string;
  english: string;
  cloze: string;
  reviewed: boolean;
}

export interface Word {
  id: string;
  level: Level;
  unitId: string;
  unitTitle: string;
  unitOrder: number;
  pos: string;
  /** Main Arabic form (the first one when the cell lists several). */
  arabic: string;
  /** Every accepted Arabic form, including the main one. */
  alternatives: string[];
  /** The full Arabic cell as teachers wrote it, e.g. "بفيق / بوعى / بصحى". */
  display: string;
  arabizi: string;
  arabiziAlternatives: string[];
  english: string;
  gender?: Gender;
  example?: Example;
}

export interface Unit {
  id: string;
  level: Level;
  /** URL part, e.g. "unit-3" or "topic-13". */
  slug: string;
  order: number;
  title: string;
  /** True when the title is written in Arabic (Advanced topics). */
  titleIsArabic: boolean;
  wordCount: number;
}

export interface LevelData {
  level: Level;
  title: string;
  source: string;
  units: Unit[];
  words: Word[];
}
