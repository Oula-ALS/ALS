import { notFound } from "next/navigation";
import { WordTable } from "@/components/words/WordTable";
import { getUnit } from "@/lib/content";

export default async function Page({ params }: PageProps<"/words/[level]/[unit]">) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <WordTable level={unit.level} unitId={unit.id} words={unit.words} />;
}
