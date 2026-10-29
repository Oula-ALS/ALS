import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Flashcards } from "@/components/words/Flashcards";
import { getUnit } from "@/lib/content";

export default function Page({ params }: PageProps<"/words/[level]/[unit]/flashcards">) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: PageProps<"/words/[level]/[unit]/flashcards">["params"] }) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <Flashcards level={unit.level} unitId={unit.id} words={unit.words} />;
}
