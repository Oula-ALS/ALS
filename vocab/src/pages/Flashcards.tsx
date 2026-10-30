import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { GenderBadge, SpeakButton, StarButton } from "../components/WordBits";
import { hasRecording } from "../lib/audio";
import { getLevel, getUnit, wordsOf } from "../lib/data";
import { recordAnswer, useProgress } from "../lib/progress";
import { setSettings, useSettings } from "../lib/settings";
import type { Word } from "../types";
import NotFound from "./NotFound";

const SWIPE = 90; // px needed to count as a swipe

function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function arabicSize(text: string) {
  return text.length > 22 ? "text-3xl" : text.length > 12 ? "text-4xl" : "text-5xl";
}

export default function Flashcards() {
  const params = useParams();
  const data = getLevel(params.level);
  const unit = data && getUnit(data, params.unit);
  const progress = useProgress();
  const settings = useSettings();

  const [arabicFirst, setArabicFirst] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [deck, setDeck] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learning, setLearning] = useState<Word[]>([]);
  const [known, setKnown] = useState(0);
  const [dx, setDx] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);

  const allWords = useMemo(() => (data && unit ? wordsOf(data, unit) : []), [data, unit]);
  const starredIds = progress.starred;

  const start = useCallback(
    (words: Word[]) => {
      setDeck(shuffle ? shuffled(words) : words);
      setIndex(0);
      setFlipped(false);
      setLearning([]);
      setKnown(0);
    },
    [shuffle],
  );

  // Restart when the options change (not when a star is toggled mid-session).
  useEffect(() => {
    start(starredOnly ? allWords.filter((w) => starredIds.includes(w.id)) : allWords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, shuffle, starredOnly, start]);

  const word = deck[index];
  const done = deck.length > 0 && index >= deck.length;

  const answer = useCallback(
    (knewIt: boolean) => {
      if (!word) return;
      recordAnswer(word.id, knewIt);
      if (knewIt) setKnown((n) => n + 1);
      else setLearning((l) => [...l, word]);
      setFlipped(false);
      setDx(0);
      setIndex((i) => i + 1);
    },
    [word],
  );

  // Keyboard: Space = flip, → = I know it, ← = still learning.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select")) return;
      if (e.key === " " && !(t.closest("button, a") && !t.closest("[data-card]"))) {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") answer(true);
      else if (e.key === "ArrowLeft") answer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer]);

  if (!data || !unit) return <NotFound />;

  // ----- swipe -----
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { x: e.clientX, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === e.pointerId) setDx(e.clientX - drag.current.x);
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== e.pointerId) return;
    const moved = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(moved) > SWIPE) answer(moved > 0);
    else {
      if (Math.abs(moved) < 8) setFlipped((f) => !f);
      setDx(0);
    }
  }

  const base = `/${data.level}/${unit.slug}`;
  const starredInUnit = allWords.filter((w) => starredIds.includes(w.id)).length;
  const usesComputerVoice = allWords.some((w) => !hasRecording(w));

  const front = (w: Word) =>
    arabicFirst ? (
      <ArabicSide w={w} />
    ) : (
      <EnglishSide w={w} />
    );
  const back = (w: Word) =>
    arabicFirst ? (
      <EnglishSide w={w} withArabizi={settings.showArabizi} />
    ) : (
      <ArabicSide w={w} withArabizi={settings.showArabizi} />
    );

  return (
    <Layout back={{ to: base, label: unit.title }}>
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="truncate text-xl font-extrabold">
          Flashcards ·{" "}
          {unit.titleIsArabic ? <Ar className="font-semibold">{unit.title}</Ar> : <span>{unit.title}</span>}
        </h1>
        {deck.length > 0 && !done && (
          <span className="shrink-0 font-bold text-muted">
            {index + 1} / {deck.length}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="chip" onClick={() => setArabicFirst((v) => !v)}>
          ⇄ {arabicFirst ? "Arabic first" : "English first"}
        </button>
        <button type="button" className="chip" aria-pressed={shuffle} onClick={() => setShuffle((v) => !v)}>
          🔀 Shuffle
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={starredOnly}
          disabled={!starredInUnit && !starredOnly}
          onClick={() => setStarredOnly((v) => !v)}
          title={starredInUnit ? undefined : "Star words first (☆)"}
        >
          ★ Starred only ({starredInUnit})
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={settings.showArabizi}
          onClick={() => setSettings({ showArabizi: !settings.showArabizi })}
        >
          Arabizi
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={settings.rate === 0.75}
          onClick={() => setSettings({ rate: settings.rate === 1 ? 0.75 : 1 })}
        >
          🐢 Slow audio
        </button>
      </div>

      {deck.length > 0 && !done && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand transition-all" style={{ width: `${(index / deck.length) * 100}%` }} />
        </div>
      )}

      {deck.length === 0 && (
        <div className="card mt-6 p-6 text-center">
          <p className="font-bold">No starred words here yet.</p>
          <p className="mt-1 text-muted">Tap ☆ on a card or in the word list to star it.</p>
          <button type="button" className="btn-primary mt-4" onClick={() => setStarredOnly(false)}>
            Show all words
          </button>
        </div>
      )}

      {word && !done && (
        <>
          <div
            data-card
            key={`${word.id}-${index}`}
            role="button"
            tabIndex={0}
            aria-label={flipped ? "Card back. Press Space to flip." : "Card front. Press Space to flip."}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              drag.current = null;
              setDx(0);
            }}
            className="relative mt-5 h-80 cursor-pointer touch-pan-y select-none sm:h-96"
            style={{
              perspective: "1200px",
              transform: `translateX(${dx}px) rotate(${dx / 25}deg)`,
              transition: drag.current ? "none" : "transform 0.2s",
            }}
          >
            <div
              className="absolute inset-0 transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
            >
              <Face>{front(word)}</Face>
              <Face backSide>{back(word)}</Face>
            </div>
            <div className="absolute right-2 top-2 z-10">
              <StarButton word={word} />
            </div>
            {Math.abs(dx) > 30 && (
              <div
                className={`pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full px-4 py-1 font-extrabold text-white ${dx > 0 ? "bg-good" : "bg-brand"}`}
              >
                {dx > 0 ? "I know it ✓" : "Still learning"}
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" className="btn-ghost min-h-14" onClick={() => answer(false)}>
              ← Still learning
            </button>
            <button type="button" className="btn min-h-14 bg-good text-white hover:opacity-90" onClick={() => answer(true)}>
              I know it →
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-muted">
            Tap the card to flip. Swipe right if you know it, left if you’re still learning.
            <span className="hidden sm:inline"> Keyboard: Space, ← and →.</span>
          </p>
        </>
      )}

      {done && (
        <div className="card mt-6 p-6 text-center">
          <div className="text-5xl" aria-hidden>
            {learning.length === 0 ? "🎉" : "💪"}
          </div>
          <h2 className="mt-2 text-2xl font-extrabold">
            {learning.length === 0 ? "You knew them all!" : "Round finished"}
          </h2>
          <p className="mt-1 text-muted">
            You knew {known} of {deck.length}.{learning.length > 0 && ` ${learning.length} to keep practising.`}
          </p>
          <div className="mt-5 grid gap-3">
            {learning.length > 0 && (
              <button type="button" className="btn-primary" onClick={() => start(learning)}>
                Practise the {learning.length} I’m still learning
              </button>
            )}
            <button
              type="button"
              className="btn-ghost"
              onClick={() => start(starredOnly ? allWords.filter((w) => starredIds.includes(w.id)) : allWords)}
            >
              Start again
            </button>
            <Link to={base} className="btn-ghost">
              Back to the unit
            </Link>
          </div>
        </div>
      )}

      {usesComputerVoice && (
        <div className="mt-8 rounded-2xl bg-brand-soft p-4 text-sm">
          <b>About the 🔊 sound:</b>{" "}
          {settings.computerVoice
            ? "words without an Alsama recording use your phone’s computer voice. It may sound like formal Arabic, not Lebanese — always trust your teacher."
            : "the computer voice is off, so only Alsama recordings play."}
          <button
            type="button"
            className="ml-1 font-bold text-brand underline"
            onClick={() => setSettings({ computerVoice: !settings.computerVoice })}
          >
            {settings.computerVoice ? "Turn computer voice off" : "Turn computer voice on"}
          </button>
        </div>
      )}
    </Layout>
  );
}

function Face({ children, backSide }: { children: ReactNode; backSide?: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 p-6 text-center shadow-sm ${backSide ? "border-brand bg-brand-soft" : "border-line bg-white"}`}
      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: backSide ? "rotateY(180deg)" : undefined }}
    >
      {children}
    </div>
  );
}

function ArabicSide({ w, withArabizi }: { w: Word; withArabizi?: boolean }) {
  return (
    <>
      <Ar className={`block font-bold leading-snug text-ink ${arabicSize(w.display)}`}>{w.display}</Ar>
      {withArabizi && <div className="text-lg text-muted">{w.arabiziAlternatives.join(" / ")}</div>}
      <SpeakButton word={w} big />
    </>
  );
}

function EnglishSide({ w, withArabizi }: { w: Word; withArabizi?: boolean }) {
  return (
    <>
      <div className="text-3xl font-extrabold text-ink">{w.english}</div>
      <div className="flex items-center gap-2">
        <GenderBadge gender={w.gender} />
        <span className="text-sm font-semibold text-muted">{w.pos}</span>
      </div>
      {withArabizi && <div className="text-lg text-muted">{w.arabiziAlternatives.join(" / ")}</div>}
    </>
  );
}
