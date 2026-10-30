// Simple Leitner boxes (1–5). "I know it" moves a word up one box, "still learning"
// sends it back to box 1. Higher boxes come back less often.

export interface Card {
  box: number; // 1–5
  due: number; // time (ms) when the word should be reviewed again
}

export const MASTERED_BOX = 4;

// Days until the next review for each box.
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
const DAY = 24 * 60 * 60 * 1000;

export function review(card: Card | undefined, knewIt: boolean, now = Date.now()): Card {
  const box = knewIt ? Math.min((card?.box ?? 0) + 1, 5) : 1;
  return { box, due: now + INTERVAL_DAYS[box] * DAY };
}

export function isDue(card: Card | undefined, now = Date.now()): boolean {
  return !!card && card.due <= now;
}

export function isMastered(card: Card | undefined): boolean {
  return (card?.box ?? 0) >= MASTERED_BOX;
}
