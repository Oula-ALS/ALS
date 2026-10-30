import { useSyncExternalStore } from "react";
import { load, save } from "./storage";

// Sentences students write themselves, saved on this device only.
export interface MySentence {
  text: string;
  at: number;
}

const KEY = "my-sentences";
let state: Record<string, MySentence[]> = load(KEY, {});
const listeners = new Set<() => void>();

export function addMySentence(wordId: string, text: string) {
  state = { ...state, [wordId]: [...(state[wordId] ?? []), { text, at: Date.now() }] };
  save(KEY, state);
  listeners.forEach((l) => l());
}

export function removeMySentence(wordId: string, at: number) {
  state = { ...state, [wordId]: (state[wordId] ?? []).filter((s) => s.at !== at) };
  save(KEY, state);
  listeners.forEach((l) => l());
}

export function useMySentences(): Record<string, MySentence[]> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
