// Everything is saved on this device only (localStorage). Every read and write is
// wrapped in try/catch because private windows and some phones block storage.
// Later, accounts (e.g. Supabase) can replace these two functions.

// Kept from the app's first name (Alsama Vocab) so saved progress is never lost.
const PREFIX = "alsama-vocab:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage blocked or full: the app still works, it just won't remember.
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
