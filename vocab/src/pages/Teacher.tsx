import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { LEVELS } from "../lib/data";
import { normalizeArabic } from "../lib/arabic";
import { EXAMPLES, makeCloze, type ExampleEntry, type ExamplesFile } from "../lib/examples";
import { load, save } from "../lib/storage";
import type { Level, Word } from "../types";

// Teachers' edits are kept in this browser until they export the file.
const DRAFTS = "teacher-drafts";
const UNLOCKED = "teacher-unlocked";

type Status = "todo" | "approved" | "rejected" | "missing";
const STATUS_LABEL: Record<Status | "all", string> = {
  todo: "To review",
  approved: "Approved",
  rejected: "Rejected",
  missing: "No sentence",
  all: "All",
};

function statusOf(e: ExampleEntry | undefined): Status {
  if (!e) return "missing";
  if (e.rejected) return "rejected";
  return e.reviewed ? "approved" : "todo";
}

function sessionFlag(): boolean {
  try {
    return sessionStorage.getItem(UNLOCKED) === "yes";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- passcode

function Login({ onOk }: { onOk: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/teacher-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code }),
      });
      if (res.ok) {
        try {
          sessionStorage.setItem(UNLOCKED, "yes");
        } catch {
          // ignore
        }
        onOk();
      } else if (res.status === 401) setError("That passcode is not right.");
      else if (res.status === 429) setError("Too many tries. Wait 15 minutes and try again.");
      else if (res.status === 503) setError("The teacher passcode hasn’t been set up yet (TEACHER_PASSCODE in Vercel).");
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Can’t reach the server. Check your internet connection.");
    }
    setBusy(false);
  }

  return (
    <Layout back={{ to: "/", label: "home" }}>
      <h1 className="text-3xl font-extrabold">Teachers</h1>
      <p className="mt-1 text-muted">Review the example sentences before students see them.</p>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <label htmlFor="passcode" className="block font-bold">
          Teacher passcode
        </label>
        <input
          id="passcode"
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="current-password"
          className="h-14 w-full rounded-2xl border-2 border-line px-4 text-lg outline-none focus:border-brand"
        />
        {error && <p className="text-sm font-semibold text-brand">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={!code || busy}>
          {busy ? "Checking…" : "Open the review page"}
        </button>
      </form>
    </Layout>
  );
}

// ---------------------------------------------------------------- one sentence

function SentenceEditor({ word, entry, onChange }: { word: Word; entry: ExampleEntry | undefined; onChange: (e: ExampleEntry | null) => void }) {
  const [open, setOpen] = useState(!entry);
  const status = statusOf(entry);
  const draft: ExampleEntry = entry ?? { arabic: "", arabizi: "", english: "", answer: word.arabic, cloze: "", reviewed: false, source: "teacher" };
  const cloze = makeCloze(draft.arabic, draft.answer);
  const answerOk = word.alternatives.some((a) => normalizeArabic(a) === normalizeArabic(draft.answer));

  function update(patch: Partial<ExampleEntry>) {
    const textEdit = ["arabic", "answer", "arabizi", "english"].some((k) => k in patch);
    const next = { ...draft, ...patch, source: textEdit ? "teacher" : draft.source };
    next.cloze = makeCloze(next.arabic, next.answer) ?? "";
    onChange(next);
  }

  const badge = {
    todo: "bg-line text-ink",
    approved: "bg-good-soft text-good",
    rejected: "bg-brand-soft text-brand",
    missing: "bg-line text-muted",
  }[status];

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Ar className="text-2xl font-bold">{word.display}</Ar>
        <span className="text-sm text-muted">
          {word.english} · {word.pos}
        </span>
        <span className="flex-1" />
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge}`}>{STATUS_LABEL[status]}</span>
      </div>

      {entry && !open && (
        <div className="mt-2">
          <Ar className="block text-xl">{entry.arabic}</Ar>
          <div className="text-sm text-muted">{entry.arabizi}</div>
          <div className="text-sm">{entry.english}</div>
          {!entry.cloze && <p className="mt-1 text-sm font-semibold text-brand">⚠ The target word isn’t found in the sentence.</p>}
        </div>
      )}

      {open && (
        <div className="mt-3 grid gap-3">
          <label className="text-sm font-bold">
            Arabic sentence
            <textarea
              lang="ar"
              dir="rtl"
              rows={2}
              value={draft.arabic}
              onChange={(e) => update({ arabic: e.target.value })}
              className="mt-1 w-full rounded-xl border-2 border-line p-2 font-ar text-xl font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="text-sm font-bold">
            The word as it appears in the sentence
            <input
              lang="ar"
              dir="rtl"
              value={draft.answer}
              onChange={(e) => update({ answer: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border-2 border-line px-2 font-ar text-lg font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="text-sm font-bold">
            Arabizi
            <input
              value={draft.arabizi}
              onChange={(e) => update({ arabizi: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border-2 border-line px-2 font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="text-sm font-bold">
            English
            <input
              value={draft.english}
              onChange={(e) => update({ english: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border-2 border-line px-2 font-normal outline-none focus:border-brand"
            />
          </label>
          <div className="rounded-xl bg-brand-soft p-3 text-sm">
            <b>Fill-in-the-blank preview:</b>{" "}
            {cloze ? <Ar className="text-lg">{cloze}</Ar> : <span className="font-semibold text-brand">the word above must appear in the sentence as a separate word.</span>}
            {!answerOk && <div className="mt-1 font-semibold text-brand">The word should be one of: {word.alternatives.join(" / ")}</div>}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="chip"
          disabled={!(entry?.cloze || cloze) || !draft.english.trim()}
          aria-pressed={status === "approved"}
          onClick={() => update({ reviewed: true, rejected: false })}
        >
          ✓ Approve
        </button>
        <button type="button" className="chip" disabled={!entry} aria-pressed={status === "rejected"} onClick={() => update({ reviewed: false, rejected: true })}>
          ✗ Reject
        </button>
        <button type="button" className="chip" onClick={() => setOpen((o) => !o)}>
          ✎ {open ? "Done editing" : "Edit"}
        </button>
        {status !== "todo" && status !== "missing" && (
          <button type="button" className="chip" onClick={() => update({ reviewed: false, rejected: false })}>
            ↺ Back to “to review”
          </button>
        )}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------- page

export default function Teacher() {
  const [unlocked, setUnlocked] = useState(import.meta.env.DEV || sessionFlag());
  const [drafts, setDrafts] = useState<ExamplesFile>(() => load<ExamplesFile>(DRAFTS, {}));
  const [level, setLevel] = useState<Level>("beginner");
  const [unitId, setUnitId] = useState("all");
  const [filter, setFilter] = useState<Status | "all">("todo");
  const [message, setMessage] = useState("");

  const merged = useMemo(() => ({ ...EXAMPLES, ...drafts }), [drafts]);
  const data = LEVELS.find((l) => l.level === level)!;
  const levelWords = data.words;
  const unitWords = unitId === "all" ? levelWords : levelWords.filter((w) => w.unitId === unitId);
  const shown = unitWords.filter((w) => filter === "all" || statusOf(merged[w.id]) === filter);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { todo: 0, approved: 0, rejected: 0, missing: 0 };
    for (const w of unitWords) c[statusOf(merged[w.id])]++;
    return c;
  }, [unitWords, merged]);

  if (!unlocked) return <Login onOk={() => setUnlocked(true)} />;

  const changedCount = Object.keys(drafts).length;

  function change(id: string, entry: ExampleEntry | null) {
    const next = { ...drafts };
    if (entry) next[id] = entry;
    else delete next[id];
    setDrafts(next);
    save(DRAFTS, next);
  }

  function exportFile() {
    const all = Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)));
    const blob = new Blob([JSON.stringify(all, null, 1) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "examples.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage("Downloaded examples.json. Send it to Oula (or put it in vocab/src/data/) to publish the changes.");
  }

  async function importFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const incoming = JSON.parse(await file.text()) as ExamplesFile;
      const known = new Set(LEVELS.flatMap((l) => l.words.map((w) => w.id)));
      const next = { ...drafts };
      let n = 0;
      for (const [id, entry] of Object.entries(incoming)) {
        if (!known.has(id) || typeof entry?.arabic !== "string") continue;
        if (JSON.stringify(EXAMPLES[id]) !== JSON.stringify(entry)) {
          next[id] = { ...entry, cloze: makeCloze(entry.arabic, entry.answer) ?? "" };
          n++;
        }
      }
      setDrafts(next);
      save(DRAFTS, next);
      setMessage(`Imported ${n} changed sentence${n === 1 ? "" : "s"}.`);
    } catch {
      setMessage("That file isn’t an examples.json export.");
    }
  }

  return (
    <Layout back={{ to: "/", label: "home" }} wide>
      <h1 className="text-3xl font-extrabold">Review example sentences</h1>
      <p className="mt-1 text-muted">
        Students only see sentences you <b>approve</b>. Your changes are kept in this browser until you export them.
      </p>

      <div className="card mt-5 flex flex-wrap items-center gap-3 p-4">
        <span className="font-bold">{changedCount} change{changedCount === 1 ? "" : "s"} not published yet</span>
        <span className="flex-1" />
        <button type="button" className="btn-primary" onClick={exportFile}>
          ⬇ Export examples.json
        </button>
        <label className="btn-ghost cursor-pointer">
          ⬆ Import
          <input type="file" accept="application/json,.json" className="sr-only" onChange={importFile} />
        </label>
        {changedCount > 0 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (confirm("Throw away all your changes in this browser?")) {
                setDrafts({});
                save(DRAFTS, {});
              }
            }}
          >
            Discard changes
          </button>
        )}
        {message && <p className="w-full text-sm font-semibold text-good">{message}</p>}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value as Level);
            setUnitId("all");
          }}
          className="h-12 rounded-2xl border-2 border-line px-3 font-semibold"
          aria-label="Level"
        >
          {LEVELS.map((l) => (
            <option key={l.level} value={l.level}>
              {l.title}
            </option>
          ))}
        </select>
        <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="h-12 max-w-full rounded-2xl border-2 border-line px-3 font-semibold" aria-label="Unit">
          <option value="all">All units</option>
          {data.units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.order}. {u.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["todo", "approved", "rejected", "missing", "all"] as const).map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {STATUS_LABEL[s]} ({s === "all" ? unitWords.length : counts[s]})
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-3">
        {shown.map((w) => (
          <SentenceEditor key={w.id} word={w} entry={merged[w.id]} onChange={(e) => change(w.id, e)} />
        ))}
      </ul>
      {!shown.length && <p className="mt-6 text-center text-muted">Nothing here.</p>}

      <div className="mt-8 rounded-2xl bg-brand-soft p-4 text-sm">
        <b>When you’re done:</b> press <b>Export examples.json</b> and send the file to Oula. It replaces{" "}
        <code>vocab/src/data/examples.json</code>, and the approved sentences appear for students after the next
        deploy. Several teachers can work at once: each exports, and the files are imported one after another here.
      </div>
    </Layout>
  );
}
