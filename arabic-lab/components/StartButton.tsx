"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readLocalStudent } from "@/lib/student";

const noop = () => () => {};

export function StartButton() {
  // null on the server and for new visitors; the student's name for returning ones.
  const name = useSyncExternalStore(
    noop,
    () => readLocalStudent()?.name ?? null,
    () => null,
  );

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-lg font-display font-bold shadow-sm transition-transform hover:-translate-y-0.5";

  if (name) {
    return (
      <Link href="/home" className={`${base} bg-orange text-on-accent`}>
        Continue as {name}
      </Link>
    );
  }

  return (
    <Link href="/start" className={`${base} bg-orange text-on-accent`}>
      Start learning ·{" "}
      <span lang="ar" dir="rtl">
        يلا نبلّش
      </span>
    </Link>
  );
}
