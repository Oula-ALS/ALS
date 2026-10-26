import { notFound } from "next/navigation";
import { Flashcards } from "@/components/words/Flashcards";
import { getUnit } from "@/lib/content";

export default async function Page({ params }: PageProps<"/words/[level]/[unit]/flashcards">) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <Flashcards level={unit.level} unitId={unit.id} words={unit.words} />;
}
