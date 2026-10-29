"use client";

import Link from "next/link";
import { TOPICS } from "@/content/writing";
import { LEVEL_NAMES, type LevelId } from "@/lib/content/types";
import { useLocalStudent } from "@/lib/student";

const ORDER: LevelId[] = ["book1", "b1", "advanced"];

export function WritingIndex() {
  const student = useLocalStudent();
  const mine = student?.level;
  const levels = mine ? [mine, ...ORDER.filter((l) => l !== mine)] : ORDER;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-heading">
          Writing ·{" "}
          <span lang="ar" dir="rtl">
            كتابة
          </span>
        </h1>
        <Link href="/writing/mine" className="rounded-full border-2 border-plum px-5 py-2 font-bold text-heading dark:border-sky">
          My writings
        </Link>
      </div>
      <p className="mt-2 text-muted">Read a model text, then write your own on the same topic and send it to your teacher.</p>

      {levels.map((level) => (
        <section key={level} className="mt-8" aria-labelledby={`level-${level}`}>
          <h2 id={`level-${level}`} className="font-display text-xl font-bold text-heading">
            {LEVEL_NAMES[level]}
            {level === mine && <span className="ms-2 text-sm font-normal text-accent-text">· your level</span>}
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.filter((t) => t.level === level).map((t) => (
              <li key={t.id}>
                <Link href={`/writing/${t.id}`} className="flex h-full flex-col gap-1 rounded-3xl bg-sky/20 p-5 hover:bg-sky/40">
                  <span className="text-sm text-muted">{t.id.toUpperCase()}</span>
                  <span className="font-display text-xl font-bold text-heading">{t.title.en}</span>
                  <span lang="ar" dir="rtl" className="text-lg">
                    {t.title.ar}
                  </span>
                  <span className="mt-1 text-sm text-muted">{t.goal}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
