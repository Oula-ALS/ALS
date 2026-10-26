import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-page/90 backdrop-blur border-b border-sky/40">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-2">
        <Link href="/" aria-label="Alsama Arabic Lab home" className="flex items-center gap-3">
          <Logo width={110} priority />
          <span className="font-display font-bold text-heading text-lg hidden sm:inline">
            Arabic Lab
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/profile" className="rounded-full px-3 py-2 text-sm font-medium text-heading hover:bg-shape-b">
            My details
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
