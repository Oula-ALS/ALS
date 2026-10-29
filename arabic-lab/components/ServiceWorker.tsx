"use client";

import { useEffect } from "react";

const WARM_KEY = "alsama-lab:offline-saved";
const DAY = 24 * 3600_000;

/** Registers the offline helper (public/sw.js) and, once a day, saves all pages for offline use. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        let last = 0;
        try {
          last = Number(localStorage.getItem(WARM_KEY)) || 0;
        } catch {}
        if (Date.now() - last < DAY || !navigator.onLine) return;
        reg.active?.postMessage({ type: "warm" });
        try {
          localStorage.setItem(WARM_KEY, String(Date.now()));
        } catch {}
      })
      .catch(() => {});
  }, []);
  return null;
}
