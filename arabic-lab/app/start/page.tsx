import type { Metadata } from "next";
import { RegisterFlow } from "./RegisterFlow";

export const metadata: Metadata = { title: "Student details · Alsama Arabic Lab" };

export default function StartPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <RegisterFlow />
    </div>
  );
}
