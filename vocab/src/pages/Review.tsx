import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { LEVELS } from "../lib/data";
import { dueWordIds, getProgress } from "../lib/progress";
import { FlashcardDeck } from "./Flashcards";

const ALL = LEVELS.flatMap((l) => l.words);

/** Flashcards for every word whose review day has come (from all levels). */
export default function Review() {
  // Fixed when the page opens, so the list doesn't change while answering.
  const [words] = useState(() => {
    const due = new Set(dueWordIds(getProgress()));
    return ALL.filter((w) => due.has(w.id));
  });

  if (!words.length) {
    return (
      <Layout back={{ to: "/", label: "home" }}>
        <div className="card mt-6 p-6 text-center">
          <div className="text-5xl" aria-hidden>
            🌿
          </div>
          <h1 className="mt-2 text-2xl font-extrabold">Nothing to review right now</h1>
          <p className="mt-1 text-muted">Words come back here on the day you should practise them again.</p>
          <Link to="/" className="btn-primary mt-4">
            Choose a unit
          </Link>
        </div>
      </Layout>
    );
  }
  return <FlashcardDeck words={words} title={`Review (${words.length})`} backTo="/" backLabel="home" doneText="Back to home" />;
}
