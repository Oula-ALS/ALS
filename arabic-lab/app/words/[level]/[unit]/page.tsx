import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WordTable } from "@/components/words/WordTable";
import { getUnit } from "@/lib/content";

export default function Page({ params }: PageProps<"/words/[level]/[unit]">) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: PageProps<"/words/[level]/[unit]">["params"] }) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <WordTable level={unit.level} unitId={unit.id} words={unit.words} />;
}
