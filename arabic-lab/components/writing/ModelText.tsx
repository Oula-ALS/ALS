"use client";

import { useState } from "react";
import { ListenButton } from "@/components/ListenButton";

type Phrase = { ar: string; en: string };

/** Splits the text into plain pieces and highlighted phrases (longest phrases win). */
function highlight(text: string, phrases: Phrase[]) {
  const sorted = [...phrases].sort((a, b) => b.ar.length - a.ar.length);
  const out: Array<string | Phrase> = [];
  let i = 0;
  let plain = "";
  while (i < text.length) {
    const hit = sorted.find((p) => text.startsWith(p.ar, i));
    if (hit) {
      if (plain) out.push(plain);
      plain = "";
      out.push(hit);
      i += hit.ar.length;
    } else {
      plain += text[i];
      i++;
    }
  }
  if (plain) out.push(plain);
  return out;
}

export function ModelText({ model, phrases, draft }: { model: { ar: string; chat: string; en: string }; phrases: Phrase[]; draft: boolean }) {
  const [showChat, setShowChat] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const [picked, setPicked] = useState<Phrase | null>(null);

  return (
    <section aria-labelledby="model-title" className="rounded-3xl bg-yellow p-5 text-plum">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="model-title" className="font-display text-xl font-bold">
          Model text
          {draft && <span className="ms-2 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium">Draft · not yet checked by your teacher</span>}
        </h2>
        <div className="flex flex-wrap gap-2">
          <ListenButton text={model.ar} label="Listen to the model text" />
          <Toggle on={showChat} set={setShowChat}>
            Chat
          </Toggle>
          <Toggle on={showEn} set={setShowEn}>
            English
          </Toggle>
        </div>
      </div>
      <p lang="ar" dir="rtl" className="mt-3 whitespace-pre-line font-display text-2xl leading-loose">
        {highlight(model.ar, phrases).map((piece, k) =>
          typeof piece === "string" ? (
            <span key={k}>{piece}</span>
          ) : (
            <button
              key={k}
              type="button"
              onClick={() => setPicked(picked?.ar === piece.ar ? null : piece)}
              aria-expanded={picked?.ar === piece.ar}
              className="rounded-md bg-orange/50 px-0.5 font-bold underline decoration-dotted underline-offset-4 hover:bg-orange"
            >
              {piece.ar}
            </button>
          ),
        )}
      </p>
      <p role="status" className="min-h-6 text-sm">
        {picked ? (
          <>
            <span lang="ar" dir="rtl" className="font-bold">
              {picked.ar}
            </span>{" "}
            = {picked.en}
          </>
        ) : (
          phrases.length > 0 && "Tap a highlighted phrase to see what it means."
        )}
      </p>
      {showChat && <p className="mt-3 whitespace-pre-line border-t border-plum/20 pt-3">{model.chat}</p>}
      {showEn && <p className="mt-3 whitespace-pre-line border-t border-plum/20 pt-3 italic">{model.en}</p>}
    </section>
  );
}

function Toggle({ on, set, children }: { on: boolean; set: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => set(!on)}
      className="rounded-full border-2 border-plum px-3 py-1 text-sm font-medium aria-pressed:bg-plum aria-pressed:text-white"
    >
      {children}
    </button>
  );
}
