import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Quiz } from "@/components/words/Quiz";
import { getUnit } from "@/lib/content";

export default function Page({ params }: PageProps<"/words/[level]/[unit]/quiz">) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: PageProps<"/words/[level]/[unit]/quiz">["params"] }) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <Quiz level={unit.level} unitId={unit.id} words={unit.words} />;
}
