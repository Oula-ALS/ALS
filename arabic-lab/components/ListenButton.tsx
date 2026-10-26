"use client";

import { useState } from "react";
import { speakArabic } from "@/lib/speech";

export function ListenButton({ text, id, label, className = "" }: { text: string; id?: string; label?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setFailed(!speakArabic(text, id));
      }}
      aria-label={label ?? `Listen: ${text}`}
      title={failed ? "No Arabic voice on this device" : "Listen"}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky/40 text-heading hover:bg-sky ${className}`}
    >
      <span aria-hidden="true">{failed ? "🔇" : "🔊"}</span>
    </button>
  );
}
