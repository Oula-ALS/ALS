"use client";

import Link from "next/link";
import { Confetti } from "./Confetti";
import { Stars } from "./Stars";
import { praiseFor } from "@/lib/games/scoring";

export function GameResult({
  stars,
  summary,
  xpEarned,
  newBest,
  onAgain,
  backHref,
}: {
  stars: number;
  summary: string;
  xpEarned: number;
  newBest: boolean;
  onAgain: () => void;
  backHref: string;
}) {
  const praise = praiseFor(stars);
  return (
    <section className="rounded-3xl bg-yellow p-8 text-center text-plum" aria-live="polite">
      {stars >= 2 && <Confetti />}
      <p lang="ar" dir="rtl" className="font-display text-4xl font-extrabold">
        {praise.ar}
      </p>
      <p className="text-sm">
        {praise.chat} · {praise.en}
      </p>
      <div className="mt-4">
        <Stars value={stars} size="text-4xl" />
      </div>
      <p className="mt-3 text-lg font-medium">{summary}</p>
      <p className="mt-1">
        +{xpEarned} XP{newBest && " · New best for this unit!"}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onAgain} className="rounded-full bg-plum px-6 py-3 font-bold text-white">
          Play again
        </button>
        <Link href={backHref} className="rounded-full border-2 border-plum px-6 py-3 font-bold">
          Back to the unit
        </Link>
      </div>
    </section>
  );
}
