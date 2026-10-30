// Search all words in Arabic (tashkeel ignored), Arabizi or English.
import type { Word } from "../types";
import { normalizeArabizi } from "./answer";
import { hasArabic, normalizeArabic } from "./arabic";

/** 0 = exact, 1 = starts with, 2 = contains, null = no match. */
function rank(haystacks: string[], needle: string): number | null {
  let best: number | null = null;
  for (const h of haystacks) {
    const r = h === needle ? 0 : h.startsWith(needle) ? 1 : h.includes(needle) ? 2 : null;
    if (r !== null && (best === null || r < best)) best = r;
  }
  return best;
}

export function searchWords(words: readonly Word[], query: string, limit = 60): Word[] {
  const q = query.trim();
  if (!q) return [];
  const scored: { w: Word; r: number }[] = [];

  if (hasArabic(q)) {
    const needle = normalizeArabic(q);
    if (!needle) return [];
    for (const w of words) {
      const r = rank([...w.alternatives, w.display].map(normalizeArabic), needle);
      if (r !== null) scored.push({ w, r });
    }
  } else {
    const en = q.toLowerCase().replace(/\s+/g, " ");
    const az = normalizeArabizi(q);
    for (const w of words) {
      const english = w.english.toLowerCase();
      const parts = english.split(/[\/,\\]/).map((s) => s.replace(/\(.*?\)/g, "").replace(/^to\s+/, "").trim());
      const rEn = rank([english, ...parts], en);
      const rAz = az ? rank(w.arabiziAlternatives.map(normalizeArabizi), az) : null;
      const r = rEn === null ? rAz : rAz === null ? rEn : Math.min(rEn, rAz);
      if (r !== null) scored.push({ w, r });
    }
  }
  // Stable: equal ranks keep the book order (beginner → advanced, unit order).
  return scored
    .map((s, i) => ({ ...s, i }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, limit)
    .map((s) => s.w);
}
