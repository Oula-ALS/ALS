"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import { Stars } from "@/components/Stars";
import type { UnitSummary } from "@/lib/content";
import { LEVEL_NAMES, type LevelId } from "@/lib/content/types";
import { emptyProgress, unitKey, useProgress } from "@/lib/progress";
import { sessionUnit } from "@/lib/session";
import { useLocalStudent } from "@/lib/student";
import { useSettings } from "@/lib/use-settings";

const LEVELS: Array<{ id: LevelId; hint: string }> = [
  { id: "book1", hint: "Units 1–7" },
  { id: "b1", hint: "Units 2–7" },
  { id: "advanced", hint: "36 topics" },
];

export function WordsIndex({ units, sample }: { units: UnitSummary[]; sample: boolean }) {
  const student = useLocalStudent();
  const progress = useProgress() ?? emptyProgress;
  const settings = useSettings();
  const [picked, setPicked] = useState<LevelId | null>(null);
  const level = picked ?? student?.level ?? "book1";
  const list = units.filter((u) => u.level === level);
  const session = sessionUnit(level, units, settings.session).unit;

  function onKey(e: KeyboardEvent, i: number) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const next = LEVELS[(i + d + LEVELS.length) % LEVELS.length].id;
    setPicked(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-heading">
        Words ·{" "}
        <span lang="ar" dir="rtl">
          كلمات
        </span>
      </h1>

      <div role="tablist" aria-label="Level" className="mt-5 flex flex-wrap gap-2">
        {LEVELS.map((l, i) => (
          <button
            key={l.id}
            id={`tab-${l.id}`}
            role="tab"
            type="button"
            aria-selected={l.id === level}
            aria-controls="units-panel"
            tabIndex={l.id === level ? 0 : -1}
            onClick={() => setPicked(l.id)}
            onKeyDown={(e) => onKey(e, i)}
            className="rounded-full border-2 border-sky/60 px-5 py-2 font-medium aria-selected:border-plum aria-selected:bg-plum aria-selected:text-white dark:aria-selected:border-orange dark:aria-selected:bg-orange dark:aria-selected:text-plum"
          >
            {LEVEL_NAMES[l.id]} <span className="text-sm opacity-80">· {l.hint}</span>
          </button>
        ))}
      </div>

      {sample && (
        <p className="mt-4 rounded-2xl bg-yellow p-3 text-sm text-plum">
          These are <strong>sample words</strong>. The Alsama Book 1, B1 and Advanced lists will replace them.
        </p>
      )}

      <div id="units-panel" role="tabpanel" aria-labelledby={`tab-${level}`} className="mt-5">
        {list.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-sky/60 p-6 text-center text-muted">
            The {LEVEL_NAMES[level]} word lists are coming soon.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((u) => {
              const isSession = session?.id === u.id;
              return (
                <li key={u.id}>
                  <Link
                    href={`/words/${u.level}/${u.id}`}
                    className={`flex h-full flex-col gap-1 rounded-3xl p-5 hover:bg-sky/40 ${
                      isSession ? "border-2 border-orange bg-surface" : "bg-sky/20"
                    }`}
                  >
                    {isSession && <span className="text-xs font-bold uppercase tracking-wide text-accent-text">This session</span>}
                    <span className="text-sm text-muted">{u.id.startsWith("unit-") ? `Unit ${u.number}` : `Topic ${u.number}`}</span>
                    <span
                      lang={u.titleIsArabic ? "ar" : undefined}
                      dir={u.titleIsArabic ? "rtl" : undefined}
                      className="font-display text-xl font-bold text-heading"
                    >
                      {u.title}
                    </span>
                    <span className="mt-auto flex items-center justify-between pt-2 text-sm text-muted">
                      {u.wordCount} words
                      <Stars value={progress.stars[unitKey(u.level, u.id)] ?? 0} size="text-base" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
