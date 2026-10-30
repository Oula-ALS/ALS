import type { ReactNode } from "react";

/** Arabic text: always lang="ar" dir="rtl". */
export default function Ar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span lang="ar" dir="rtl" className={className}>
      {children}
    </span>
  );
}
