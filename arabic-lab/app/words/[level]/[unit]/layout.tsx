import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ModeNav } from "./ModeNav";
import { getUnit, unitSummaries } from "@/lib/content";
import { LEVEL_NAMES } from "@/lib/content/types";

export function generateStaticParams() {
  return unitSummaries().map((u) => ({ level: u.level, unit: u.id }));
}

export default function UnitLayout({ children, params }: LayoutProps<"/words/[level]/[unit]">) {
  return (
    <Suspense fallback={null}>
      <UnitShell params={params}>{children}</UnitShell>
    </Suspense>
  );
}

async function UnitShell({ children, params }: { children: React.ReactNode; params: LayoutProps<"/words/[level]/[unit]">["params"] }) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  const base = `/words/${unit.level}/${unit.id}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <Link href="/words" className="text-sm font-medium text-accent-text underline">
        ← {LEVEL_NAMES[unit.level]} words
      </Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-heading">
        <span className="text-muted">{unit.id.startsWith("unit-") ? `Unit ${unit.number}` : `Topic ${unit.number}`} · </span>
        <span lang={unit.titleIsArabic ? "ar" : undefined} dir={unit.titleIsArabic ? "rtl" : undefined}>
          {unit.title}
        </span>
      </h1>
      <ModeNav base={base} />
      <div className="mt-6">{children}</div>
      <p className="mt-10 text-sm text-muted">
        The chat spelling shows the Levantine pronunciation. The 🔊 computer voice may sound more formal than
        Lebanese Arabic; real recordings will replace it.
      </p>
    </div>
  );
}
