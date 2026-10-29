"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Stars } from "@/components/Stars";
import { TOPICS, topicById } from "@/content/writing";
import type { UnitSummary } from "@/lib/content";
import { LEVEL_NAMES, type LevelId } from "@/lib/content/types";
import { choiceLabel, type Choice } from "@/lib/registration";
import type { ContentSettings, SessionSettings, Settings } from "@/lib/settings";
import { reloadSettings } from "@/lib/use-settings";

type Student = {
  id: string;
  name: string;
  email: string;
  gender: string;
  from_place: string;
  level: LevelId;
  travel: Choice | null;
  hobby: Choice | null;
  animal: Choice | null;
  dream: Choice | null;
  xp: number;
  streak: number;
  created_at: string;
  last_active: string;
};
type Writing = {
  id: string;
  student_id: string;
  topic_id: string;
  text: string;
  status: "new" | "reviewed";
  feedback: string | null;
  stars: number | null;
  created_at: string;
};
type Data = { students: Student[]; writings: Writing[]; settings: Settings | null };

const TABS = [
  { id: "session", en: "This session" },
  { id: "students", en: "Students" },
  { id: "writings", en: "Writings inbox" },
  { id: "content", en: "Content review" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const LEVELS: LevelId[] = ["book1", "b1", "advanced"];
const date = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-GB") : "–");
const short = (c: Choice | null) => (!c ? "–" : c.id === "other" ? (c as { text: string }).text : (c as { en: string }).en);

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json" }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function Dashboard({ units }: { units: UnitSummary[] }) {
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "login" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("writings");

  const load = useCallback(async () => {
    const r = await api("/api/teacher/data");
    if (r.status === 401) return setState("login");
    if (!r.ok) {
      setError(r.data.error === "not_configured" ? "The database isn't set up yet (see docs/setup-registration.md)." : "Couldn't load the data.");
      return setState("error");
    }
    setData(r.data);
    setState("ready");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first load of the dashboard data
    void load();
  }, [load]);

  if (state === "loading") return <p className="p-8 text-center text-muted">Loading…</p>;
  if (state === "login") return <Login onDone={load} />;
  if (state === "error" || !data) return <p className="p-8 text-center font-medium text-error">{error}</p>;

  const newCount = data.writings.filter((w) => w.status === "new").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-heading">Teacher dashboard</h1>
        <button
          type="button"
          onClick={async () => {
            await api("/api/teacher/login", { method: "DELETE" });
            setState("login");
          }}
          className="text-sm font-medium underline"
        >
          Log out
        </button>
      </div>
      <div role="tablist" aria-label="Dashboard" className="mt-5 flex flex-wrap gap-2">
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
            {t.id === "writings" && newCount > 0 && <span className="ms-2 rounded-full bg-orange px-2 text-sm text-plum">{newCount} new</span>}
            {t.id === "students" && <span className="ms-2 text-sm opacity-80">{data.students.length}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-6">
        {tab === "session" && <SessionTab units={units} initial={data.settings?.session ?? {}} />}
        {tab === "students" && <StudentsTab students={data.students} />}
        {tab === "writings" && <WritingsTab data={data} onSaved={(w) => setData({ ...data, writings: data.writings.map((x) => (x.id === w.id ? w : x)) })} />}
        {tab === "content" && <ContentTab initial={data.settings?.content ?? {}} />}
      </div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = await api("/api/teacher/login", { method: "POST", body: JSON.stringify({ password }) });
    if (r.ok) return onDone();
    setError(
      r.data.error === "not_configured"
        ? "TEACHER_PASSWORD isn't set yet (Vercel → Settings → Environment Variables)."
        : r.data.error === "too_many_requests"
          ? "Too many tries. Wait 15 minutes."
          : "Wrong password.",
    );
  }
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-sm flex-col gap-3 px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-heading">Teacher login</h1>
      <label htmlFor="pw" className="font-medium">
        Password
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-xl border-2 border-sky bg-surface px-3 py-2"
      />
      {error && (
        <p role="alert" className="font-medium text-error">
          {error}
        </p>
      )}
      <button type="submit" className="rounded-full bg-orange px-6 py-3 font-bold text-on-accent">
        Log in
      </button>
    </form>
  );
}

function SaveButton({ onClick, label = "Save" }: { onClick: () => Promise<boolean>; label?: string }) {
  const [msg, setMsg] = useState("");
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={async () => {
          setMsg("Saving…");
          setMsg((await onClick()) ? "Saved ✓" : "Couldn't save. Try again.");
        }}
        className="rounded-full bg-orange px-6 py-3 font-bold text-on-accent"
      >
        {label}
      </button>
      <span role="status" className="text-sm">
        {msg}
      </span>
    </span>
  );
}

function SessionTab({ units, initial }: { units: UnitSummary[]; initial: SessionSettings }) {
  const [pins, setPins] = useState<SessionSettings>(initial);
  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">Pick the unit you covered in class. Students of that level see it first on their Home screen.</p>
      {LEVELS.map((level) => {
        const list = units.filter((u) => u.level === level);
        const pin = pins[level] ?? { unitId: null, note: "" };
        return (
          <fieldset key={level} className="rounded-3xl bg-surface p-5 shadow-sm">
            <legend className="font-display text-xl font-bold text-heading">{LEVEL_NAMES[level]}</legend>
            {list.length === 0 ? (
              <p className="text-sm text-muted">No word lists for this level yet.</p>
            ) : (
              <label className="mt-2 block">
                <span className="text-sm font-medium">Unit</span>
                <select
                  value={pin.unitId ?? ""}
                  onChange={(e) => setPins({ ...pins, [level]: { ...pin, unitId: e.target.value || null } })}
                  className="mt-1 block w-full rounded-xl border-2 border-sky bg-surface px-3 py-2"
                >
                  <option value="">Not pinned (first unit)</option>
                  {list.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id.startsWith("unit-") ? `Unit ${u.number}` : `Topic ${u.number}`} · {u.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="mt-3 block">
              <span className="text-sm font-medium">Note for students (optional)</span>
              <input
                type="text"
                maxLength={300}
                value={pin.note}
                onChange={(e) => setPins({ ...pins, [level]: { ...pin, note: e.target.value } })}
                dir="auto"
                placeholder="e.g. Practise the days of the week before Thursday!"
                className="mt-1 block w-full rounded-xl border-2 border-sky bg-surface px-3 py-2"
              />
            </label>
          </fieldset>
        );
      })}
      <SaveButton
        onClick={async () => {
          const r = await api("/api/teacher/settings", { method: "PUT", body: JSON.stringify({ key: "session", value: pins }) });
          if (r.ok) reloadSettings();
          return r.ok;
        }}
      />
    </div>
  );
}

function toCsv(students: Student[]) {
  const head = ["Name", "Email", "Gender", "From", "Level", "Travel", "Hobby", "Animal", "Dream", "XP", "Streak", "Joined", "Last active"];
  const cell = (v: string | number) => {
    const s = String(v);
    // Quote every cell; also stop spreadsheet formulas in student-typed text.
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const rows = students.map((s) => [
    s.name, s.email, s.gender, s.from_place, LEVEL_NAMES[s.level] ?? s.level, choiceLabel(s.travel), choiceLabel(s.hobby),
    choiceLabel(s.animal), choiceLabel(s.dream), s.xp, s.streak, date(s.created_at), date(s.last_active),
  ]);
  return "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}

function StudentsTab({ students }: { students: Student[] }) {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? students.filter((s) => [s.name, s.email, s.from_place].some((v) => v.toLowerCase().includes(t))) : students;
  }, [q, students]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex-1">
          <span className="sr-only">Search students</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or country"
            className="w-full rounded-xl border-2 border-sky bg-surface px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            const emails = shown.map((s) => s.email).join(", ");
            try {
              await navigator.clipboard.writeText(emails);
              setCopied(`Copied ${shown.length} ${shown.length === 1 ? "email" : "emails"} ✓`);
            } catch {
              setCopied("Couldn't copy. Select them from the table instead.");
            }
          }}
          className="rounded-full border-2 border-plum px-4 py-2 font-bold text-heading dark:border-sky"
        >
          Copy all emails
        </button>
        <button
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(new Blob([toCsv(shown)], { type: "text/csv;charset=utf-8" }));
            const a = Object.assign(document.createElement("a"), { href: url, download: `alsama-students-${new Date().toISOString().slice(0, 10)}.csv` });
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="rounded-full bg-orange px-4 py-2 font-bold text-on-accent"
        >
          Export CSV
        </button>
      </div>
      <p role="status" className="mt-1 min-h-5 text-sm">
        {copied}
      </p>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-sky/40">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <caption className="sr-only">Students</caption>
          <thead className="bg-peach text-plum">
            <tr>
              {["Name", "Email", "Gender", "From", "Level", "Travel", "Hobby", "Animal", "Dream", "XP", "Streak", "Joined", "Last active"].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.id} className="border-t border-sky/30">
                <td className="px-3 py-2 font-medium">{s.name}</td>
                <td className="px-3 py-2">
                  <a href={`mailto:${s.email}`} className="underline">
                    {s.email}
                  </a>
                </td>
                <td className="px-3 py-2">{s.gender}</td>
                <td className="px-3 py-2">{s.from_place}</td>
                <td className="px-3 py-2">{LEVEL_NAMES[s.level] ?? s.level}</td>
                <td className="px-3 py-2">{short(s.travel)}</td>
                <td className="px-3 py-2">{short(s.hobby)}</td>
                <td className="px-3 py-2">{short(s.animal)}</td>
                <td className="px-3 py-2">{short(s.dream)}</td>
                <td className="px-3 py-2">{s.xp}</td>
                <td className="px-3 py-2">{s.streak}</td>
                <td className="px-3 py-2">{date(s.created_at)}</td>
                <td className="px-3 py-2">{date(s.last_active)}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-muted">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WritingsTab({ data, onSaved }: { data: Data; onSaved: (w: Writing) => void }) {
  const [student, setStudent] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<"" | "new" | "reviewed">("");
  const [openId, setOpenId] = useState<string | null>(null);
  const names = new Map(data.students.map((s) => [s.id, s.name]));
  // New writings first, then newest first (the list arrives newest first).
  const shown = data.writings
    .filter((w) => (!student || w.student_id === student) && (!topic || w.topic_id === topic) && (!status || w.status === status))
    .sort((a, b) => Number(b.status === "new") - Number(a.status === "new"));

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Select label="Student" value={student} onChange={setStudent} options={data.students.map((s) => [s.id, s.name])} />
        <Select label="Topic" value={topic} onChange={setTopic} options={TOPICS.map((t) => [t.id, `${t.id.toUpperCase()} · ${t.title.en}`])} />
        <Select label="Status" value={status} onChange={(v) => setStatus(v as typeof status)} options={[["new", "New"], ["reviewed", "Reviewed"]]} />
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {shown.map((w) => {
          const t = topicById(w.topic_id);
          const open = openId === w.id;
          return (
            <li key={w.id} className="rounded-3xl bg-surface p-4 shadow-sm">
              <button type="button" onClick={() => setOpenId(open ? null : w.id)} aria-expanded={open} className="flex w-full flex-wrap items-baseline justify-between gap-2 text-left">
                <span className="font-display text-lg font-bold text-heading">
                  {names.get(w.student_id) ?? "Deleted student"} · {t?.title.en ?? w.topic_id}
                </span>
                <span className="text-sm">
                  {w.status === "new" ? <span className="rounded-full bg-orange px-2 text-plum">New</span> : <Stars value={w.stars ?? 0} size="text-sm" />}{" "}
                  {date(w.created_at)}
                </span>
              </button>
              {open && <Review writing={w} onSaved={onSaved} />}
            </li>
          );
        })}
        {shown.length === 0 && <li className="text-muted">Nothing here.</li>}
      </ul>
    </div>
  );
}

function Review({ writing, onSaved }: { writing: Writing; onSaved: (w: Writing) => void }) {
  const [feedback, setFeedback] = useState(writing.feedback ?? "");
  const [stars, setStars] = useState<number | null>(writing.stars);
  return (
    <div className="mt-3 border-t border-sky/30 pt-3">
      <p dir="auto" className="whitespace-pre-line font-display text-lg">
        {writing.text}
      </p>
      <label className="mt-3 block">
        <span className="text-sm font-medium">Feedback</span>
        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} dir="auto" maxLength={3000} className="mt-1 w-full rounded-2xl border-2 border-sky bg-surface p-3" />
      </label>
      <div role="group" aria-label="Stars" className="mt-2 flex gap-2">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={stars === n}
            onClick={() => setStars(stars === n ? null : n)}
            className="rounded-full border-2 border-sky/60 px-3 py-1 aria-pressed:border-plum aria-pressed:bg-yellow aria-pressed:text-plum"
          >
            {"⭐".repeat(n)}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <SaveButton
          label="Save & mark reviewed"
          onClick={async () => {
            const r = await api("/api/teacher/writings", { method: "PATCH", body: JSON.stringify({ id: writing.id, feedback, stars, status: "reviewed" }) });
            if (r.ok) onSaved(r.data.writing);
            return r.ok;
          }}
        />
      </div>
    </div>
  );
}

function ContentTab({ initial }: { initial: ContentSettings }) {
  const [content, setContent] = useState<ContentSettings>(initial);
  const drafts = TOPICS.filter((t) => t.draft.model || t.draft.chat || t.draft.guided);
  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">
        These texts were written by Claude and are shown to students as <strong>drafts</strong>. Edit anything, tick “Approved”, then save.
      </p>
      {drafts.map((t) => {
        const review = content[t.id] ?? { approved: false };
        const model = review.model ?? t.model;
        const set = (patch: Partial<typeof model>) => setContent({ ...content, [t.id]: { ...review, model: { ...model, ...patch } } });
        const parts = [t.draft.model && "model text", t.draft.chat && "chat spelling", t.draft.guided && "guided template"].filter(Boolean).join(", ");
        return (
          <fieldset key={t.id} className="rounded-3xl bg-surface p-5 shadow-sm">
            <legend className="font-display text-xl font-bold text-heading">
              {t.id.toUpperCase()} · {t.title.en} · <span lang="ar" dir="rtl">{t.title.ar}</span>
            </legend>
            <p className="text-sm text-muted">Draft parts: {parts}</p>
            <label className="mt-2 block">
              <span className="text-sm font-medium">Arabic</span>
              <textarea lang="ar" dir="rtl" rows={4} value={model.ar} onChange={(e) => set({ ar: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-sky bg-surface p-3 font-display text-lg" />
            </label>
            <label className="mt-2 block">
              <span className="text-sm font-medium">Chat</span>
              <textarea rows={3} value={model.chat} onChange={(e) => set({ chat: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-sky bg-surface p-3" />
            </label>
            <label className="mt-2 block">
              <span className="text-sm font-medium">English</span>
              <textarea rows={3} value={model.en} onChange={(e) => set({ en: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-sky bg-surface p-3" />
            </label>
            <label className="mt-3 flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={review.approved}
                onChange={(e) => setContent({ ...content, [t.id]: { ...review, approved: e.target.checked } })}
                className="h-5 w-5 accent-plum"
              />
              Approved
            </label>
          </fieldset>
        );
      })}
      <SaveButton
        onClick={async () => {
          const r = await api("/api/teacher/settings", { method: "PUT", body: JSON.stringify({ key: "content", value: content }) });
          if (r.ok) reloadSettings();
          return r.ok;
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="ms-2 rounded-xl border-2 border-sky bg-surface px-2 py-1">
        <option value="">All</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
