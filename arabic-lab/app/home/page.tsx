import type { Metadata } from "next";
import { HomeView } from "./HomeView";
import { isSampleContent, unitSummaries } from "@/lib/content";

export const metadata: Metadata = { title: "Home · Alsama Arabic Lab" };

export default function HomePage() {
  return <HomeView units={unitSummaries()} sample={isSampleContent} />;
}
