import { describe, expect, it } from "vitest";
import { isDue, isMastered, review } from "./leitner";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 9, 30);

describe("Leitner boxes", () => {
  it("a new word you know goes to box 1, due tomorrow", () => {
    const c = review(undefined, true, now);
    expect(c).toEqual({ box: 1, due: now + DAY });
  });

  it("knowing it moves up one box each time, up to 5", () => {
    let c = review(undefined, true, now);
    for (const box of [2, 3, 4, 5, 5]) {
      c = review(c, true, now);
      expect(c.box).toBe(box);
    }
    expect(c.due).toBe(now + 16 * DAY);
  });

  it("still learning sends it back to box 1", () => {
    const c = review({ box: 4, due: now }, false, now);
    expect(c.box).toBe(1);
    expect(c.due).toBe(now + DAY);
  });

  it("due and mastered", () => {
    expect(isDue(undefined, now)).toBe(false);
    expect(isDue({ box: 2, due: now - 1 }, now)).toBe(true);
    expect(isDue({ box: 2, due: now + 1 }, now)).toBe(false);
    expect(isMastered({ box: 3, due: 0 })).toBe(false);
    expect(isMastered({ box: 4, due: 0 })).toBe(true);
  });
});
