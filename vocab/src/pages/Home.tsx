import { Link } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { ProgressBar } from "../components/WordBits";
import { LEVEL_INFO, LEVELS } from "../lib/data";
import { masteredShare, useProgress } from "../lib/progress";
import { useStudent } from "../lib/student";

export default function Home() {
  const student = useStudent();
  const progress = useProgress();
  // The student's own book first.
  const levels = [...LEVELS].sort((a, b) => Number(b.level === student?.level) - Number(a.level === student?.level));

  return (
    <Layout>
      <p className="text-muted">
        <Ar className="text-xl font-semibold text-brand">مرحبا</Ar>
      </p>
      <h1 className="text-3xl font-extrabold">Hi {student?.name} 👋</h1>
      <p className="mt-1 text-muted">Choose your book to start.</p>

      <div className="mt-6 space-y-4">
        {levels.map((l) => {
          const mine = l.level === student?.level;
          return (
            <Link
              key={l.level}
              to={`/${l.level}`}
              className={`card block p-5 transition hover:border-brand ${mine ? "border-brand" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {mine && <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-brand">Your book</div>}
                  <h2 className="text-xl font-extrabold">{l.title}</h2>
                  <p className="text-sm text-muted">{LEVEL_INFO[l.level].blurb}</p>
                </div>
                <Ar className="text-2xl font-bold text-brand">{LEVEL_INFO[l.level].arabic}</Ar>
              </div>
              <p className="mt-3 text-sm font-semibold text-muted">
                {l.units.length} {l.level === "advanced" ? "topics" : "units"} · {l.words.length} words
              </p>
              <div className="mt-2">
                <ProgressBar value={masteredShare(progress, l.words.map((w) => w.id))} label="Words you know" />
              </div>
            </Link>
          );
        })}
      </div>

      <img
        src="/images/students-walking-books.jpg"
        alt="Alsama students walking together carrying their books"
        className="mt-10 aspect-[16/7] w-full rounded-3xl object-cover"
      />
      <p className="mt-3 text-center text-sm text-muted">Alsama Language School · part of the Alsama Project</p>
    </Layout>
  );
}
