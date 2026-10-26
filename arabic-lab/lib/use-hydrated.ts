import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false on the server and during hydration, true once running in the browser. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
