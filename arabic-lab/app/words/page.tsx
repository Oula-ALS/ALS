import type { Metadata } from "next";
import { WordsIndex } from "./WordsIndex";
import { isSampleContent, unitSummaries } from "@/lib/content";

export const metadata: Metadata = { title: "Words · Alsama Arabic Lab" };

export default function WordsPage() {
  return <WordsIndex units={unitSummaries()} sample={isSampleContent} />;
}
