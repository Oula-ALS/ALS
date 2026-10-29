"use client";

import Link from "next/link";
import { useState } from "react";
import { ArabicStack } from "@/components/ArabicStack";
import { ListenButton } from "@/components/ListenButton";
import type { LevelId, Word } from "@/lib/content/types";
import { shuffle } from "@/lib/games/random";
import { XP } from "@/lib/games/scoring";
import { addXp } from "@/lib/progress";
import { useHydrated } from "@/lib/use-hydrated";

type Props = { level: LevelId; unitId: string; words: Word[] };

export function Flashcards(props: Props) {
  const hydrated = useHydrated();
  const [round, setRound] = useState(0);
  const [arFirst, setArFirst] = useState(true);
  if (!hydrated) return null; // shuffling must happen in the browser
  return (
    <div>
      <div role="group" aria-label="Card side to show first" className="mb-4 flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={arFirst === v}
            onClick={() => setArFirst(v)}
            className="rounded-full bg-peach px-4 py-1.5 text-sm font-medium text-plum aria-pressed:bg-plum aria-pressed:text-white dark:aria-pressed:bg-orange dark:aria-pressed:text-plum"
          >
            {v ? "Arabic first" : "English first"}
          </button>
        ))}
      </div>
      <FlashcardRound key={round} {...props} arFirst={arFirst} onRestart={() => setRound((r) => r + 1)} />
    </div>
  );
}

function FlashcardRound({ level, unitId, words, arFirst, onRestart }: Props & { arFirst: boolean; onRestart: () => void }) {
  const [deck, setDeck] = useState(() => shuffle(words));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const card = deck[0];

  if (!card) {
    return (
      <section className="rounded-3xl bg-yellow p-8 text-center text-plum" aria-live="polite">
        <p lang="ar" dir="rtl" className="font-display text-4xl font-extrabold">
          برافو!
        </p>
        <p className="mt-2 text-lg">You went through all {words.length} cards. +{known * XP.flashcardKnown} XP</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onRestart} className="rounded-full bg-plum px-6 py-3 font-bold text-white">
            Go again
          </button>
          <Link href={`/words/${level}/${unitId}/quiz`} className="rounded-full border-2 border-plum px-6 py-3 font-bold">
            Try the quiz
          </Link>
        </div>
      </section>
    );
  }

  const next = (knewIt: boolean) => {
    if (knewIt) {
      addXp(XP.flashcardKnown);
      setKnown((k) => k + 1);
      setDeck((d) => d.slice(1));
    } else {
      setDeck((d) => [...d.slice(1), d[0]]); // see it again later
    }
    setFlipped(false);
  };

  // The back of the card is yellow, so its text stays dark in dark mode too.
  const arabicSide = <ArabicStack ar={card.ar} chat={card.chat} size="xl" showEn={false} showChat={!arFirst || flipped} onYellow={!arFirst} />;
  const arabicShowing = arFirst !== flipped;
  const englishSide = <p className={`text-center font-display text-3xl font-bold ${arFirst ? "text-plum" : "text-heading"}`}>{card.en}</p>;

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-2 text-center text-sm text-muted" aria-live="polite">
        {deck.length} {deck.length === 1 ? "card" : "cards"} left · {known} known
      </p>
      <div className="flip-card">
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Card back. Press to flip to the front." : "Card front. Press to flip and see the answer."}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          className={`flip-inner relative h-72 cursor-pointer ${flipped ? "is-flipped" : ""}`}
        >
          <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-sky bg-surface p-6 shadow-md" aria-hidden={flipped}>
            {arFirst ? arabicSide : englishSide}
            <span className="absolute bottom-3 text-xs text-muted">Tap to flip</span>
          </div>
          <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-yellow p-6 text-plum shadow-md" aria-hidden={!flipped}>
            {arFirst ? englishSide : arabicSide}
            {card.pos && <span className="mt-2 text-sm">{card.pos}</span>}
          </div>
        </div>
      </div>
      <div className="mt-3 flex h-10 justify-center">
        {arabicShowing && <ListenButton text={card.ar} id={card.id} />}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => next(false)} className="rounded-full border-2 border-plum px-4 py-3 font-bold text-heading dark:border-sky">
          Again
        </button>
        <button type="button" onClick={() => next(true)} className="rounded-full bg-orange px-4 py-3 font-bold text-on-accent">
          I know it ✓
        </button>
      </div>
    </div>
  );
}
