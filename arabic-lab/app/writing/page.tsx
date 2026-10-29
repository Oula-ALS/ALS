import type { Metadata } from "next";
import { WritingIndex } from "./WritingIndex";

export const metadata: Metadata = { title: "Writing · Alsama Arabic Lab" };

export default function WritingPage() {
  return <WritingIndex />;
}
