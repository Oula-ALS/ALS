import { Link } from "react-router-dom";
import Ar from "../components/Ar";
import { LEVELS } from "../lib/data";
import { useStudent } from "../lib/student";

const totalWords = LEVELS.reduce((n, l) => n + l.words.length, 0);

export default function Welcome() {
  const student = useStudent();
  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        <img src="/images/logo.png" alt="Alsama Language School" className="logo-badge mx-auto h-16 w-auto" />

        <div className="relative mt-6 overflow-hidden rounded-3xl">
          <img
            src="/images/students-library.jpg"
            alt="Alsama students and teachers smiling together in the library"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16">
            <Ar className="block text-4xl font-bold text-white drop-shadow">أهلا وسهلا!</Ar>
            <p className="text-lg font-bold text-white drop-shadow">Welcome!</p>
          </div>
        </div>

        <h1 className="mt-7 text-3xl font-extrabold leading-tight text-ink">
          Learn <span className="text-brand">Lebanese Arabic</span> words, one card at a time.
        </h1>
        <p className="mt-3 text-lg text-muted">
          {totalWords.toLocaleString()} words from your Alsama Language School books, with flashcards you can use in
          class and at home.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["🗂️", "Flashcards", "Tap to flip, swipe when you know it."],
            ["🔊", "Listen", "Hear each word read aloud."],
            ["🔗", "Class links", "Your teacher can send one link per unit."],
          ].map(([icon, title, text]) => (
            <li key={title} className="card p-4">
              <div className="text-2xl" aria-hidden>
                {icon}
              </div>
              <div className="mt-1 font-extrabold">{title}</div>
              <div className="text-sm text-muted">{text}</div>
            </li>
          ))}
        </ul>

        <Link to={student ? "/" : "/student"} className="btn-primary mt-8 w-full text-lg">
          {student ? `Continue, ${student.name}` : "Let’s start"} →
        </Link>

        <div className="mt-10 grid grid-cols-2 gap-3">
          <img
            src="/images/students-classroom.jpg"
            alt="Alsama students laughing over their books in class"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
          <img
            src="/images/students-walking-books.jpg"
            alt="Alsama students walking together carrying their books"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Alsama Language School · part of the Alsama Project
        </p>
      </div>
    </div>
  );
}
