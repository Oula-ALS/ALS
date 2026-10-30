import { useSyncExternalStore } from "react";
import type { Level } from "../types";
import { load, remove, save } from "./storage";

// Student info is kept on this device only. Nothing is sent to Alsama.
export interface Student {
  name: string;
  level: Level | "not-sure";
  className?: string;
}

const KEY = "student";
let current: Student | null = load<Student | null>(KEY, null);
const listeners = new Set<() => void>();

export function setStudent(s: Student | null) {
  current = s;
  if (s) save(KEY, s);
  else remove(KEY);
  listeners.forEach((l) => l());
}

export function useStudent(): Student | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}
