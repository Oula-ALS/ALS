import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { setSettings, useSettings, type Settings } from "../lib/settings";
import { useStudent } from "../lib/student";

const NEXT_THEME: Record<Settings["theme"], Settings["theme"]> = { system: "light", light: "dark", dark: "system" };
const THEME_ICON = { system: "🌗", light: "☀️", dark: "🌙" };
const THEME_LABEL = { system: "Theme: same as phone", light: "Theme: light", dark: "Theme: dark" };

function ThemeButton() {
  const { theme } = useSettings();
  return (
    <button
      type="button"
      onClick={() => setSettings({ theme: NEXT_THEME[theme] })}
      className="flex size-12 items-center justify-center rounded-full text-xl hover:bg-brand-soft"
      aria-label={`${THEME_LABEL[theme]}. Tap to change.`}
      title={THEME_LABEL[theme]}
    >
      {THEME_ICON[theme]}
    </button>
  );
}

interface Props {
  children: ReactNode;
  /** Where the back arrow goes. No arrow when empty. */
  back?: { to: string; label: string };
  wide?: boolean;
}

export default function Layout({ children, back, wide }: Props) {
  const student = useStudent();
  return (
    <div className="min-h-dvh bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className={`mx-auto flex h-16 items-center gap-2 px-4 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
          {back && (
            <Link
              to={back.to}
              className="-ml-2 flex min-h-12 min-w-12 items-center justify-center rounded-full text-2xl text-brand hover:bg-brand-soft"
              aria-label={`Back to ${back.label}`}
            >
              ←
            </Link>
          )}
          <Link to="/" className="flex items-center" aria-label="Alsama Vocab home">
            <img src="/images/logo.png" alt="Alsama Language School" className="logo-badge h-10 w-auto" />
          </Link>
          <div className="flex-1" />
          <Link to="/search" className="flex size-12 items-center justify-center rounded-full text-xl hover:bg-brand-soft" aria-label="Search words">
            🔍
          </Link>
          <ThemeButton />
          {student && (
            <Link to="/student" className="chip" aria-label="Your info">
              <span aria-hidden>👤</span>
              <span className="hidden max-w-28 truncate sm:inline">{student.name}</span>
            </Link>
          )}
        </div>
      </header>
      <main className={`mx-auto px-4 pb-16 pt-5 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>{children}</main>
    </div>
  );
}
