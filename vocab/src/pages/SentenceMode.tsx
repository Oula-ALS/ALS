import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { GenderBadge, HighlightedSentence, SpeakButton, SpeakSentence } from "../components/WordBits";
import { approvedExample, sentenceUsesWord, splitAround } from "../lib/examples";
import { addMySentence, removeMySentence, useMySentences } from "../lib/mySentences";
import { setSettings, useSettings } from "../lib/settings";
import { useUnit } from "../lib/useUnit";
import NotFound from "./NotFound";

export default function SentenceMode() {
  const { data, unit, words, base } = useUnit();
  const settings = useSettings();
  const mine = useMySentences();
  const list = useMemo(() => words.filter((w) => approvedExample(w)), [words]);
  const [index, setIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<"yes" | "no" | null>(null);

  if (!data || !unit) return <NotFound />;
  const word = list[index];
  const example = word && approvedExample(word)!;

  function go(i: number) {
    setIndex(i);
    setShowEnglish(false);
    setText("");
    setResult(null);
  }

  function check(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setResult(sentenceUsesWord(text, word) ? "yes" : "no");
  }

  return (
    <Layout back={{ to: base, label: unit.title }}>
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="truncate text-xl font-extrabold">
          Use it in a sentence · {unit.titleIsArabic ? <Ar className="font-semibold">{unit.title}</Ar> : unit.title}
        </h1>
        {word && (
          <span className="shrink-0 font-bold text-muted">
            {index + 1} / {list.length}
          </span>
        )}
      </div>

      {!word && (
        <div className="card mt-6 p-6 text-center">
          <p className="font-bold">No example sentences here yet.</p>
          <p className="mt-1 text-muted">Your teachers are still checking them. Try flashcards or the quiz for now.</p>
          <Link to={base} className="btn-primary mt-4">
            Back to the unit
          </Link>
        </div>
      )}

      {word && example && (
        <>
          <div className="card mt-5 p-5">
            <div className="flex items-center gap-3">
              <Ar className="text-3xl font-bold">{word.display}</Ar>
              <SpeakButton word={word} />
              <span className="flex-1" />
              <span className="text-right font-semibold">{word.english}</span>
              <GenderBadge gender={word.gender} />
            </div>

            <div className="mt-5 rounded-2xl bg-white text-center">
              <HighlightedSentence {...splitAround(example.arabic, example.answer)} className="block text-3xl leading-loose" />
              {settings.showArabizi && <p className="mt-1 text-muted">{example.arabizi}</p>}
              {showEnglish && <p className="mt-1 text-lg">{example.english}</p>}
              <div className="mt-3 flex items-center justify-center gap-3">
                <SpeakSentence text={example.arabic} />
                <button type="button" className="chip" aria-pressed={showEnglish} onClick={() => setShowEnglish((v) => !v)}>
                  {showEnglish ? "Hide" : "Show"} translation
                </button>
                <button type="button" className="chip" aria-pressed={settings.showArabizi} onClick={() => setSettings({ showArabizi: !settings.showArabizi })}>
                  Arabizi
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={check} className="mt-5">
            <label htmlFor="mine" className="block font-bold">
              Your turn: write your own sentence with <Ar className="text-brand">{word.arabic}</Ar>
            </label>
            <textarea
              id="mine"
              lang="ar"
              dir="rtl"
              rows={2}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
              }}
              className="mt-2 w-full rounded-2xl border-2 border-line p-3 font-ar text-2xl outline-none focus:border-brand"
            />
            <p className="text-xs text-muted">We only check that your sentence uses the word — ask your teacher about the rest!</p>
            {result === null && (
              <button type="submit" className="btn-primary mt-3 w-full" disabled={!text.trim()}>
                Check
              </button>
            )}
          </form>

          {result === "yes" && (
            <div className="mt-3 rounded-2xl bg-good-soft p-4" role="status">
              <p className="font-extrabold text-good">✓ Great — your sentence uses {word.arabic}.</p>
              <button
                type="button"
                className="btn-primary mt-3 w-full"
                onClick={() => {
                  addMySentence(word.id, text.trim());
                  setText("");
                  setResult(null);
                }}
              >
                Save my sentence
              </button>
            </div>
          )}
          {result === "no" && (
            <p className="mt-3 rounded-2xl bg-brand-soft p-4 font-semibold text-brand" role="status">
              I can’t find <Ar>{word.arabic}</Ar> in your sentence. Check the spelling and try again.
            </p>
          )}

          {(mine[word.id] ?? []).length > 0 && (
            <div className="mt-5">
              <h2 className="font-bold">My sentences</h2>
              <ul className="mt-2 divide-y divide-line rounded-2xl border-2 border-line">
                {mine[word.id].map((s) => (
                  <li key={s.at} className="flex items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      className="text-sm text-muted hover:text-brand"
                      onClick={() => removeMySentence(word.id, s.at)}
                      aria-label="Delete this sentence"
                    >
                      ✕
                    </button>
                    <Ar className="flex-1 text-xl">{s.text}</Ar>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted">Saved on this phone only.</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" className="btn-ghost" disabled={index === 0} onClick={() => go(index - 1)}>
              ← Previous
            </button>
            <button type="button" className="btn-primary" disabled={index === list.length - 1} onClick={() => go(index + 1)}>
              Next word →
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}
