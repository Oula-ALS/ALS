// The student's own copy of their details, kept on this device so the app can
// greet them, build their introduction and let them edit or delete their details.
// `token` is the private key that proves this device created the registration.
import { useSyncExternalStore } from "react";
import type { Profile } from "./registration";

export type LocalStudent = Profile & { id: string; token: string };

const KEY = "alsama-lab:student";
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): LocalStudent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return typeof data?.name === "string" && data.name ? data : null;
  } catch {
    return null;
  }
}

export function readLocalStudent(): LocalStudent | null {
  return parse(readRaw());
}

function notify() {
  listeners.forEach((cb) => cb());
}

export function saveLocalStudent(student: LocalStudent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(student));
  } catch {}
  notify();
}

export function clearLocalStudent() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb(); // other tabs
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// Same object back while the stored text hasn't changed (needed by React).
let cache: { raw: string | null; student: LocalStudent | null } = { raw: null, student: null };
function snapshot() {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, student: parse(raw) };
  return cache.student;
}

/**
 * The student saved on this device, kept up to date.
 * `undefined` while rendering on the server (we can't know yet), `null` if nobody is registered.
 */
export function useLocalStudent(): LocalStudent | null | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}
