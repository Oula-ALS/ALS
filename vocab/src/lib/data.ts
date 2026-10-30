import beginner from "../data/beginner.json";
import intermediate from "../data/intermediate.json";
import advanced from "../data/advanced.json";
import type { Level, LevelData, Unit, Word } from "../types";

export const LEVELS: LevelData[] = [beginner, intermediate, advanced] as LevelData[];

export const LEVEL_INFO: Record<Level, { blurb: string; arabic: string }> = {
  beginner: { blurb: "Greetings, family, numbers, food, getting around.", arabic: "مبتدئ" },
  intermediate: { blurb: "Daily routine, free time, travel, hotels and restaurants.", arabic: "متوسط" },
  advanced: { blurb: "Work, economy, society, technology and personality.", arabic: "متقدم" },
};

export function getLevel(level: string | undefined): LevelData | undefined {
  return LEVELS.find((l) => l.level === level);
}

/** A unit by its URL part. "all" means every word in the level. */
export function getUnit(data: LevelData, slug: string | undefined): Unit | undefined {
  if (slug === "all") {
    return {
      id: `${data.level}/all`,
      level: data.level,
      slug: "all",
      order: 0,
      title: `All ${data.title} words`,
      titleIsArabic: false,
      wordCount: data.words.length,
    };
  }
  return data.units.find((u) => u.slug === slug);
}

export function wordsOf(data: LevelData, unit: Unit): Word[] {
  return unit.slug === "all" ? data.words : data.words.filter((w) => w.unitId === unit.id);
}
