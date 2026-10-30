import { useSyncExternalStore } from "react";
import { isDue, isMastered, review, type Card } from "./leitner";
import { load, save } from "./storage";

// Learning progress, saved on this device only.
interface Progress {
  cards: Record<string, Card>;
  starred: string[];
}

const KEY = "progress";
let state: Progress = load<Progress>(KEY, { cards: {}, starred: [] });
const listeners = new Set<() => void>();

function update(next: Progress) {
  state = next;
  save(KEY, state);
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export function recordAnswer(wordId: string, knewIt: boolean) {
  update({ ...state, cards: { ...state.cards, [wordId]: review(state.cards[wordId], knewIt) } });
}

export function toggleStar(wordId: string) {
  const starred = state.starred.includes(wordId)
    ? state.starred.filter((id) => id !== wordId)
    : [...state.starred, wordId];
  update({ ...state, starred });
}

export function masteredShare(p: Progress, wordIds: string[]): number {
  if (!wordIds.length) return 0;
  return wordIds.filter((id) => isMastered(p.cards[id])).length / wordIds.length;
}

export function getProgress(): Progress {
  return state;
}

/** Words whose review day has come. */
export function dueWordIds(p: Progress, now = Date.now()): string[] {
  return Object.entries(p.cards)
    .filter(([, c]) => isDue(c, now))
    .map(([id]) => id);
}

/** When the next word comes back (null if none are waiting). */
export function nextDue(p: Progress, now = Date.now()): number | null {
  const later = Object.values(p.cards).map((c) => c.due).filter((d) => d > now);
  return later.length ? Math.min(...later) : null;
}
