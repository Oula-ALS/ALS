import { notFound } from "next/navigation";
import { Match } from "@/components/words/Match";
import { getUnit } from "@/lib/content";

export default async function Page({ params }: PageProps<"/words/[level]/[unit]/match">) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <Match level={unit.level} unitId={unit.id} words={unit.words} />;
}
