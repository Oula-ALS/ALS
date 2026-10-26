// Reads content/vocab.json (made by `npm run import-content`). Server side only:
// pages pass just the words a screen needs to the browser.
import vocab from "@/content/vocab.json";
import { LEVEL_NAMES, type LevelId, type Unit, type VocabFile } from "./types";

const data = vocab as VocabFile;

export const LEVELS = Object.keys(LEVEL_NAMES) as LevelId[];
export const isSampleContent = data.sample;

export const isLevel = (v: string): v is LevelId => (LEVELS as string[]).includes(v);

export function unitsFor(level: LevelId): Unit[] {
  return data.units.filter((u) => u.level === level);
}

export function getUnit(level: string, unitId: string): Unit | null {
  return data.units.find((u) => u.level === level && u.id === unitId) ?? null;
}

export type UnitSummary = Pick<Unit, "id" | "level" | "number" | "title" | "titleIsArabic"> & { wordCount: number };

export function unitSummaries(): UnitSummary[] {
  return data.units.map(({ words, ...u }) => ({
    id: u.id,
    level: u.level,
    number: u.number,
    title: u.title,
    titleIsArabic: u.titleIsArabic,
    wordCount: words.length,
  }));
}
