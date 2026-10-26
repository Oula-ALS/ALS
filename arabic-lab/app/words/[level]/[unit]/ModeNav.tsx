"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODES = [
  { path: "", en: "Word list", icon: "📋" },
  { path: "/flashcards", en: "Flashcards", icon: "🃏" },
  { path: "/quiz", en: "Quiz", icon: "❓" },
  { path: "/match", en: "Match", icon: "⏱️" },
];

export function ModeNav({ base }: { base: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Practice mode" className="mt-4 flex flex-wrap gap-2">
      {MODES.map((m) => {
        const href = base + m.path;
        const active = pathname === href;
        return (
          <Link
            key={m.path}
            href={href}
            aria-current={active ? "page" : undefined}
            className="rounded-full border-2 border-sky/60 px-4 py-2 font-medium aria-[current=page]:border-plum aria-[current=page]:bg-plum aria-[current=page]:text-white dark:aria-[current=page]:border-orange dark:aria-[current=page]:bg-orange dark:aria-[current=page]:text-plum"
          >
            <span aria-hidden="true">{m.icon}</span> {m.en}
          </Link>
        );
      })}
    </nav>
  );
}
