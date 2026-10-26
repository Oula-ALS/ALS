import { rankFor } from "@/lib/games/scoring";

export function RankBar({ xp }: { xp: number }) {
  const { rank, next, progress } = rankFor(xp);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-lg font-bold">
          <span lang="ar" dir="rtl">
            {rank.ar}
          </span>{" "}
          · {rank.en}
        </p>
        <p className="text-sm">
          {next ? (
            <>
              {next.xp - xp} XP to{" "}
              <span lang="ar" dir="rtl">
                {next.ar}
              </span>{" "}
              {next.en}
            </>
          ) : (
            "Top rank!"
          )}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Progress to next rank"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mt-2 h-3 overflow-hidden rounded-full bg-white/70"
      >
        <div className="h-full rounded-full bg-orange" style={{ width: `${Math.max(progress * 100, 3)}%` }} />
      </div>
    </div>
  );
}
