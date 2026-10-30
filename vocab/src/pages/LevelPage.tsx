import { Link, useParams } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { ProgressBar } from "../components/WordBits";
import { getLevel, wordsOf } from "../lib/data";
import { masteredShare, useProgress } from "../lib/progress";
import NotFound from "./NotFound";

export default function LevelPage() {
  const data = getLevel(useParams().level);
  const progress = useProgress();
  if (!data) return <NotFound />;
  const unitWord = data.level === "advanced" ? "Topic" : "Unit";

  return (
    <Layout back={{ to: "/", label: "home" }}>
      <h1 className="text-3xl font-extrabold">{data.title}</h1>
      <p className="mt-1 text-muted">
        {data.units.length} {unitWord.toLowerCase()}s · {data.words.length} words
      </p>

      <Link to={`/${data.level}/all`} className="btn-ghost mt-5 w-full">
        Study the whole level ({data.words.length} words)
      </Link>

      <ol className="mt-5 space-y-3">
        {data.units.map((u) => (
          <li key={u.id}>
            <Link to={`/${data.level}/${u.slug}`} className="card flex items-center gap-4 p-4 transition hover:border-brand">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-lg font-extrabold text-brand">
                {u.order}
              </span>
              <div className="min-w-0 flex-1">
                {u.titleIsArabic ? (
                  <Ar className="block text-lg font-semibold">{u.title}</Ar>
                ) : (
                  <div className="text-lg font-bold">{u.title}</div>
                )}
                <div className="text-sm text-muted">{u.wordCount} words</div>
                <div className="mt-1">
                  <ProgressBar value={masteredShare(progress, wordsOf(data, u).map((w) => w.id))} label="Words you know" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </Layout>
  );
}
