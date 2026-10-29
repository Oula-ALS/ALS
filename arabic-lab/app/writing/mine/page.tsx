import type { Metadata } from "next";
import { MyWritings } from "./MyWritings";

export const metadata: Metadata = { title: "My writings · Alsama Arabic Lab" };

export default function MyWritingsPage() {
  return <MyWritings />;
}
