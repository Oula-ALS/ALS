"use client";

import { useSyncExternalStore } from "react";

const COLORS = ["#ef9952", "#fff5ac", "#9fb9c6", "#351b4a", "#fbeccc"];
const PIECES = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 10) * 0.08,
  duration: 1.6 + ((i * 7) % 10) / 10,
  color: COLORS[i % COLORS.length],
  rotate: (i * 53) % 360,
}));

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A short burst of confetti. Not shown to people who turned off motion. */
export function Confetti() {
  const reduce = useSyncExternalStore(() => () => {}, reducedMotion, () => true);
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 block h-3 w-2 rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
