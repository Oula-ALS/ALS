"use client";

import { useState } from "react";
import { ArabicStack } from "@/components/ArabicStack";
import { GameResult } from "@/components/GameResult";
import { ListenButton } from "@/components/ListenButton";
import type { LevelId, Word } from "@/lib/content/types";
import { generateQuiz, type Question } from "@/lib/games/quiz";
import { correctAnswerXp, quizStars, XP } from "@/lib/games/scoring";
import { addXp, recordStars, unitKey } from "@/lib/progress";
import { playError, playFanfare, playSuccess } from "@/lib/sfx";
import { useHydrated } from "@/lib/use-hydrated";

type Props = { level: LevelId; unitId: string; words: Word[] };

export function Quiz(props: Props) {
  const hydrated = useHydrated();
  const [round, setRound] = useState(0);
  if (!hydrated) return null; // questions are random, so build them in the browser
  if (props.words.length < 2) return <p className="text-muted">This unit needs at least 2 words for a quiz.</p>;
  return <QuizRound key={round} {...props} onRestart={() => setRound((r) => r + 1)} />;
}

function QuizRound({ level, unitId, words, onRestart }: Props & { onRestart: () => void }) {
  const [questions] = useState<Question[]>(() => generateQuiz(words));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<{ stars: number; newBest: boolean } | null>(null);

  if (result) {
    return (
      <GameResult
        stars={result.stars}
        summary={`${correct} out of ${questions.length} correct`}
        xpEarned={xp}
        newBest={result.newBest}
        onAgain={onRestart}
        backHref={`/words/${level}/${unitId}`}
      />
    );
  }

  const q = questions[index];
  const answered = chosen !== null;
  const isRight = chosen === q.answerIndex;

  function choose(i: number) {
    if (answered) return;
    setChosen(i);
    if (i === q.answerIndex) {
      const gained = correctAnswerXp(combo + 1);
      setCombo((c) => c + 1);
      setCorrect((c) => c + 1);
      setXp((x) => x + gained);
      addXp(gained);
      playSuccess();
    } else {
      setCombo(0);
      playError();
    }
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setChosen(null);
      return;
    }
    const stars = quizStars(correct, questions.length);
    const bonus = stars * XP.perStar;
    if (bonus) addXp(bonus);
    setXp((x) => x + bonus);
    const newBest = recordStars(unitKey(level, unitId), stars);
    if (stars >= 2) playFanfare();
    setResult({ stars, newBest });
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span aria-live="polite">{combo >= 2 ? `🔥 Combo ×${combo}` : `✨ ${xp} XP`}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky/30" aria-hidden="true">
        <div className="h-full bg-orange" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <section className="mt-5 rounded-3xl bg-surface p-6 text-center shadow-md">
        {q.direction === "ar-en" ? (
          <>
            <p className="text-sm text-muted">What does this mean?</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <ArabicStack ar={q.word.ar} size="lg" />
              <ListenButton text={q.word.ar} id={q.word.id} />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">How do you say this in Arabic?</p>
            <p className="mt-2 font-display text-3xl font-bold text-heading">{q.word.en}</p>
          </>
        )}
      </section>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const state = !answered ? "" : i === q.answerIndex ? "right" : i === chosen ? "wrong" : "dim";
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                data-state={state}
                className="w-full rounded-2xl border-2 border-sky/60 bg-surface px-4 py-3 hover:border-orange data-[state=dim]:opacity-50 data-[state=right]:border-success data-[state=right]:bg-success/15 data-[state=wrong]:border-error data-[state=wrong]:bg-error/10"
              >
                {q.direction === "ar-en" ? (
                  <span className="text-lg">{o.en}</span>
                ) : (
                  <ArabicStack ar={o.ar} chat={o.chat} />
                )}
                {state === "right" && <span className="sr-only"> (correct answer)</span>}
                {state === "wrong" && <span className="sr-only"> (your answer, wrong)</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div role="status" className={`mt-4 rounded-2xl p-4 ${isRight ? "bg-success/15" : "bg-error/10"}`}>
          <p className={`font-bold ${isRight ? "text-success" : "text-error"}`}>
            {isRight ? "✓ Correct!" : "✗ Not quite."}
          </p>
          <p className="mt-1">
            <span lang="ar" dir="rtl" className="font-display text-xl font-bold">
              {q.word.ar}
            </span>{" "}
            · {q.word.chat} · <strong>{q.word.en}</strong>
            {q.word.pos && <span className="text-sm text-muted"> ({q.word.pos})</span>}
          </p>
          <button type="button" onClick={next} autoFocus className="mt-3 rounded-full bg-plum px-6 py-2 font-bold text-white dark:bg-orange dark:text-plum">
            {index + 1 < questions.length ? "Next" : "See my score"}
          </button>
        </div>
      )}
    </div>
  );
}
