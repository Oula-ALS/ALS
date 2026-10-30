import { useSyncExternalStore } from "react";
import { load, save } from "./storage";

export interface Settings {
  showArabizi: boolean;
  /** Use the phone's computer voice when there is no Alsama recording. */
  computerVoice: boolean;
  rate: 0.75 | 1;
  /** What students type in Listen & write and the quiz. */
  typeIn: "arabic" | "arabizi";
  /** "system" follows the phone's light/dark setting. */
  theme: "system" | "light" | "dark";
}

const KEY = "settings";
let state: Settings = { showArabizi: true, computerVoice: true, rate: 1, typeIn: "arabic", theme: "system", ...load<Partial<Settings>>(KEY, {}) };
const listeners = new Set<() => void>();

export function setSettings(patch: Partial<Settings>) {
  state = { ...state, ...patch };
  save(KEY, state);
  if (patch.theme) applyTheme();
  listeners.forEach((l) => l());
}

/** Sets data-theme on <html> (index.html does the same before the app loads, to avoid a flash). */
export function applyTheme() {
  const root = document.documentElement;
  if (state.theme === "system") delete root.dataset.theme;
  else root.dataset.theme = state.theme;
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
