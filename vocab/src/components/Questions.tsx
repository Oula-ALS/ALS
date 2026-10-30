import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Word } from "../types";
import { checkArabic, checkArabizi } from "../lib/answer";
import { audioSource, playWord } from "../lib/audio";
import { BLANK, splitAround, type ExampleEntry } from "../lib/examples";
import { useSettings } from "../lib/settings";
import Ar from "./Ar";
import { GenderBadge, HighlightedSentence, SpeakButton, SpeakSentence } from "./WordBits";

type Result = "right" | "wrong" | null;

/** Enter (or a Next button) moves on once the answer is shown. */
function useEnterForNext(active: boolean, next: () => void) {
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        next();
      }
    }
    // Wait a moment so the Enter that submitted the answer doesn't also skip it.
    const t = setTimeout(() => window.addEventListener("keydown", onKey), 50);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, next]);
}

function EnglishPrompt({ word }: { word: Word }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-3xl font-extrabold">{word.english}</div>
      <div className="flex items-center gap-2">
        <GenderBadge gender={word.gender} />
        <span className="text-sm font-semibold text-muted">{word.pos}</span>
      </div>
    </div>
  );
}

function CorrectAnswer({ word }: { word: Word }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div>
        <Ar className="block text-3xl font-bold">{word.display}</Ar>
        <div className="text-muted">{word.arabiziAlternatives.join(" / ")}</div>
      </div>
      <SpeakButton word={word} />
    </div>
  );
}

// ---------------------------------------------------------------- typing

interface WriteProps {
  word: Word;
  prompt: "english" | "listen";
  typeIn: "arabic" | "arabizi";
  onDone: (correct: boolean) => void;
}

/** Shows English (or plays the word) and the student types it. */
export function WriteQuestion({ word, prompt, typeIn, onDone }: WriteProps) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const canListen = prompt === "listen" && audioSource(word) !== "none";

  useEffect(() => {
    input.current?.focus();
    if (canListen) playWord(word);
  }, [word, canListen]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (result || !value.trim()) return;
    setResult((typeIn === "arabic" ? checkArabic : checkArabizi)(value, word) ? "right" : "wrong");
  }

  const next = () => onDone(result === "right");
  useEnterForNext(result !== null, next);
  const arabic = typeIn === "arabic";

  return (
    <div>
      <div className="card flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
        {canListen ? (
          <>
            <button
              type="button"
              onClick={() => playWord(word)}
              className="flex size-20 items-center justify-center rounded-full bg-brand text-4xl text-white shadow hover:bg-brand-dark"
              aria-label="Play the word again"
            >
              🔊
            </button>
            {showEnglish || result ? (
              <EnglishPrompt word={word} />
            ) : (
              <button type="button" className="text-sm font-bold text-brand underline" onClick={() => setShowEnglish(true)}>
                Show the English
              </button>
            )}
          </>
        ) : (
          <>
            {prompt === "listen" && <p className="text-xs text-muted">No sound for this word yet, so here is the English.</p>}
            <EnglishPrompt word={word} />
          </>
        )}
      </div>

      <form onSubmit={submit} className="mt-4">
        <label htmlFor="answer" className="block text-sm font-bold text-muted">
          Write it in {arabic ? "Arabic" : "Arabizi (Latin letters, e.g. 3, 7, 2)"}
        </label>
        <input
          id="answer"
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={result !== null}
          lang={arabic ? "ar" : "en"}
          dir={arabic ? "rtl" : "ltr"}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`mt-2 h-16 w-full rounded-2xl border-2 px-4 outline-none focus:border-brand ${arabic ? "font-ar text-3xl" : "text-2xl"} ${
            result === "right" ? "border-good bg-good-soft" : result === "wrong" ? "border-brand bg-brand-soft" : "border-line"
          }`}
        />
        {arabic && !result && (
          <p className="mt-1 text-xs text-muted">No Arabic keyboard? Add one in your phone’s keyboard settings.</p>
        )}
        {!result && (
          <button type="submit" className="btn-primary mt-4 w-full" disabled={!value.trim()}>
            Check
          </button>
        )}
      </form>

      {result && (
        <div className="mt-4" role="status">
          {result === "right" ? (
            <p className="text-center text-xl font-extrabold text-good">✓ Correct!</p>
          ) : (
            <p className="text-center text-xl font-extrabold text-brand">Not quite. The answer is:</p>
          )}
          <div className="mt-2">
            <CorrectAnswer word={word} />
          </div>
          <div className="mt-4 grid gap-2">
            <button type="button" className="btn-primary" onClick={next}>
              Next →
            </button>
            {result === "wrong" && (
              <button type="button" className="btn-ghost" onClick={() => onDone(true)}>
                My answer was right — count it as correct
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- multiple choice

interface ChoiceProps {
  word: Word;
  options: Word[];
  /** "arabic": show Arabic, choose the English. "english": show English, choose the Arabic. */
  show: "arabic" | "english";
  onDone: (correct: boolean) => void;
}

export function ChoiceQuestion({ word, options, show, onDone }: ChoiceProps) {
  const [chosen, setChosen] = useState<Word | null>(null);
  const correct = chosen?.id === word.id;
  const next = () => onDone(correct);
  useEnterForNext(chosen !== null, next);

  // Keys 1–4 choose an option.
  useEffect(() => {
    if (chosen) return;
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) setChosen(options[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chosen, options]);

  return (
    <div>
      <div className="card flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-bold text-muted">{show === "arabic" ? "What does this mean?" : "How do you say this in Arabic?"}</p>
        {show === "arabic" ? (
          <div className="flex items-center gap-3">
            <Ar className="text-4xl font-bold">{word.display}</Ar>
            <SpeakButton word={word} />
          </div>
        ) : (
          <EnglishPrompt word={word} />
        )}
      </div>

      <ul className="mt-4 grid gap-3">
        {options.map((o, i) => {
          const state = !chosen ? "" : o.id === word.id ? "right" : o.id === chosen.id ? "wrong" : "dim";
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={!!chosen}
                onClick={() => setChosen(o)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 py-2 text-left transition ${
                  state === "right"
                    ? "border-good bg-good-soft"
                    : state === "wrong"
                      ? "border-brand bg-brand-soft"
                      : state === "dim"
                        ? "border-line opacity-50"
                        : "border-line hover:border-brand"
                }`}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-line text-sm font-bold text-muted">
                  {state === "right" ? "✓" : state === "wrong" ? "✗" : i + 1}
                </span>
                {show === "arabic" ? (
                  <span className="flex flex-1 flex-wrap items-center gap-2 text-lg font-semibold">
                    {o.english} <GenderBadge gender={o.gender} />
                  </span>
                ) : (
                  <Ar className="flex-1 text-right text-2xl font-semibold">{o.display}</Ar>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {chosen && (
        <div className="mt-4" role="status">
          <p className={`text-center text-xl font-extrabold ${correct ? "text-good" : "text-brand"}`}>
            {correct ? "✓ Correct!" : "Not quite."}
          </p>
          {show === "arabic" ? (
            <p className="mt-1 text-center text-muted">{word.arabiziAlternatives.join(" / ")}</p>
          ) : (
            <div className="mt-2">
              <CorrectAnswer word={word} />
            </div>
          )}
          <button type="button" className="btn-primary mt-4 w-full" onClick={next}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- complete the sentence

interface ClozeProps {
  word: Word;
  example: ExampleEntry;
  /** The right word plus wrong ones (other words of the same POS). */
  options: Word[];
  onDone: (correct: boolean) => void;
}

export function ClozeQuestion({ word, example, options, onDone }: ClozeProps) {
  const settings = useSettings();
  const [chosen, setChosen] = useState<Word | null>(null);
  const correct = chosen?.id === word.id;
  const next = () => onDone(correct);
  useEnterForNext(chosen !== null, next);
  // The English is shown from the start: several words of the same kind could fit the
  // gap grammatically, and the meaning makes only one of them right.
  // The right option shows the word exactly as the sentence uses it.
  const label = (o: Word) => (o.id === word.id ? example.answer : o.arabic);
  const [before, after] = example.cloze.split(BLANK);

  useEffect(() => {
    if (chosen) return;
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) setChosen(options[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chosen, options]);

  return (
    <div>
      <div className="card flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-bold text-muted">Complete the sentence</p>
        {chosen ? (
          <HighlightedSentence {...splitAround(example.arabic, example.answer)} className="text-3xl leading-loose" />
        ) : (
          <Ar className="text-3xl leading-loose">
            {before}
            <span className="mx-1 inline-block min-w-16 border-b-4 border-brand align-baseline">&nbsp;</span>
            {after}
          </Ar>
        )}
        <p className="text-muted">{example.english}</p>
        {chosen && settings.showArabizi && <p className="text-sm text-muted">{example.arabizi}</p>}
        {chosen && <SpeakSentence text={example.arabic} />}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3">
        {options.map((o, i) => {
          const state = !chosen ? "" : o.id === word.id ? "right" : o.id === chosen.id ? "wrong" : "dim";
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={!!chosen}
                onClick={() => setChosen(o)}
                className={`flex min-h-16 w-full items-center gap-2 rounded-2xl border-2 px-3 py-2 transition ${
                  state === "right"
                    ? "border-good bg-good-soft"
                    : state === "wrong"
                      ? "border-brand bg-brand-soft"
                      : state === "dim"
                        ? "border-line opacity-50"
                        : "border-line hover:border-brand"
                }`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-line text-xs font-bold text-muted">
                  {state === "right" ? "✓" : state === "wrong" ? "✗" : i + 1}
                </span>
                <Ar className="flex-1 text-center text-2xl font-semibold">{label(o)}</Ar>
              </button>
            </li>
          );
        })}
      </ul>

      {chosen && (
        <div className="mt-4" role="status">
          <p className={`text-center text-xl font-extrabold ${correct ? "text-good" : "text-brand"}`}>
            {correct ? "✓ Correct!" : `Not quite — it’s “${example.answer}” (${word.english}).`}
          </p>
          <button type="button" className="btn-primary mt-4 w-full" onClick={next}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
