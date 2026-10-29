import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Match } from "@/components/words/Match";
import { getUnit } from "@/lib/content";

export default function Page({ params }: PageProps<"/words/[level]/[unit]/match">) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: PageProps<"/words/[level]/[unit]/match">["params"] }) {
  const { level, unit: unitId } = await params;
  const unit = getUnit(level, unitId);
  if (!unit) notFound();
  return <Match level={unit.level} unitId={unit.id} words={unit.words} />;
}
