import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { GenderBadge, ProgressBar, SpeakButton, StarButton } from "../components/WordBits";
import { getLevel, getUnit, wordsOf } from "../lib/data";
import { masteredShare, useProgress } from "../lib/progress";
import { setSettings, useSettings } from "../lib/settings";
import NotFound from "./NotFound";

const MODES = [
  { path: "flashcards", icon: "🗂️", title: "Flashcards", text: "Flip, listen, and sort the words you know." },
  { path: "write", icon: "✍️", title: "Listen & write", text: "Hear the word (or read the English) and type it." },
  { path: "quiz", icon: "✅", title: "Quiz", text: "10, 20 or all words — a mix of question types." },
];

function CopyLink() {
  const [copied, setCopied] = useState<"yes" | "no" | null>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied("yes");
    } catch {
      setCopied("no");
    }
    setTimeout(() => setCopied(null), 2500);
  }
  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={copy} className="btn-ghost">
        🔗 {copied === "yes" ? "Link copied!" : "Copy link"}
      </button>
      {copied === "no" && <span className="mt-1 break-all text-xs text-muted">{window.location.href}</span>}
    </span>
  );
}

export default function UnitPage() {
  const params = useParams();
  const data = getLevel(params.level);
  const unit = data && getUnit(data, params.unit);
  const progress = useProgress();
  const settings = useSettings();
  if (!data || !unit) return <NotFound />;

  const words = wordsOf(data, unit);
  const starredCount = words.filter((w) => progress.starred.includes(w.id)).length;
  const base = `/${data.level}/${unit.slug}`;

  return (
    <Layout back={{ to: `/${data.level}`, label: data.title }}>
      <p className="text-sm font-bold text-brand">{data.title}</p>
      {unit.titleIsArabic ? (
        <h1>
          <Ar className="block text-3xl font-bold">{unit.title}</Ar>
        </h1>
      ) : (
        <h1 className="text-3xl font-extrabold">{unit.title}</h1>
      )}
      <p className="mt-1 text-muted">
        {words.length} words{starredCount ? ` · ${starredCount} starred` : ""}
      </p>
      <div className="mt-3">
        <ProgressBar value={masteredShare(progress, words.map((w) => w.id))} label="Words you know" />
      </div>

      <ul className="mt-6 grid gap-3">
        {MODES.map((m, i) => (
          <li key={m.path}>
            <Link
              to={`${base}/${m.path}`}
              className={`card flex items-center gap-4 p-4 hover:bg-brand-soft ${i === 0 ? "border-brand" : "hover:border-brand"}`}
            >
              <span className="text-3xl" aria-hidden>
                {m.icon}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-extrabold">{m.title}</span>
                <span className="text-sm text-muted">{m.text}</span>
              </span>
              <span className="text-2xl text-brand" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyLink />
      </div>

      <div className="mt-8 flex items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold">Words</h2>
        <button
          type="button"
          className="chip"
          aria-pressed={settings.showArabizi}
          onClick={() => setSettings({ showArabizi: !settings.showArabizi })}
        >
          Arabizi {settings.showArabizi ? "on" : "off"}
        </button>
      </div>

      <ul className="mt-3 divide-y divide-line rounded-3xl border-2 border-line">
        {words.map((w) => (
          <li key={w.id} className="flex items-center gap-2 px-3 py-3">
            <StarButton word={w} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{w.english}</span>
                <GenderBadge gender={w.gender} />
              </div>
              {settings.showArabizi && <div className="text-sm text-muted">{w.arabiziAlternatives.join(" / ")}</div>}
            </div>
            <Ar className="text-right text-2xl font-semibold">{w.display}</Ar>
            <SpeakButton word={w} />
          </li>
        ))}
      </ul>
    </Layout>
  );
}
