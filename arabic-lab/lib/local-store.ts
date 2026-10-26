// A value saved in this browser (localStorage) that React screens can watch.
// Every screen using it updates when it changes, also from other tabs.
import { useSyncExternalStore } from "react";

export function createLocalStore<T>(key: string, parse: (data: unknown) => T | null) {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: T | null } = { raw: null, value: null };

  function readRaw(): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function decode(raw: string | null): T | null {
    if (!raw) return null;
    try {
      return parse(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  // Same object back while the stored text hasn't changed (needed by React).
  function snapshot() {
    const raw = readRaw();
    if (raw !== cache.raw) cache = { raw, value: decode(raw) };
    return cache.value;
  }
  function notify() {
    listeners.forEach((cb) => cb());
  }
  function subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => e.key === key && cb();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    read: () => decode(readRaw()),
    write(value: T) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
      notify();
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {}
      notify();
    },
    /** `undefined` while rendering on the server, `null` if nothing is saved. */
    useValue(): T | null | undefined {
      return useSyncExternalStore(subscribe, snapshot, () => undefined);
    },
  };
}
