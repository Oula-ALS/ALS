"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ModelText } from "./ModelText";
import type { Gendered, Segment, Topic } from "@/content/writing";
import { countryFor } from "@/lib/about-me";
import type { Word } from "@/lib/content/types";
import { XP } from "@/lib/games/scoring";
import { addXp } from "@/lib/progress";
import type { Choice } from "@/lib/registration";
import { playSuccess } from "@/lib/sfx";
import { useLocalStudent, type LocalStudent } from "@/lib/student";
import { useHydrated } from "@/lib/use-hydrated";
import { useSettings } from "@/lib/use-settings";
import { checkRule, countSentences, countWords } from "@/lib/writing/checklist";

export type AdvancedUnit = { id: string; title: string; words: Word[] };

const draftKey = (topicId: string) => `alsama-lab:draft:${topicId}`;
const readDraft = (topicId: string) => {
  try {
    return localStorage.getItem(draftKey(topicId)) ?? "";
  } catch {
    return "";
  }
};
const saveDraft = (topicId: string, text: string) => {
  try {
    if (text) localStorage.setItem(draftKey(topicId), text);
    else localStorage.removeItem(draftKey(topicId));
  } catch {}
};

const pickGender = (g: Gendered, female: boolean) => (typeof g === "string" ? g : female ? g.f : g.m);
const choiceAr = (c: Choice | null) => (!c ? "" : c.id === "other" ? (c as { text: string }).text : (c as { ar: string }).ar);

export function TopicView({ topic, advancedUnits }: { topic: Topic; advancedUnits: AdvancedUnit[] }) {
  const hydrated = useHydrated();
  const student = useLocalStudent();
  const settings = useSettings();
  const review = settings.content[topic.id];
  const model = review?.model?.ar ? review.model : topic.model;
  const isDraft = Boolean(topic.draft.model || topic.draft.chat) && !review?.approved;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Link href="/writing" className="text-sm font-medium text-accent-text underline">
        ← All writing topics
      </Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-heading">
        <span className="text-muted">{topic.id.toUpperCase()} · </span>
        {topic.title.en} ·{" "}
        <span lang="ar" dir="rtl">
          {topic.title.ar}
        </span>
      </h1>
      <p className="mt-2 text-lg">
        <strong>Goal:</strong> {topic.goal}
      </p>
      {topic.focus && <p className="text-muted">Focus: {topic.focus}</p>}

      <div className="mt-5">
        <ModelText model={model} phrases={topic.phrases} draft={isDraft} />
      </div>

      {topic.variants && (
        <p className="mt-3 text-sm">
          <strong>Try also:</strong> {topic.variants.join(" · ")}
        </p>
      )}

      <WordBank topic={topic} advancedUnits={advancedUnits} />

      {/* The writing part reads this device's saved draft, so it waits for the browser. */}
      {hydrated && student !== undefined && <Workshop key={topic.id} topic={topic} student={student} />}
    </div>
  );
}

function WordBank({ topic, advancedUnits }: { topic: Topic; advancedUnits: AdvancedUnit[] }) {
  const [unitId, setUnitId] = useState(advancedUnits[0]?.id ?? "");
  const groups = [...topic.wordBank];
  if (topic.advancedVocab) {
    const unit = advancedUnits.find((u) => u.id === unitId);
    if (unit) groups.push({ heading: unit.title, words: unit.words.map((w) => ({ ar: w.ar, en: w.en, chat: w.chat })) });
  }

  return (
    <section aria-labelledby="bank-title" className="mt-6">
      <h2 id="bank-title" className="font-display text-xl font-bold text-heading">
        Word bank
      </h2>
      {topic.advancedVocab &&
        (advancedUnits.length ? (
          <label className="mt-2 block text-sm">
            Topic:{" "}
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="rounded-xl border-2 border-sky bg-surface px-2 py-1">
              {advancedUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-1 text-sm text-muted">The Advanced word lists will appear here once they are added.</p>
        ))}
      {groups.length === 0 && !topic.advancedVocab && <p className="mt-1 text-sm text-muted">Use the highlighted phrases from the model text.</p>}
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.heading} className="rounded-3xl bg-surface p-4 shadow-sm">
            <h3 className="font-bold">{g.heading}</h3>
            <ul className="mt-2 flex flex-col gap-1">
              {g.words.map((w) => (
                <li key={w.ar} className="flex items-baseline justify-between gap-3 border-b border-sky/30 py-1 last:border-0">
                  <span lang="ar" dir="rtl" className="font-display text-lg font-bold text-heading">
                    {w.ar}
                  </span>
                  <span className="text-end text-sm">
                    {w.en}
                    {w.chat && <span className="block text-xs text-muted">{w.chat}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workshop({ topic, student }: { topic: Topic; student: LocalStudent | null }) {
  const female = student?.gender === "female";
  const [text, setTextState] = useState(() => readDraft(topic.id));
  const [mode, setMode] = useState<"free" | "guided">(topic.guided && !readDraft(topic.id) ? "guided" : "free");
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  // Where the student last put the cursor; null = never, so starters go at the end.
  const cursor = useRef<{ start: number; end: number } | null>(null);
  const rememberCursor = () => {
    const el = box.current;
    if (el) cursor.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  const setText = (t: string) => {
    setTextState(t);
    saveDraft(topic.id, t);
    if (status === "sent") setStatus("idle");
  };

  function insert(starter: string) {
    const clean = starter.replace(/…$/, " ").replace(/…/g, " … ");
    const el = box.current;
    const start = Math.min(cursor.current?.start ?? text.length, text.length);
    const end = Math.min(cursor.current?.end ?? text.length, text.length);
    const before = text.slice(0, start);
    const glue = before && !/\s$/.test(before) ? " " : "";
    const next = before + glue + clean + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = (before + glue + clean).length;
      el?.setSelectionRange(pos, pos);
      cursor.current = { start: pos, end: pos };
    });
  }

  async function submit() {
    if (!student) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student.id, token: student.token, topicId: topic.id, text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error === "not_found"
            ? "We couldn't find your registration. Please check My details."
            : data.error === "too_many_requests"
              ? "Too many tries. Please wait a few minutes."
              : data.error === "not_configured"
                ? "Sending isn't switched on yet. Please tell your teacher."
                : "Couldn't send. Your text is saved on this device; please try again.",
        );
        setStatus("idle");
        return;
      }
      addXp(XP.writingSubmitted);
      playSuccess();
      saveDraft(topic.id, "");
      setStatus("sent");
    } catch {
      setError("No internet connection? Your text is saved on this device; try again later.");
      setStatus("idle");
    }
  }

  const words = countWords(text);
  const sentences = countSentences(text);

  return (
    <>
      <section aria-labelledby="write-title" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="write-title" className="font-display text-2xl font-bold text-heading">
            Your turn ·{" "}
            <span lang="ar" dir="rtl">
              دورك
            </span>
          </h2>
          {topic.guided && (
            <div role="group" aria-label="Writing mode" className="flex gap-2">
              {(["guided", "free"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className="rounded-full bg-peach px-4 py-1.5 text-sm font-medium text-plum aria-pressed:bg-plum aria-pressed:text-white dark:aria-pressed:bg-orange dark:aria-pressed:text-plum"
                >
                  {m === "guided" ? "Guided" : "Free writing"}
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === "guided" && topic.guided ? (
          <Guided
            segments={topic.guided}
            student={student}
            draft={topic.draft.guided === true}
            onUse={(t) => {
              setText(text.trim() ? `${text.trim()}\n${t}` : t);
              setMode("free");
            }}
          />
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Sentence starters">
              {topic.starters.map((s) => {
                const value = pickGender(s, female);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => insert(value)}
                    lang="ar"
                    dir="rtl"
                    className="rounded-full bg-sky/30 px-3 py-1 text-lg hover:bg-sky/60"
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <label htmlFor="writing-box" className="sr-only">
              Your text
            </label>
            <textarea
              id="writing-box"
              ref={box}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                rememberCursor();
              }}
              onSelect={rememberCursor}
              dir="auto"
              rows={9}
              maxLength={5000}
              placeholder="Write in Arabic letters or chat letters… اكتب هون"
              className="mt-3 w-full rounded-3xl border-2 border-sky bg-surface p-4 font-display text-xl leading-relaxed text-ink"
            />
            <p className="text-sm text-muted" aria-live="polite">
              {words} {words === 1 ? "word" : "words"} · {sentences} {sentences === 1 ? "sentence" : "sentences"} · saved on this device
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="check-title" className="mt-6 rounded-3xl bg-peach p-5 text-plum">
        <h2 id="check-title" className="font-display text-xl font-bold">
          Checklist
        </h2>
        <ul className="mt-2 flex flex-col gap-1">
          {topic.checklist.map((rule) => {
            const auto = checkRule(rule, text);
            const done = auto ?? manual[rule.id] ?? false;
            return (
              <li key={rule.id}>
                {auto === null ? (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={done} onChange={(e) => setManual({ ...manual, [rule.id]: e.target.checked })} className="h-5 w-5 accent-plum" />
                    {rule.label}
                  </label>
                ) : (
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-full text-sm ${done ? "bg-success text-white" : "border-2 border-plum/40"}`}>
                      {done ? "✓" : ""}
                    </span>
                    <span className={done ? "font-medium" : ""}>{rule.label}</span>
                    <span className="sr-only">{done ? "(done)" : "(not yet)"}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6">
        {!student ? (
          <p className="text-muted">
            <Link href="/start" className="underline">
              Register
            </Link>{" "}
            to send your writing to your teacher.
          </p>
        ) : status === "sent" ? (
          <p role="status" className="rounded-2xl bg-success/15 p-4 font-medium">
            ✓ Sent to your teacher! +{XP.writingSubmitted} XP. You&apos;ll see their feedback in{" "}
            <Link href="/writing/mine" className="underline">
              My writings
            </Link>
            .
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={submit}
              disabled={status === "sending" || !text.trim()}
              className="rounded-full bg-orange px-8 py-4 font-display text-lg font-bold text-on-accent disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send to my teacher"}
            </button>
            {error && (
              <p role="alert" className="mt-2 font-medium text-error">
                {error}
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}

function Guided({ segments, student, draft, onUse }: { segments: Segment[]; student: LocalStudent | null; draft: boolean; onUse: (text: string) => void }) {
  const female = student?.gender === "female";
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const s of segments) {
      if (typeof s !== "object" || !("blank" in s) || !s.prefill || !student) continue;
      v[s.blank] =
        s.prefill === "name"
          ? student.name
          : s.prefill === "country"
            ? countryFor(student.from).ar
            : s.prefill === "hobby"
              ? choiceAr(student.hobby)
              : choiceAr(student.animal);
    }
    return v;
  });

  const compose = () =>
    segments
      .map((s) => (typeof s === "string" ? s : "g" in s ? (female ? s.g.f : s.g.m) : values[s.blank]?.trim() || "…"))
      .join("");
  const missing = segments.filter((s) => typeof s === "object" && "blank" in s && !values[s.blank]?.trim()).length;

  return (
    <div className="mt-3 rounded-3xl border-2 border-sky bg-surface p-5">
      <p className="text-sm text-muted">
        Fill in the blanks. {draft && "(Guided text is a draft until your teacher checks it.)"}
      </p>
      <p lang="ar" dir="rtl" className="mt-2 font-display text-xl leading-[2.6]">
        {segments.map((s, k) => {
          if (typeof s === "string") return <span key={k}>{s}</span>;
          if ("g" in s) return <span key={k}>{female ? s.g.f : s.g.m}</span>;
          return (
            <input
              key={k}
              type="text"
              aria-label={s.label}
              placeholder={s.label}
              value={values[s.blank] ?? ""}
              onChange={(e) => setValues({ ...values, [s.blank]: e.target.value })}
              dir="auto"
              size={Math.max(8, (values[s.blank] ?? s.label).length + 1)}
              className="mx-1 rounded-lg border-b-2 border-orange bg-yellow/40 px-2 py-0.5 text-lg"
            />
          );
        })}
      </p>
      <button
        type="button"
        onClick={() => onUse(compose())}
        className="mt-4 rounded-full bg-plum px-6 py-3 font-bold text-white dark:bg-orange dark:text-plum"
      >
        Use this text {missing > 0 && `(${missing} blank${missing === 1 ? "" : "s"} left)`}
      </button>
    </div>
  );
}
