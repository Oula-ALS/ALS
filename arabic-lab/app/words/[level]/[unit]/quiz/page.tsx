import { notFound } from "next/navigation";
import { Quiz } from "@/components/words/Quiz";
import { getUnit } from "@/lib/content";

export default async function Page({ params }: PageProps<"/words/[level]/[unit]/quiz">) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <Quiz level={unit.level} unitId={unit.id} words={unit.words} />;
}
