import type { Metadata } from "next";
import { Dashboard } from "./Dashboard";
import { unitSummaries } from "@/lib/content";

export const metadata: Metadata = { title: "Teacher · Alsama Arabic Lab", robots: { index: false } };

export default function TeacherPage() {
  return <Dashboard units={unitSummaries()} />;
}
