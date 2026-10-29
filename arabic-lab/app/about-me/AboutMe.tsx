"use client";

import Link from "next/link";
import { useState } from "react";
import { ListenButton } from "@/components/ListenButton";
import { buildIntro, genderOf, PARTNER_QUESTIONS, sentenceTiles, type Line, type Partner } from "@/lib/about-me";
import { shuffle } from "@/lib/games/random";
import { XP } from "@/lib/games/scoring";
import { addXp } from "@/lib/progress";
import { playError, playSuccess } from "@/lib/sfx";
import { useLocalStudent } from "@/lib/student";

const TABS = [
  { id: "intro", en: "My introduction" },
  { id: "build", en: "Build my sentences" },
  { id: "partner", en: "Ask your partner" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AboutMe() {
  const student = useLocalStudent();
  const [tab, setTab] = useState<Tab>("intro");

  if (student === undefined) return null;
  if (!student) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-heading">About Me</h1>
        <p className="mt-2 text-muted">Register first, and your introduction is built from your details.</p>
        <Link href="/start" className="mt-6 inline-block rounded-full bg-orange px-6 py-3 font-bold text-on-accent">
          Start learning
        </Link>
      </div>
    );
  }

  const lines = buildIntro(student);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-heading">
        About Me ·{" "}
        <span lang="ar" dir="rtl">
          عنّي
        </span>
      </h1>
      <div role="tablist" aria-label="About Me" className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="rounded-full border-2 border-sky/60 px-4 py-2 font-medium aria-selected:border-plum aria-selected:bg-plum aria-selected:text-white dark:aria-selected:border-orange dark:aria-selected:bg-orange dark:aria-selected:text-plum"
          >
            {t.en}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-6">
        {tab === "intro" && <Intro lines={lines} />}
        {tab === "build" && <Builder lines={lines.filter((l) => sentenceTiles(l.ar).length > 1)} />}
        {tab === "partner" && <AskPartner />}
      </div>
      <p className="mt-10 text-sm text-muted">
        Chat spelling shows the Levantine pronunciation. Change your favourites in{" "}
        <Link href="/profile" className="underline">
          My details
        </Link>{" "}
        and your introduction updates.
      </p>
    </div>
  );
}

function Intro({ lines }: { lines: Line[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {lines.map((l) => (
        <li key={l.id} className="flex items-start gap-3 rounded-3xl bg-surface p-4 shadow-sm">
          <ListenButton text={l.ar} />
          <div className="flex-1">
            <p lang="ar" dir="rtl" className="font-display text-2xl font-bold text-heading">
              {l.ar}
            </p>
            <p className="text-sm text-muted">{l.chat}</p>
            <p>{l.en}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Builder({ lines }: { lines: Line[] }) {
  const [index, setIndex] = useState(0);
  const line = lines[index];
  if (!line) return null;
  return (
    <div>
      <p className="text-sm text-muted">
        Sentence {index + 1} of {lines.length}. Tap the Arabic words in the right order.
      </p>
      <Scramble key={line.id} line={line} onNext={() => setIndex((i) => (i + 1) % lines.length)} last={index === lines.length - 1} />
    </div>
  );
}

// XP once per sentence per visit, so repeating the same sentence can't farm XP.
const rewarded = new Set<string>();

function Scramble({ line, onNext, last }: { line: Line; onNext: () => void; last: boolean }) {
  const words = sentenceTiles(line.ar);
  // Tiles keep their position in `words` so repeated words still work.
  const [order] = useState(() => {
    let o = shuffle(words.map((_, i) => i));
    for (let tries = 0; tries < 5 && o.every((v, i) => v === i); tries++) o = shuffle(o);
    return o;
  });
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);

  function pick(i: number) {
    if (result === "right") return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === words.length) {
      const ok = next.map((n) => words[n]).join(" ") === words.join(" ");
      setResult(ok ? "right" : "wrong");
      if (ok) {
        if (!rewarded.has(line.ar)) addXp(XP.correct);
        rewarded.add(line.ar);
        playSuccess();
      } else playError();
    }
  }

  return (
    <div className="mt-3">
      <p className="text-lg">{line.en}</p>
      <div
        lang="ar"
        dir="rtl"
        aria-label="Your sentence"
        className={`mt-3 flex min-h-16 flex-wrap gap-2 rounded-2xl border-2 border-dashed p-3 ${
          result === "right" ? "border-success bg-success/10" : result === "wrong" ? "border-error bg-error/10" : "border-sky"
        }`}
      >
        {picked.map((n, k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              if (result === "right") return;
              setPicked(picked.filter((_, j) => j !== k));
              setResult(null);
            }}
            className="rounded-xl bg-yellow px-3 py-1 font-display text-xl font-bold text-plum"
          >
            {words[n]}
          </button>
        ))}
      </div>
      <div lang="ar" dir="rtl" className="mt-3 flex flex-wrap gap-2" aria-label="Word tiles">
        {order.map((n) =>
          picked.includes(n) ? null : (
            <button
              key={n}
              type="button"
              onClick={() => pick(n)}
              className="rounded-xl border-2 border-sky/60 bg-surface px-3 py-1 font-display text-xl font-bold text-heading hover:border-orange"
            >
              {words[n]}
            </button>
          ),
        )}
      </div>
      <div role="status" className="mt-4 min-h-6">
        {result === "right" && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-bold text-success">برافو! ✓</p>
            <ListenButton text={line.ar} />
            <button type="button" onClick={onNext} className="rounded-full bg-plum px-5 py-2 font-bold text-white dark:bg-orange dark:text-plum">
              {last ? "Start again" : "Next sentence"}
            </button>
          </div>
        )}
        {result === "wrong" && (
          <p className="font-bold text-error">Not quite. Tap a word in your sentence to take it back.</p>
        )}
      </div>
    </div>
  );
}

function AskPartner() {
  const student = useLocalStudent();
  const [partner, setPartner] = useState<Partner>(student ? (genderOf(student.gender) === "f" ? "m" : "f") : "m");
  return (
    <div>
      <div role="group" aria-label="Who are you asking?" className="flex flex-wrap gap-2">
        {(["m", "f"] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={partner === p}
            onClick={() => setPartner(p)}
            className="rounded-full bg-peach px-4 py-1.5 font-medium text-plum aria-pressed:bg-plum aria-pressed:text-white dark:aria-pressed:bg-orange dark:aria-pressed:text-plum"
          >
            Asking a {p === "m" ? "man" : "woman"}
          </button>
        ))}
      </div>
      <ol className="mt-4 flex flex-col gap-3">
        {PARTNER_QUESTIONS.map((q) => (
          <li key={q.id} className="flex items-start gap-3 rounded-3xl bg-surface p-4 shadow-sm">
            <ListenButton text={q.ar[partner]} />
            <div>
              <p lang="ar" dir="rtl" className="font-display text-2xl font-bold text-heading">
                {q.ar[partner]}
              </p>
              <p className="text-sm text-muted">{q.chat[partner]}</p>
              <p>{q.en}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
