import { useCallback, useEffect, useState } from "react";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { WriteQuestion } from "../components/Questions";
import RoundSummary from "../components/RoundSummary";
import { recordAnswer } from "../lib/progress";
import { shuffled } from "../lib/random";
import { setSettings, useSettings } from "../lib/settings";
import { useUnit } from "../lib/useUnit";
import type { Word } from "../types";
import NotFound from "./NotFound";

export default function WriteMode() {
  const { data, unit, words, base } = useUnit();
  const settings = useSettings();
  const [prompt, setPrompt] = useState<"english" | "listen">("listen");
  const [deck, setDeck] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<Word[]>([]);

  const start = useCallback((list: Word[]) => {
    setDeck(shuffled(list));
    setIndex(0);
    setRight(0);
    setMissed([]);
  }, []);

  useEffect(() => start(words), [words, start]);

  if (!data || !unit) return <NotFound />;
  const word = deck[index];
  const done = deck.length > 0 && index >= deck.length;

  function onDone(correct: boolean) {
    recordAnswer(word.id, correct);
    if (correct) setRight((n) => n + 1);
    else setMissed((m) => [...m, word]);
    setIndex((i) => i + 1);
  }

  return (
    <Layout back={{ to: base, label: unit.title }}>
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="truncate text-xl font-extrabold">
          Listen & write · {unit.titleIsArabic ? <Ar className="font-semibold">{unit.title}</Ar> : unit.title}
        </h1>
        {!done && deck.length > 0 && (
          <span className="shrink-0 font-bold text-muted">
            {index + 1} / {deck.length}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="chip" aria-pressed={prompt === "listen"} onClick={() => setPrompt("listen")}>
          🔊 Listen
        </button>
        <button type="button" className="chip" aria-pressed={prompt === "english"} onClick={() => setPrompt("english")}>
          🇬🇧 Read English
        </button>
        <span className="mx-1 w-px self-stretch bg-line" aria-hidden />
        <button type="button" className="chip" aria-pressed={settings.typeIn === "arabic"} onClick={() => setSettings({ typeIn: "arabic" })}>
          Type Arabic
        </button>
        <button type="button" className="chip" aria-pressed={settings.typeIn === "arabizi"} onClick={() => setSettings({ typeIn: "arabizi" })}>
          Type Arabizi
        </button>
      </div>

      {!done && deck.length > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand transition-all" style={{ width: `${(index / deck.length) * 100}%` }} />
        </div>
      )}

      {word && !done && (
        <div className="mt-5">
          <WriteQuestion key={`${word.id}-${index}-${prompt}-${settings.typeIn}`} word={word} prompt={prompt} typeIn={settings.typeIn} onDone={onDone} />
        </div>
      )}

      {done && (
        <RoundSummary right={right} total={deck.length} missed={missed} onRetryMissed={() => start(missed)} onRestart={() => start(words)} backTo={base} />
      )}
    </Layout>
  );
}
