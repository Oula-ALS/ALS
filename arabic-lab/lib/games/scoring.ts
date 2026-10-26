// XP, stars, ranks and streaks. Pure functions so they are easy to test.

export const XP = {
  correct: 10,
  flashcardKnown: 2,
  perStar: 10,
  writingSubmitted: 30,
};

/** XP for a correct answer when `combo` answers in a row are correct (1 = first). */
export function correctAnswerXp(combo: number): number {
  return XP.correct + Math.min(Math.max(combo - 1, 0), 5) * 2; // +2 per streak step, max +10
}

export function quizStars(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  const r = correct / total;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
}

export const MATCH_SECONDS = 90;

export function matchStars(finished: boolean, secondsLeft: number, mistakes: number): 0 | 1 | 2 | 3 {
  if (!finished) return 0;
  if (mistakes === 0 && secondsLeft >= 45) return 3;
  if (mistakes <= 2 && secondsLeft >= 20) return 2;
  return 1;
}

export const RANKS = [
  { xp: 0, ar: "مبتدئ", en: "Beginner" },
  { xp: 150, ar: "طالب", en: "Student" },
  { xp: 500, ar: "شاطر", en: "Clever one" },
  { xp: 1200, ar: "نجم", en: "Star" },
  { xp: 2500, ar: "بطل", en: "Champion" },
] as const;

export function rankFor(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  const rank = RANKS[i];
  const next = RANKS[i + 1] ?? null;
  const progress = next ? (xp - rank.xp) / (next.xp - rank.xp) : 1;
  return { rank, next, progress };
}

/** "YYYY-MM-DD" in the device's own time zone. */
export function dayKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** New streak after practising on `today`, given the last practice day. */
export function nextStreak(streak: number, lastDay: string | null, today: string): number {
  if (lastDay === today) return Math.max(streak, 1);
  if (!lastDay) return 1;
  const [y, m, d] = lastDay.split("-").map(Number);
  const yesterday = dayKey(new Date(y, m - 1, d + 1)) === today;
  return yesterday ? streak + 1 : 1;
}

/** Streak to show: it lapses if the student missed a whole day. */
export function visibleStreak(streak: number, lastDay: string | null, today: string): number {
  if (!lastDay) return 0;
  if (lastDay === today) return streak;
  return nextStreak(streak, lastDay, today) > 1 ? streak : 0;
}

export const PRAISE = [
  { ar: "برافو!", chat: "Bravo!", en: "Well done!" },
  { ar: "ممتاز!", chat: "Mumtaz!", en: "Excellent!" },
  { ar: "مش بطّال!", chat: "Mish battal!", en: "Not bad!" },
  { ar: "يلا كمان مرة!", chat: "Yalla kamen marra!", en: "Come on, once more!" },
] as const;

/** Praise that fits the result: 3 stars → برافو, 2 → ممتاز, 1 → مش بطّال, 0 → يلا كمان مرة. */
export function praiseFor(stars: number) {
  return PRAISE[[3, 2, 1, 0].indexOf(Math.max(0, Math.min(3, stars)))];
}
