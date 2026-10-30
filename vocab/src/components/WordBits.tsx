import type { Gender, Word } from "../types";
import { audioSource, playWord } from "../lib/audio";
import { toggleStar, useProgress } from "../lib/progress";
import { useSettings } from "../lib/settings";
import { useState } from "react";

const GENDER_LABEL: Record<Gender, string> = { m: "masc.", f: "fem.", pl: "plural" };

export function GenderBadge({ gender }: { gender?: Gender }) {
  if (!gender) return null;
  return (
    <span
      className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand"
      title={{ m: "said to a man/boy", f: "said to a woman/girl", pl: "said to a group" }[gender]}
    >
      {GENDER_LABEL[gender]}
    </span>
  );
}

export function StarButton({ word }: { word: Word }) {
  const { starred } = useProgress();
  const on = starred.includes(word.id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleStar(word.id);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove star" : "Star this word"}
      className={`flex size-12 shrink-0 items-center justify-center rounded-full text-2xl hover:bg-brand-soft ${on ? "text-brand" : "text-muted/60"}`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

/** 🔊 button. Says honestly whether it is an Alsama recording or a computer voice. */
export function SpeakButton({ word, big }: { word: Word; big?: boolean }) {
  useSettings(); // re-render when the voice setting changes
  const [failed, setFailed] = useState(false);
  const source = audioSource(word);
  if (source === "none") {
    return <span className="text-xs text-muted">Recording coming soon</span>;
  }
  const label = source === "recording" ? "Play recording" : "Play computer voice";
  return (
    <span className="inline-flex flex-col items-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setFailed(!playWord(word));
        }}
        aria-label={label}
        title={label}
        className={`flex shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand hover:bg-brand hover:text-white ${big ? "size-14 text-2xl" : "size-12 text-xl"}`}
      >
        🔊
      </button>
      {failed && <span className="mt-1 max-w-40 text-center text-xs text-muted">No Arabic voice on this device</span>}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${pct}%`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-bold text-muted">{pct}%</span>
    </div>
  );
}
