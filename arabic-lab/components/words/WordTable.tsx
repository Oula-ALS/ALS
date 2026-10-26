"use client";

import { useState } from "react";
import { ListenButton } from "@/components/ListenButton";
import type { LevelId, Word } from "@/lib/content/types";

export function WordTable({ words }: { level: LevelId; unitId: string; words: Word[] }) {
  const [pos, setPos] = useState<string>("all");
  const counts = new Map<string, number>();
  words.forEach((w) => counts.set(w.pos || "other", (counts.get(w.pos || "other") ?? 0) + 1));
  const shown = pos === "all" ? words : words.filter((w) => (w.pos || "other") === pos);

  return (
    <div>
      <div role="group" aria-label="Filter by part of speech" className="flex flex-wrap gap-2">
        {[["all", words.length] as const, ...counts.entries()].map(([p, n]) => (
          <button
            key={p}
            type="button"
            aria-pressed={pos === p}
            onClick={() => setPos(p)}
            className="rounded-full bg-peach px-4 py-1.5 text-sm font-medium text-plum aria-pressed:bg-plum aria-pressed:text-white dark:aria-pressed:bg-orange dark:aria-pressed:text-plum"
          >
            {p === "all" ? "All" : p} · {n}
          </button>
        ))}
      </div>

      <table className="mt-4 w-full border-separate border-spacing-y-2">
        <caption className="sr-only">Words in this unit</caption>
        <thead className="text-left text-sm text-muted">
          <tr>
            <th scope="col" className="px-3 text-right">
              Arabic
            </th>
            <th scope="col" className="hidden px-3 sm:table-cell">
              Chat
            </th>
            <th scope="col" className="px-3">
              English
            </th>
            <th scope="col" className="px-3">
              <span className="sr-only">Listen</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((w) => (
            <tr key={w.id} className="bg-surface shadow-sm">
              <td lang="ar" dir="rtl" className="rounded-s-2xl px-3 py-2 text-right font-display text-2xl font-bold text-heading">
                {w.ar}
              </td>
              <td className="hidden px-3 py-2 text-muted sm:table-cell">{w.chat}</td>
              <td className="px-3 py-2">
                {w.en}
                <span className="block text-sm text-muted sm:hidden">{w.chat}</span>
                {w.pos && <span className="block text-xs text-muted">{w.pos}</span>}
              </td>
              <td className="rounded-e-2xl px-3 py-2 text-right">
                <ListenButton text={w.ar} id={w.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
