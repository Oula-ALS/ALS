// The student's own copy of their details, kept on this device so the app can
// greet them, build their introduction and let them edit or delete their details.
// `token` is the private key that proves this device created the registration.
import { createLocalStore } from "./local-store";
import type { Profile } from "./registration";

export type LocalStudent = Profile & { id: string; token: string };

const store = createLocalStore<LocalStudent>("alsama-lab:student", (data) => {
  const d = data as LocalStudent | null;
  return typeof d?.name === "string" && d.name ? d : null;
});

export const readLocalStudent = store.read;
export const saveLocalStudent = store.write;
export const clearLocalStudent = store.clear;
/** `undefined` while rendering on the server, `null` if nobody is registered. */
export const useLocalStudent = store.useValue;
