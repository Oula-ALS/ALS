import { Link } from "react-router-dom";
import type { Word } from "../types";
import Ar from "./Ar";

interface Props {
  right: number;
  total: number;
  missed: Word[];
  onRetryMissed: () => void;
  onRestart: () => void;
  restartLabel?: string;
  backTo: string;
}

/** End-of-round screen: score, the words to practise, and what to do next. */
export default function RoundSummary({ right, total, missed, onRetryMissed, onRestart, restartLabel = "Start again", backTo }: Props) {
  const pct = total ? Math.round((right / total) * 100) : 0;
  return (
    <div className="card mt-6 p-6 text-center">
      <div className="text-5xl" aria-hidden>
        {missed.length === 0 ? "🎉" : pct >= 70 ? "👏" : "💪"}
      </div>
      <h2 className="mt-2 text-2xl font-extrabold">{missed.length === 0 ? "All correct!" : "Round finished"}</h2>
      <p className="mt-1 text-4xl font-extrabold text-brand">
        {right} / {total}
      </p>
      <p className="text-muted">{pct}% correct</p>

      {missed.length > 0 && (
        <div className="mt-5 text-left">
          <h3 className="font-bold">Words to practise</h3>
          <ul className="mt-2 divide-y divide-line rounded-2xl border-2 border-line">
            {missed.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-sm">{w.english}</span>
                <Ar className="text-xl font-semibold">{w.display}</Ar>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-3">
        {missed.length > 0 && (
          <button type="button" className="btn-primary" onClick={onRetryMissed}>
            Retry the {missed.length} I missed
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={onRestart}>
          {restartLabel}
        </button>
        <Link to={backTo} className="btn-ghost">
          Back to the unit
        </Link>
      </div>
    </div>
  );
}
