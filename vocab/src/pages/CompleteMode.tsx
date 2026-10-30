import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { ClozeQuestion } from "../components/Questions";
import RoundSummary from "../components/RoundSummary";
import { buildOptions } from "../lib/distractors";
import { approvedExample } from "../lib/examples";
import { recordAnswer } from "../lib/progress";
import { shuffled } from "../lib/random";
import { useUnit } from "../lib/useUnit";
import type { Word } from "../types";
import NotFound from "./NotFound";

interface Item {
  word: Word;
  options: Word[];
}

export default function CompleteMode() {
  const { data, unit, words, base } = useUnit();
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<Word[]>([]);

  const start = useCallback(
    (list: Word[]) => {
      const usable = shuffled(list.filter((w) => approvedExample(w)));
      setItems(usable.map((w) => ({ word: w, options: buildOptions(w, data?.words ?? []) })).filter((i) => i.options.length === 4));
      setIndex(0);
      setRight(0);
      setMissed([]);
    },
    [data],
  );

  useEffect(() => start(words), [words, start]);

  if (!data || !unit) return <NotFound />;
  const item = items[index];
  const done = items.length > 0 && index >= items.length;

  function onDone(correct: boolean) {
    recordAnswer(item.word.id, correct);
    if (correct) setRight((n) => n + 1);
    else setMissed((m) => [...m, item.word]);
    setIndex((i) => i + 1);
  }

  return (
    <Layout back={{ to: base, label: unit.title }}>
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="truncate text-xl font-extrabold">
          Complete the sentence · {unit.titleIsArabic ? <Ar className="font-semibold">{unit.title}</Ar> : unit.title}
        </h1>
        {item && !done && (
          <span className="shrink-0 font-bold text-muted">
            {index + 1} / {items.length}
          </span>
        )}
      </div>

      {items.length === 0 && (
        <div className="card mt-6 p-6 text-center">
          <p className="font-bold">No example sentences here yet.</p>
          <p className="mt-1 text-muted">Your teachers are still checking them. Try flashcards or the quiz for now.</p>
          <Link to={base} className="btn-primary mt-4">
            Back to the unit
          </Link>
        </div>
      )}

      {item && !done && (
        <>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand transition-all" style={{ width: `${(index / items.length) * 100}%` }} />
          </div>
          <div className="mt-5">
            <ClozeQuestion key={`${item.word.id}-${index}`} word={item.word} example={approvedExample(item.word)!} options={item.options} onDone={onDone} />
          </div>
        </>
      )}

      {done && (
        <RoundSummary right={right} total={items.length} missed={missed} onRetryMissed={() => start(missed)} onRestart={() => start(words)} backTo={base} />
      )}
    </Layout>
  );
}
