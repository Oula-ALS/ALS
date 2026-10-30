import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { GenderBadge, SpeakButton, StarButton } from "../components/WordBits";
import { LEVELS } from "../lib/data";
import { searchWords } from "../lib/search";
import { useSettings } from "../lib/settings";

const ALL = LEVELS.flatMap((l) => l.words);
const LEVEL_TITLE = Object.fromEntries(LEVELS.map((l) => [l.level, l.title]));
const UNIT_SLUG = Object.fromEntries(LEVELS.flatMap((l) => l.units.map((u) => [u.id, u.slug])));

export default function Search() {
  const [params, setParams] = useSearchParams();
  const settings = useSettings();
  const q = params.get("q") ?? "";
  const results = useMemo(() => searchWords(ALL, q), [q]);

  return (
    <Layout back={{ to: "/", label: "home" }}>
      <h1 className="text-3xl font-extrabold">Search words</h1>
      <p className="mt-1 text-muted">Type in Arabic, Arabizi or English.</p>
      <input
        type="search"
        value={q}
        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
        placeholder="e.g. مرحبا · marhaba · hello"
        aria-label="Search words"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        className="mt-4 h-14 w-full rounded-2xl border-2 border-line bg-surface px-4 text-lg outline-none focus:border-brand"
      />

      {q.trim() && (
        <p className="mt-4 text-sm font-semibold text-muted" role="status">
          {results.length === 0 ? "No words found." : results.length >= 60 ? "Showing the first 60 words." : `${results.length} word${results.length === 1 ? "" : "s"}`}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-line rounded-3xl border-2 border-line">
          {results.map((w) => (
            <li key={w.id} className="flex items-center gap-2 px-3 py-3">
              <StarButton word={w} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{w.english}</span>
                  <GenderBadge gender={w.gender} />
                </div>
                {settings.showArabizi && <div className="text-sm text-muted">{w.arabiziAlternatives.join(" / ")}</div>}
                <Link to={`/${w.level}/${UNIT_SLUG[w.unitId]}`} className="text-xs font-bold text-brand hover:underline">
                  {LEVEL_TITLE[w.level]} · {w.unitTitle}
                </Link>
              </div>
              <Ar className="text-right text-2xl font-semibold">{w.display}</Ar>
              <SpeakButton word={w} />
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
