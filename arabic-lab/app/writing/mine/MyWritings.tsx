"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stars } from "@/components/Stars";
import { topicById } from "@/content/writing";
import { useLocalStudent } from "@/lib/student";

type Writing = {
  id: string;
  topic_id: string;
  text: string;
  status: "new" | "reviewed";
  feedback: string | null;
  stars: number | null;
  created_at: string;
};

export function MyWritings() {
  const student = useLocalStudent();
  const router = useRouter();
  const [state, setState] = useState<{ writings: Writing[] | null; error: string }>({ writings: null, error: "" });

  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    fetch("/api/writings/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: student.id, token: student.token }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (r.ok) setState({ writings: data.writings, error: "" });
        else setState({ writings: [], error: "Couldn't load your writings right now." });
      })
      .catch(() => !cancelled && setState({ writings: [], error: "No internet connection? Try again later." }));
    return () => {
      cancelled = true;
    };
  }, [student]);

  function improve(w: Writing) {
    try {
      localStorage.setItem(`alsama-lab:draft:${w.topic_id}`, w.text);
    } catch {}
    router.push(`/writing/${w.topic_id}`);
  }

  if (student === undefined) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/writing" className="text-sm font-medium text-accent-text underline">
        ← All writing topics
      </Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-heading">My writings</h1>
      {!student ? (
        <p className="mt-4 text-muted">
          <Link href="/start" className="underline">
            Register
          </Link>{" "}
          to send writings to your teacher.
        </p>
      ) : state.writings === null ? (
        <p className="mt-4 text-muted">Loading…</p>
      ) : (
        <>
          {state.error && (
            <p role="alert" className="mt-4 font-medium text-error">
              {state.error}
            </p>
          )}
          {state.writings.length === 0 && !state.error && (
            <p className="mt-4 text-muted">
              Nothing sent yet. Pick a topic in{" "}
              <Link href="/writing" className="underline">
                Writing
              </Link>
              .
            </p>
          )}
          <ul className="mt-5 flex flex-col gap-4">
            {state.writings.map((w) => {
              const topic = topicById(w.topic_id);
              return (
                <li key={w.id} className="rounded-3xl bg-surface p-5 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-xl font-bold text-heading">
                      {topic ? `${topic.title.en} · ` : ""}
                      {topic && (
                        <span lang="ar" dir="rtl">
                          {topic.title.ar}
                        </span>
                      )}
                    </h2>
                    <span className="text-sm text-muted">{new Date(w.created_at).toLocaleDateString("en-GB")}</span>
                  </div>
                  <p dir="auto" className="mt-2 whitespace-pre-line font-display text-lg">
                    {w.text}
                  </p>
                  {w.status === "reviewed" ? (
                    <div className="mt-3 rounded-2xl bg-yellow p-4 text-plum">
                      <p className="font-bold">
                        Teacher&apos;s feedback {w.stars ? <Stars value={w.stars} size="text-base" /> : null}
                      </p>
                      {w.feedback && <p dir="auto" className="mt-1 whitespace-pre-line">{w.feedback}</p>}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted">Waiting for your teacher&apos;s feedback.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => improve(w)}
                    className="mt-3 rounded-full border-2 border-plum px-5 py-2 text-sm font-bold text-heading dark:border-sky"
                  >
                    Write an improved version
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
