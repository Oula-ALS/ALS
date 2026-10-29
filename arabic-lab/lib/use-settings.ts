"use client";
// Loads the teacher's settings once per visit (kept on the device for offline use).
import { useSyncExternalStore } from "react";
import { createLocalStore } from "./local-store";
import { emptySettings, type Settings } from "./settings";

const cache = createLocalStore<Settings>("alsama-lab:settings", (d) => {
  const s = d as Settings | null;
  return s && typeof s === "object" && s.session && s.content ? s : null;
});

let started = false;
function refresh() {
  if (started) return;
  started = true;
  fetch("/api/settings", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((s: Settings | null) => s && cache.write(s))
    .catch(() => {});
}

/** Call after the teacher changes settings, so this tab shows them. */
export function reloadSettings() {
  started = false;
  refresh();
}

// Subscribing starts the one fetch per visit; the value itself comes from `cache`.
const startFetch = () => {
  refresh();
  return () => {};
};

export function useSettings(): Settings {
  useSyncExternalStore(startFetch, () => true, () => false);
  return cache.useValue() ?? emptySettings;
}
