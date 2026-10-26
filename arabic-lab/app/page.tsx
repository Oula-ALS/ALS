import Image from "next/image";
import { Logo } from "@/components/Logo";
import { StartButton } from "@/components/StartButton";
import { Waves } from "@/components/Waves";
import { CONTENT_STATS } from "@/lib/stats";

const stats = [
  { value: CONTENT_STATS.words.toLocaleString("en"), label: "words", ar: "كلمة" },
  { value: CONTENT_STATS.phrases, label: "phrases", ar: "جملة" },
  { value: CONTENT_STATS.grammarLessons, label: "grammar lessons", ar: "درس قواعد" },
];

export default function Welcome() {
  return (
    <div className="relative flex-1 overflow-hidden">
      <section className="relative z-10 mx-auto grid max-w-5xl gap-10 px-4 pt-8 pb-40 md:grid-cols-2 md:items-center md:pt-14">
        <div className="flex flex-col items-start gap-5">
          <Logo width={200} />
          <h1
            lang="ar"
            dir="rtl"
            className="font-display font-extrabold text-accent-text text-6xl leading-tight md:text-7xl"
          >
            أهلا وسهلا
          </h1>
          <p className="font-display text-2xl font-bold text-heading md:text-3xl">
            Learn Levantine Arabic, one session at a time.
          </p>
          <p className="text-muted max-w-md">
            Practise your class vocabulary, everyday phrases and Book 1 grammar,
            then write about your own life.
          </p>

          <ul className="flex flex-wrap gap-3" aria-label="What's inside">
            {stats.map((s) => (
              <li
                key={s.label}
                className="rounded-2xl bg-peach px-4 py-3 text-plum shadow-sm"
              >
                <span className="block font-display text-2xl font-extrabold leading-none">
                  {s.value}
                </span>
                <span className="text-sm">
                  {s.label} ·{" "}
                  <span lang="ar" dir="rtl">
                    {s.ar}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <StartButton />
        </div>

        <figure className="relative mx-auto w-full max-w-sm">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rotate-3 rounded-[2.5rem] bg-shape-a"
          />
          <Image
            src="/brand/alsama-photo.jpg"
            alt="A student and a teacher shaking hands in front of the Alsama sign"
            width={1152}
            height={1536}
            priority
            sizes="(min-width: 768px) 384px, 90vw"
            className="relative rounded-[2rem] object-cover shadow-lg"
          />
          <figcaption className="relative mt-4 text-center text-sm text-muted">
            Alsama Language School · Shatila, Beirut
          </figcaption>
        </figure>
      </section>
      <Waves className="bottom-0 h-40" />
    </div>
  );
}
