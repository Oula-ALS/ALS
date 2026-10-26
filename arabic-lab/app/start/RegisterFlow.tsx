"use client";

import Link from "next/link";
import { useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { useLocalStudent, type LocalStudent } from "@/lib/student";

export function RegisterFlow() {
  const saved = useLocalStudent();
  const [done, setDone] = useState<{ student: LocalStudent; emailSent: boolean } | null>(null);

  // This page can stay alive in the background, so only show the thank-you
  // while that registration is still the one on this device.
  if (done && saved?.id === done.student.id) {
    return (
      <section className="rounded-3xl bg-yellow p-8 text-center text-plum" aria-live="polite">
        <p lang="ar" dir="rtl" className="font-display text-4xl font-extrabold">
          أهلا فيك يا {done.student.name}!
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">Your details are saved.</h1>
        <p className="mt-3">
          {done.emailSent
            ? "Your teacher at Alsama has been told you joined."
            : "Your teacher at Alsama will see your details in the student list."}{" "}
          You can change them any time from <strong>My details</strong>.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-block rounded-full bg-plum px-8 py-4 font-display text-lg font-bold text-white"
        >
          Let&apos;s go ·{" "}
          <span lang="ar" dir="rtl">
            يلا
          </span>
        </Link>
      </section>
    );
  }

  if (saved === undefined) return null; // wait for the browser before deciding

  if (saved) {
    return (
      <section className="text-center">
        <h1 className="font-display text-3xl font-bold text-heading">
          You&apos;re already registered, {saved.name}.
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/home" className="rounded-full bg-orange px-6 py-3 font-bold text-on-accent">
            Continue learning
          </Link>
          <Link href="/profile" className="rounded-full border-2 border-plum px-6 py-3 font-bold text-heading">
            Edit my details
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-heading">
        Tell us about you ·{" "}
        <span lang="ar" dir="rtl">
          عرّفنا عليك
        </span>
      </h1>
      <p className="mt-2 mb-6 text-muted">It takes about two minutes.</p>
      <ProfileForm onSaved={(student, emailSent) => setDone({ student, emailSent })} />
    </>
  );
}
