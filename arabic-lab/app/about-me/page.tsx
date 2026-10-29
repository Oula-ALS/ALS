import type { Metadata } from "next";
import { AboutMe } from "./AboutMe";

export const metadata: Metadata = { title: "About Me · Alsama Arabic Lab" };

export default function AboutMePage() {
  return <AboutMe />;
}
