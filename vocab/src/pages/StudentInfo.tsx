import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Ar from "../components/Ar";
import Layout from "../components/Layout";
import { LEVELS } from "../lib/data";
import { setStudent, useStudent, type Student } from "../lib/student";

const LEVEL_CHOICES: { value: Student["level"]; label: string }[] = [
  ...LEVELS.map((l) => ({ value: l.level, label: l.title })),
  { value: "not-sure", label: "I’m not sure" },
];

export default function StudentInfo() {
  const existing = useStudent();
  const navigate = useNavigate();
  const [name, setName] = useState(existing?.name ?? "");
  const [level, setLevel] = useState<Student["level"]>(existing?.level ?? "beginner");
  const [className, setClassName] = useState(existing?.className ?? "");
  const [error, setError] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const clean = name.trim().slice(0, 40);
    if (!clean) {
      setError(true);
      return;
    }
    setStudent({ name: clean, level, className: className.trim().slice(0, 60) || undefined });
    navigate(level !== "not-sure" && !existing ? `/${level}` : "/");
  }

  return (
    <Layout back={existing ? { to: "/", label: "home" } : { to: "/welcome", label: "welcome" }}>
      <img
        src="/images/teacher-fist-bump.jpg"
        alt="An Alsama teacher giving a student a fist bump"
        className="aspect-[16/7] w-full rounded-3xl object-cover"
      />
      <h1 className="mt-6 text-3xl font-extrabold">{existing ? "Your info" : "About you"}</h1>
      <p className="mt-1 text-muted">
        <Ar className="font-semibold text-brand">عرّفنا عنك</Ar> · So the app can greet you and open your book.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-6" noValidate>
        <div>
          <label htmlFor="name" className="block font-bold">
            Your first name <span className="text-brand">*</span>
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(false);
            }}
            autoComplete="given-name"
            maxLength={40}
            aria-invalid={error}
            aria-describedby={error ? "name-error" : undefined}
            className="mt-2 h-14 w-full rounded-2xl border-2 border-line px-4 text-lg outline-none focus:border-brand"
          />
          {error && (
            <p id="name-error" className="mt-1 text-sm font-semibold text-brand">
              Please write your first name.
            </p>
          )}
        </div>

        <fieldset>
          <legend className="font-bold">Which book are you studying?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {LEVEL_CHOICES.map((c) => (
              <label
                key={c.value}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 font-semibold ${level === c.value ? "border-brand bg-brand-soft text-brand" : "border-line"}`}
              >
                <input
                  type="radio"
                  name="level"
                  value={c.value}
                  checked={level === c.value}
                  onChange={() => setLevel(c.value)}
                  className="size-5 accent-brand"
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="class" className="block font-bold">
            Class or teacher <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            maxLength={60}
            placeholder="e.g. Tuesday evening, Oula"
            className="mt-2 h-14 w-full rounded-2xl border-2 border-line px-4 text-lg outline-none focus:border-brand"
          />
        </div>

        <div className="rounded-2xl bg-brand-soft p-4 text-sm text-ink">
          <b>🔒 Stays on this phone.</b> Your name and progress are saved only on this device. Nothing is sent to
          Alsama or anyone else. You can delete it any time.
        </div>

        <button type="submit" className="btn-primary w-full text-lg">
          {existing ? "Save" : "Save and start"} →
        </button>

        {existing && (
          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() => {
              if (confirm("Delete your name from this phone? Your word progress stays.")) {
                setStudent(null);
                navigate("/welcome");
              }
            }}
          >
            Delete my info
          </button>
        )}
      </form>
    </Layout>
  );
}
