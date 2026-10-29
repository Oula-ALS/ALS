"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ChipPicker, type ChipOption } from "./ChipPicker";
import { ANIMALS, DREAMS, GENDERS, HOBBIES, LEVELS, TRAVEL } from "@/lib/profile-options";
import {
  CHOICE_FIELDS,
  EMAIL_RE,
  LIMITS,
  type ChoiceField,
  type ChoiceInput,
  type Gender,
  type Level,
  type Profile,
} from "@/lib/registration";
import { saveLocalStudent, type LocalStudent } from "@/lib/student";

type Draft = {
  name: string;
  email: string;
  gender: Gender | "";
  from: string;
  level: Level | "";
} & Record<ChoiceField, ChoiceInput | null>;

const empty: Draft = {
  name: "",
  email: "",
  gender: "",
  from: "",
  level: "",
  travel: null,
  hobby: null,
  animal: null,
  dream: null,
};

const toDraft = (s: LocalStudent): Draft => ({
  name: s.name,
  email: s.email,
  gender: s.gender,
  from: s.from,
  level: s.level,
  ...(Object.fromEntries(
    CHOICE_FIELDS.map((f) => {
      const c = s[f];
      if (!c) return [f, null];
      return [f, c.id === "other" ? { id: "other", text: (c as { text: string }).text } : { id: c.id }];
    }),
  ) as Record<ChoiceField, ChoiceInput | null>),
});

const MESSAGES: Record<string, string> = {
  name: "Please write your name.",
  email: "Please write a valid email, like name@example.com.",
  gender: "Please choose one.",
  from: "Please write where you are from.",
  level: "Please choose your level.",
  travel: "Please write your answer, or clear it.",
  hobby: "Please write your answer, or clear it.",
  animal: "Please write your answer, or clear it.",
  dream: "Please write your answer, or clear it.",
};

function checkDraft(d: Draft): string[] {
  const errors: string[] = [];
  if (!d.name.trim()) errors.push("name");
  if (!EMAIL_RE.test(d.email.trim())) errors.push("email");
  if (!d.gender) errors.push("gender");
  if (!d.from.trim()) errors.push("from");
  if (!d.level) errors.push("level");
  for (const f of CHOICE_FIELDS) {
    const v = d[f];
    if (v?.id === "other" && !v.text?.trim()) errors.push(f);
  }
  return errors;
}

const SERVER_ERRORS: Record<string, string> = {
  too_many_requests: "Too many tries. Please wait a few minutes and try again.",
  not_configured: "Registration isn't switched on yet. Please tell your teacher.",
  not_found: "We couldn't find your registration. It may have been deleted.",
};

type Props = {
  existing?: LocalStudent;
  onSaved: (student: LocalStudent, emailSent: boolean) => void;
};

export function ProfileForm({ existing, onSaved }: Props) {
  const [draft, setDraft] = useState<Draft>(existing ? toDraft(existing) : empty);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [serverError, setServerError] = useState("");
  const [website, setWebsite] = useState(""); // spam trap, hidden from people

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => e.filter((x) => x !== key));
  };
  const err = (key: string) => (errors.includes(key) ? MESSAGES[key] : undefined);

  // Dream chips follow the chosen gender; before that, show both (صير معلّم/معلّمة).
  const g = draft.gender === "female" ? "f" : "m";
  const dreamChips: ChipOption[] = DREAMS.map((d) => ({
    id: d.id,
    en: d.en,
    ar: draft.gender || d.ar.m === d.ar.f ? d.ar[g] : `${d.ar.m}/${d.ar.f.split(" ").pop()}`,
    chat: d.chat[g],
  }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    const found = checkDraft(draft);
    setErrors(found);
    if (found.length) {
      document.getElementById(`field-${found[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/students", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          website,
          ...(existing ? { id: existing.id, token: existing.token } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && Array.isArray(data.fields)) {
        setErrors(data.fields);
      } else if (!res.ok) {
        setServerError(SERVER_ERRORS[data.error] ?? "Something went wrong. Please try again.");
      } else {
        const profile = data.profile as Profile;
        const student: LocalStudent = {
          ...profile,
          id: existing?.id ?? data.id,
          token: existing?.token ?? data.token,
        };
        saveLocalStudent(student);
        onSaved(student, Boolean(data.email));
      }
    } catch {
      setServerError("No internet connection? Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <section className="rounded-3xl bg-peach p-5 text-plum">
        <h2 className="font-display text-lg font-bold">Why we ask</h2>
        <p className="mt-1 text-sm">
          Your details are sent to your teacher at Alsama Language School, so they know who is
          practising and can send you feedback on your writing. While you practise, the app also
          shares your XP, streak and the writings you choose to submit. Your favourites are used to
          build your own Arabic introduction. Name, email, gender, where you are from and level are
          required; the rest is optional. You can change or delete your details at any time
          from <strong>My details</strong>.
        </p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" error={err("name")}>
          <input
            id="field-name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!err("name")}
            aria-describedby={err("name") ? "error-name" : undefined}
            dir="auto"
            className={inputClass}
          />
        </Field>
        <Field id="email" label="Email" error={err("email")}>
          <input
            id="field-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={LIMITS.email}
            value={draft.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={!!err("email")}
            aria-describedby={err("email") ? "error-email" : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="from" label="Where are you from?" error={err("from")}>
          <input
            id="field-from"
            type="text"
            autoComplete="country-name"
            maxLength={LIMITS.from}
            value={draft.from}
            onChange={(e) => set("from", e.target.value)}
            aria-invalid={!!err("from")}
            aria-describedby={err("from") ? "error-from" : undefined}
            dir="auto"
            placeholder="e.g. Canada"
            className={inputClass}
          />
        </Field>
      </div>

      <RadioRow
        id="gender"
        legend="Male or female?"
        hint="Arabic changes some words for men and women, so we use this to show you the right forms."
        options={GENDERS.map((g) => ({ id: g.id, label: g.en, ar: g.ar }))}
        value={draft.gender}
        onChange={(v) => set("gender", v as Gender)}
        error={err("gender")}
      />

      <RadioRow
        id="level"
        legend="Your level"
        options={LEVELS.map((l) => ({ id: l.id, label: l.en }))}
        value={draft.level}
        onChange={(v) => set("level", v as Level)}
        error={err("level")}
      />

      <div id="field-travel">
        <ChipPicker
          legend="Favourite travel destination"
          legendAr="مكاني المفضّل للسفر"
          name="travel"
          options={TRAVEL}
          value={draft.travel}
          onChange={(v) => set("travel", v)}
          error={err("travel")}
        />
      </div>
      <div id="field-hobby">
        <ChipPicker
          legend="Favourite hobby"
          legendAr="هوايتي المفضّلة"
          name="hobby"
          options={HOBBIES}
          value={draft.hobby}
          onChange={(v) => set("hobby", v)}
          error={err("hobby")}
        />
      </div>
      <div id="field-animal">
        <ChipPicker
          legend="Favourite animal"
          legendAr="حيواني المفضّل"
          name="animal"
          options={ANIMALS}
          value={draft.animal}
          onChange={(v) => set("animal", v)}
          error={err("animal")}
        />
      </div>
      <div id="field-dream">
        <ChipPicker
          legend="Your dream"
          legendAr="حلمي"
          name="dream"
          options={dreamChips}
          value={draft.dream}
          onChange={(v) => set("dream", v)}
          error={err("dream")}
        />
      </div>

      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {errors.length > 0 && (
        <p role="alert" className="font-medium text-error">
          Please check the {errors.length === 1 ? "field" : `${errors.length} fields`} marked above.
        </p>
      )}
      {serverError && (
        <p role="alert" className="font-medium text-error">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="self-start rounded-full bg-orange px-8 py-4 font-display text-lg font-bold text-on-accent shadow-sm disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : existing ? "Save changes" : "Save my details"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border-2 border-sky bg-surface px-3 py-2 text-ink aria-[invalid=true]:border-error";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={`field-${id}`} className="font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`error-${id}`} className="mt-1 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function RadioRow(props: {
  id: string;
  legend: string;
  hint?: string;
  options: Array<{ id: string; label: string; ar?: string }>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset id={`field-${props.id}`} aria-describedby={props.error ? `error-${props.id}` : undefined}>
      <legend className="font-display text-lg font-bold text-heading">{props.legend}</legend>
      {props.hint && <p className="text-sm text-muted">{props.hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {props.options.map((o) => (
          <label
            key={o.id}
            className="cursor-pointer rounded-full border-2 border-sky/60 bg-surface px-5 py-2 hover:border-orange has-[:checked]:border-plum has-[:checked]:bg-yellow has-[:checked]:text-plum has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]"
          >
            <input
              type="radio"
              name={props.id}
              value={o.id}
              checked={props.value === o.id}
              onChange={() => props.onChange(o.id)}
              className="sr-only"
            />
            {o.label}
            {o.ar && (
              <>
                {" · "}
                <span lang="ar" dir="rtl">
                  {o.ar}
                </span>
              </>
            )}
          </label>
        ))}
      </div>
      {props.error && (
        <p id={`error-${props.id}`} className="mt-1 text-sm font-medium text-error">
          {props.error}
        </p>
      )}
    </fieldset>
  );
}
