import { useSyncExternalStore } from "react";
import { load, save } from "./storage";

export interface Settings {
  showArabizi: boolean;
  /** Use the phone's computer voice when there is no Alsama recording. */
  computerVoice: boolean;
  rate: 0.75 | 1;
}

const KEY = "settings";
let state: Settings = { showArabizi: true, computerVoice: true, rate: 1, ...load<Partial<Settings>>(KEY, {}) };
const listeners = new Set<() => void>();

export function setSettings(patch: Partial<Settings>) {
  state = { ...state, ...patch };
  save(KEY, state);
  listeners.forEach((l) => l());
}

export function getSettings(): Settings {
  return state;
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
