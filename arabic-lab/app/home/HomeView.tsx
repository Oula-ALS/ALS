"use client";

import Link from "next/link";
import { RankBar } from "@/components/RankBar";
import { Stars } from "@/components/Stars";
import type { UnitSummary } from "@/lib/content";
import { LEVEL_NAMES } from "@/lib/content/types";
import { dayKey, visibleStreak } from "@/lib/games/scoring";
import { emptyProgress, unitKey, useProgress } from "@/lib/progress";
import { sessionUnit } from "@/lib/session";
import { useLocalStudent } from "@/lib/student";

const TILES = [
  { href: "/words", en: "Words", ar: "كلمات", icon: "📚", ready: true },
  { href: "/phrases", en: "Top 100 Phrases", ar: "أهم ١٠٠ جملة", icon: "💬", ready: false },
  { href: "/grammar", en: "Grammar", ar: "قواعد", icon: "🧩", ready: false },
  { href: "/writing", en: "Writing", ar: "كتابة", icon: "✍️", ready: false },
  { href: "/about-me", en: "About Me", ar: "عنّي", icon: "🙋", ready: false },
];

export function HomeView({ units, sample }: { units: UnitSummary[]; sample: boolean }) {
  const student = useLocalStudent();
  const progress = useProgress() ?? emptyProgress;

  if (student === undefined) return null;
  if (!student) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-heading">Welcome!</h1>
        <p className="mt-2 text-muted">Tell us a little about you first.</p>
        <Link href="/start" className="mt-6 inline-block rounded-full bg-orange px-6 py-3 font-bold text-on-accent">
          Start learning
        </Link>
      </div>
    );
  }

  const streak = visibleStreak(progress.streak, progress.lastDay, dayKey());
  const session = sessionUnit(student.level, units);
  const sessionHref = session.unit ? `/words/${session.unit.level}/${session.unit.id}` : "/words";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 lang="ar" dir="rtl" className="text-right font-display text-4xl font-extrabold text-accent-text sm:text-left">
        مرحبا {student.name}!
      </h1>

      <section aria-label="Your progress" className="mt-5 rounded-3xl bg-peach p-5 text-plum">
        <RankBar xp={progress.xp} />
        <dl className="mt-4 flex gap-6">
          <div>
            <dt className="text-sm">Streak</dt>
            <dd className="font-display text-2xl font-extrabold">
              🔥 {streak} {streak === 1 ? "day" : "days"}
            </dd>
          </div>
          <div>
            <dt className="text-sm">XP</dt>
            <dd className="font-display text-2xl font-extrabold">✨ {progress.xp}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="session-title" className="mt-5 rounded-3xl border-2 border-orange bg-surface p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-accent-text">
          This session · {LEVEL_NAMES[student.level]}
        </p>
        {session.unit ? (
          <>
            <h2 id="session-title" className="mt-1 font-display text-2xl font-bold text-heading">
              <span lang={session.unit.titleIsArabic ? "ar" : undefined} dir={session.unit.titleIsArabic ? "rtl" : undefined}>
                {session.unit.title}
              </span>
            </h2>
            <p className="text-sm text-muted">
              {session.unit.wordCount} words ·{" "}
              <Stars value={progress.stars[unitKey(session.unit.level, session.unit.id)] ?? 0} size="text-sm" />
            </p>
            {!session.pinnedByTeacher && (
              <p className="mt-1 text-sm text-muted">Your teacher will soon be able to pin the unit from class here.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`${sessionHref}/quiz`} className="rounded-full bg-orange px-6 py-3 font-bold text-on-accent">
                Quick quiz
              </Link>
              <Link href={sessionHref} className="rounded-full border-2 border-plum px-6 py-3 font-bold text-heading dark:border-sky">
                Open word list
              </Link>
            </div>
          </>
        ) : (
          <p id="session-title" className="mt-1 text-muted">
            The {LEVEL_NAMES[student.level]} word lists aren&apos;t loaded yet.
          </p>
        )}
      </section>

      {sample && (
        <p className="mt-5 rounded-2xl bg-yellow p-3 text-sm text-plum">
          You&apos;re seeing <strong>sample words</strong> while the Alsama word lists are being added.
        </p>
      )}

      <nav aria-label="Sections" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TILES.map((t) =>
          t.ready ? (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col items-center gap-1 rounded-3xl bg-sky/30 p-5 text-center hover:bg-sky/60"
            >
              <span aria-hidden="true" className="text-3xl">
                {t.icon}
              </span>
              <span className="font-display text-lg font-bold text-heading">{t.en}</span>
              <span lang="ar" dir="rtl" className="text-sm">
                {t.ar}
              </span>
            </Link>
          ) : (
            <div key={t.href} aria-disabled="true" className="flex flex-col items-center gap-1 rounded-3xl border-2 border-dashed border-sky/60 p-5 text-center">
              <span aria-hidden="true" className="text-3xl opacity-60">
                {t.icon}
              </span>
              <span className="font-display text-lg font-bold text-heading">{t.en}</span>
              <span lang="ar" dir="rtl" className="text-sm">
                {t.ar}
              </span>
              <span className="text-xs text-muted">Coming soon</span>
            </div>
          ),
        )}
      </nav>
    </div>
  );
}
