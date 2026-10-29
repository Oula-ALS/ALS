import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline · Alsama Arabic Lab" };

// Shown when a page isn't saved on this device yet and there is no internet.
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p lang="ar" dir="rtl" className="font-display text-4xl font-extrabold text-accent-text">
        ما في إنترنت
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-heading">You&apos;re offline</h1>
      <p className="mt-3 text-muted">
        This page isn&apos;t saved on your device yet. Your words, games, About Me and writing drafts still work offline.
      </p>
      <Link href="/home" className="mt-6 inline-block rounded-full bg-orange px-6 py-3 font-bold text-on-accent">
        Go to Home
      </Link>
    </div>
  );
}
