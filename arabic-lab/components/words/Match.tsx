"use client";

import { useEffect, useState } from "react";
import { GameResult } from "@/components/GameResult";
import type { LevelId, Word } from "@/lib/content/types";
import { shuffle } from "@/lib/games/random";
import { MATCH_SECONDS, matchStars, XP } from "@/lib/games/scoring";
import { addXp, recordStars, unitKey } from "@/lib/progress";
import { playError, playFanfare, playSuccess } from "@/lib/sfx";
import { useHydrated } from "@/lib/use-hydrated";

type Props = { level: LevelId; unitId: string; words: Word[] };
const PAIRS = 6;

/** Up to 6 words whose Arabic and English are all different, so every pair is unambiguous. */
function pickPairs(words: Word[]) {
  const out: Word[] = [];
  const seenAr = new Set<string>();
  const seenEn = new Set<string>();
  for (const w of shuffle(words)) {
    const en = w.en.trim().toLowerCase();
    if (seenAr.has(w.ar) || seenEn.has(en)) continue;
    seenAr.add(w.ar);
    seenEn.add(en);
    out.push(w);
    if (out.length === PAIRS) break;
  }
  return out;
}

export function Match(props: Props) {
  const hydrated = useHydrated();
  const [round, setRound] = useState(0);
  if (!hydrated) return null;
  if (props.words.length < 3) return <p className="text-muted">This unit needs at least 3 words for the match game.</p>;
  return <MatchRound key={round} {...props} onRestart={() => setRound((r) => r + 1)} />;
}

function MatchRound({ level, unitId, words, onRestart }: Props & { onRestart: () => void }) {
  const [pairs] = useState(() => pickPairs(words));
  const [arCol] = useState(() => shuffle(pairs));
  const [enCol] = useState(() => shuffle(pairs));
  const [pickAr, setPickAr] = useState<string | null>(null);
  const [pickEn, setPickEn] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [left, setLeft] = useState(MATCH_SECONDS);
  const [result, setResult] = useState<{ stars: number; xp: number; newBest: boolean } | null>(null);

  const finished = done.size === pairs.length;
  const over = finished || left <= 0;

  useEffect(() => {
    if (over) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [over]);

  // Score once, when the round ends (all matched or time ran out).
  useEffect(() => {
    if (!over || result) return;
    const stars = matchStars(finished, left, mistakes);
    const bonus = stars * XP.perStar;
    if (bonus) addXp(bonus);
    const newBest = recordStars(unitKey(level, unitId), stars);
    if (stars >= 2) playFanfare();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time end-of-round summary
    setResult({ stars, xp: done.size * XP.correct + bonus, newBest });
  }, [over, result, finished, left, mistakes, level, unitId, done.size]);

  function tryPair(arId: string | null, enId: string | null) {
    if (!arId || !enId) return;
    if (arId === enId) {
      setDone((d) => new Set(d).add(arId));
      addXp(XP.correct);
      playSuccess();
    } else {
      setMistakes((m) => m + 1);
      setWrong([arId, enId]);
      setTimeout(() => setWrong([]), 500);
      playError();
    }
    setPickAr(null);
    setPickEn(null);
  }

  if (result) {
    return (
      <GameResult
        stars={result.stars}
        summary={
          finished
            ? `All ${pairs.length} pairs in ${MATCH_SECONDS - left}s · ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}`
            : `Time's up! ${done.size} of ${pairs.length} pairs`
        }
        xpEarned={result.xp}
        newBest={result.newBest}
        onAgain={onRestart}
        backHref={`/words/${level}/${unitId}`}
      />
    );
  }

  const tile = (id: string, side: "ar" | "en") => {
    const picked = side === "ar" ? pickAr === id : pickEn === id;
    const state = done.has(id) ? "done" : wrong.includes(id) && (side === "ar" ? wrong[0] === id : wrong[1] === id) ? "wrong" : picked ? "picked" : "";
    return state;
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Tap an Arabic word, then its English meaning.</p>
        <p
          className={`font-display text-2xl font-extrabold tabular-nums ${left <= 15 ? "text-error" : "text-heading"}`}
          aria-label={`${left} seconds left`}
        >
          ⏱️ {left}s
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {done.size} of {pairs.length} pairs matched
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ul className="flex flex-col gap-3" aria-label="Arabic words">
          {arCol.map((w) => {
            const state = tile(w.id, "ar");
            return (
              <li key={w.id}>
                <button
                  type="button"
                  disabled={state === "done"}
                  aria-pressed={state === "picked"}
                  data-state={state}
                  onClick={() => {
                    setPickAr(w.id);
                    tryPair(w.id, pickEn);
                  }}
                  lang="ar"
                  dir="rtl"
                  className={matchTile}
                >
                  {w.ar}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="flex flex-col gap-3" aria-label="English meanings">
          {enCol.map((w) => {
            const state = tile(w.id, "en");
            return (
              <li key={w.id}>
                <button
                  type="button"
                  disabled={state === "done"}
                  aria-pressed={state === "picked"}
                  data-state={state}
                  onClick={() => {
                    setPickEn(w.id);
                    tryPair(pickAr, w.id);
                  }}
                  className={`${matchTile} text-base`}
                >
                  {w.en}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const matchTile =
  "flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-sky/60 bg-surface px-3 py-2 text-xl font-medium transition-colors hover:border-orange " +
  "data-[state=picked]:border-plum data-[state=picked]:bg-yellow data-[state=picked]:text-plum " +
  "data-[state=wrong]:border-error data-[state=wrong]:bg-error/10 " +
  "data-[state=done]:border-success data-[state=done]:bg-success/15 data-[state=done]:opacity-60";
