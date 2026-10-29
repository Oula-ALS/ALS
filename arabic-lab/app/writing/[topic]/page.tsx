import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TOPICS, topicById } from "@/content/writing";
import { TopicView } from "@/components/writing/TopicView";
import { unitsFor } from "@/lib/content";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[topic]">): Promise<Metadata> {
  const topic = topicById((await params).topic);
  return { title: topic ? `${topic.title.en} · Writing · Alsama Arabic Lab` : "Writing · Alsama Arabic Lab" };
}

// params are read inside <Suspense> so navigation can show the page shell instantly.
export default function TopicPage({ params }: PageProps<"/writing/[topic]">) {
  return (
    <Suspense fallback={null}>
      <Topic params={params} />
    </Suspense>
  );
}

async function Topic({ params }: { params: PageProps<"/writing/[topic]">["params"] }) {
  const topic = topicById((await params).topic);
  if (!topic) notFound();
  // Only the Advanced opinion topic needs the Advanced word lists.
  const advancedUnits = topic.advancedVocab
    ? unitsFor("advanced").map((u) => ({ id: u.id, title: u.title, words: u.words }))
    : [];
  return <TopicView topic={topic} advancedUnits={advancedUnits} />;
}
