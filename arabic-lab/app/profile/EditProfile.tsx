"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { clearLocalStudent, useLocalStudent } from "@/lib/student";

export function EditProfile() {
  const router = useRouter();
  const student = useLocalStudent();
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (student === undefined) return null; // wait for the browser

  if (!student) {
    return (
      <section className="text-center">
        <h1 className="font-display text-3xl font-bold text-heading">No details on this device</h1>
        <p className="mt-2 text-muted">Register first, then you can edit your details here.</p>
        <Link href="/start" className="mt-6 inline-block rounded-full bg-orange px-6 py-3 font-bold text-on-accent">
          Start learning
        </Link>
      </section>
    );
  }

  async function remove() {
    if (!student) return;
    if (!window.confirm("Delete your details from Alsama? Your teacher will no longer see them.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student.id, token: student.token }),
      });
      // 404 means it's already gone on the server: still clear this device.
      if (!res.ok && res.status !== 404) throw new Error();
      clearLocalStudent();
      router.push("/");
    } catch {
      setError("Couldn't delete right now. Please check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-heading">
        My details ·{" "}
        <span lang="ar" dir="rtl">
          معلوماتي
        </span>
      </h1>
      <p className="mt-2 mb-6 text-muted">Change anything, then press Save.</p>
      {saved && (
        <p role="status" className="mb-6 rounded-2xl bg-yellow p-4 font-medium text-plum">
          Saved ✓
        </p>
      )}
      <ProfileForm
        key={student.id}
        existing={student}
        onSaved={() => {
          setSaved(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <section className="mt-12 border-t border-sky/50 pt-6">
        <h2 className="font-display text-lg font-bold text-heading">Delete my details</h2>
        <p className="text-sm text-muted">
          Removes your registration from Alsama and from this device.
        </p>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-error">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="mt-3 rounded-full border-2 border-error px-5 py-2 font-medium text-error disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete my details"}
        </button>
      </section>
    </>
  );
}
