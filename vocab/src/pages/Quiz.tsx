import { useState } from "react";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { ChoiceQuestion, WriteQuestion } from "../components/Questions";
import RoundSummary from "../components/RoundSummary";
import { buildOptions } from "../lib/distractors";
import { recordAnswer } from "../lib/progress";
import { shuffled } from "../lib/random";
import { setSettings, useSettings } from "../lib/settings";
import { useUnit } from "../lib/useUnit";
import type { Word } from "../types";
import NotFound from "./NotFound";

type Question =
  | { kind: "choose-english"; word: Word; options: Word[] }
  | { kind: "choose-arabic"; word: Word; options: Word[] }
  | { kind: "write"; word: Word };

const KINDS = ["choose-english", "choose-arabic", "write"] as const;

/** A mix of question types. Multiple choice falls back to writing if there aren't 3 good wrong options. */
function makeQuiz(words: Word[], levelWords: Word[]): Question[] {
  return words.map((word, i) => {
    const kind = KINDS[(i + Math.floor(Math.random() * 3)) % 3];
    if (kind === "write") return { kind, word };
    const options = buildOptions(word, levelWords);
    return options.length === 4 ? { kind, word, options } : { kind: "write", word };
  });
}

export default function Quiz() {
  const { data, unit, words, base } = useUnit();
  const settings = useSettings();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [lastSize, setLastSize] = useState(0);
  const [index, setIndex] = useState(0);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<Word[]>([]);

  if (!data || !unit) return <NotFound />;

  function start(list: Word[]) {
    setQuestions(makeQuiz(list, data!.words));
    setIndex(0);
    setRight(0);
    setMissed([]);
  }
  function newQuiz(size: number) {
    setLastSize(size);
    start(shuffled(words).slice(0, size));
  }

  const q = questions?.[index];
  const done = questions && index >= questions.length;

  function onDone(correct: boolean) {
    if (!q) return;
    recordAnswer(q.word.id, correct);
    if (correct) setRight((n) => n + 1);
    else setMissed((m) => [...m, q.word]);
    setIndex((i) => i + 1);
  }

  const sizes = [10, 20].filter((n) => n < words.length);

  return (
    <Layout back={{ to: base, label: unit.title }}>
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="truncate text-xl font-extrabold">
          Quiz · {unit.titleIsArabic ? <Ar className="font-semibold">{unit.title}</Ar> : unit.title}
        </h1>
        {q && !done && (
          <span className="shrink-0 font-bold text-muted">
            {index + 1} / {questions.length}
          </span>
        )}
      </div>

      {!questions && (
        <div className="card mt-5 p-6">
          <h2 className="text-xl font-extrabold">How many questions?</h2>
          <p className="mt-1 text-muted">A mix of choosing the meaning, choosing the Arabic, and writing the word.</p>
          <div className="mt-4 grid gap-3">
            {sizes.map((n) => (
              <button key={n} type="button" className="btn-ghost" onClick={() => newQuiz(n)}>
                {n} questions
              </button>
            ))}
            <button type="button" className="btn-primary" onClick={() => newQuiz(words.length)}>
              All {words.length} words
            </button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-muted">For writing questions I type:</span>
            <button type="button" className="chip" aria-pressed={settings.typeIn === "arabic"} onClick={() => setSettings({ typeIn: "arabic" })}>
              Arabic
            </button>
            <button type="button" className="chip" aria-pressed={settings.typeIn === "arabizi"} onClick={() => setSettings({ typeIn: "arabizi" })}>
              Arabizi
            </button>
          </div>
        </div>
      )}

      {q && !done && (
        <>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <div className="mt-5">
            {q.kind === "write" ? (
              <WriteQuestion key={index} word={q.word} prompt="english" typeIn={settings.typeIn} onDone={onDone} />
            ) : (
              <ChoiceQuestion
                key={index}
                word={q.word}
                options={q.options}
                show={q.kind === "choose-english" ? "arabic" : "english"}
                onDone={onDone}
              />
            )}
          </div>
        </>
      )}

      {done && (
        <RoundSummary
          right={right}
          total={questions.length}
          missed={missed}
          onRetryMissed={() => start(missed)}
          onRestart={() => newQuiz(lastSize)}
          restartLabel="New quiz"
          backTo={base}
        />
      )}
    </Layout>
  );
}
