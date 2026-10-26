// Learning progress, kept on this device: XP, daily streak and best stars per unit.
import { createLocalStore } from "./local-store";
import { dayKey, nextStreak } from "./games/scoring";

export type Progress = {
  xp: number;
  streak: number;
  lastDay: string | null;
  /** best stars per unit, keyed "level/unitId" */
  stars: Record<string, number>;
};

export const emptyProgress: Progress = { xp: 0, streak: 0, lastDay: null, stars: {} };

const store = createLocalStore<Progress>("alsama-lab:progress", (data) => {
  const d = data as Partial<Progress> | null;
  if (!d || typeof d.xp !== "number") return null;
  return { ...emptyProgress, ...d, stars: { ...(d.stars ?? {}) } };
});

export const useProgress = store.useValue;
export const clearProgress = store.clear;

export const unitKey = (level: string, unitId: string) => `${level}/${unitId}`;

/** Adds XP (and counts today towards the streak). */
export function addXp(amount: number) {
  const p = store.read() ?? emptyProgress;
  const today = dayKey();
  store.write({ ...p, xp: p.xp + amount, streak: nextStreak(p.streak, p.lastDay, today), lastDay: today });
}

/** Keeps the best star result for a unit. Returns true if it is a new best. */
export function recordStars(key: string, stars: number): boolean {
  const p = store.read() ?? emptyProgress;
  if ((p.stars[key] ?? 0) >= stars) return false;
  store.write({ ...p, stars: { ...p.stars, [key]: stars } });
  return true;
}
