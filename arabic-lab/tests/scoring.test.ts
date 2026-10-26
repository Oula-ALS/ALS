import { describe, expect, it } from "vitest";
import { correctAnswerXp, matchStars, nextStreak, praiseFor, quizStars, rankFor, visibleStreak } from "@/lib/games/scoring";

describe("scoring", () => {
  it("gives +10 per correct answer plus a capped combo bonus", () => {
    expect([1, 2, 3, 6, 20].map(correctAnswerXp)).toEqual([10, 12, 14, 20, 20]);
  });

  it("turns scores into stars", () => {
    expect([10, 9, 7, 5, 4].map((c) => quizStars(c, 10))).toEqual([3, 3, 2, 1, 0]);
    expect(matchStars(true, 60, 0)).toBe(3);
    expect(matchStars(true, 30, 2)).toBe(2);
    expect(matchStars(true, 5, 5)).toBe(1);
    expect(matchStars(false, 0, 0)).toBe(0);
  });

  it("finds the rank and progress to the next one", () => {
    expect(rankFor(0).rank.en).toBe("Beginner");
    expect(rankFor(149).next?.en).toBe("Student");
    expect(rankFor(150).rank.ar).toBe("طالب");
    expect(rankFor(850).progress).toBeCloseTo(0.5);
    expect(rankFor(9999)).toMatchObject({ next: null, progress: 1 });
  });

  it("counts daily streaks, including across a month end", () => {
    expect(nextStreak(0, null, "2026-10-26")).toBe(1);
    expect(nextStreak(3, "2026-10-26", "2026-10-26")).toBe(3);
    expect(nextStreak(3, "2026-10-31", "2026-11-01")).toBe(4);
    expect(nextStreak(3, "2026-10-24", "2026-10-26")).toBe(1);
    expect(visibleStreak(3, "2026-10-25", "2026-10-26")).toBe(3);
    expect(visibleStreak(3, "2026-10-23", "2026-10-26")).toBe(0);
  });

  it("praises in Arabic", () => {
    expect(praiseFor(3).ar).toBe("برافو!");
    expect(praiseFor(0).ar).toBe("يلا كمان مرة!");
  });
});
