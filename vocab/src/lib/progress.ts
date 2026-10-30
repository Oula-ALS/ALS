import { useSyncExternalStore } from "react";
import { review, isMastered, type Card } from "./leitner";
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
