// Student details: shared by the form (browser) and the API (server), so both
// check the same rules. The server never trusts Arabic/chat text sent by the
// browser for a chip; it looks the chip up again by its id.

import {
  ANIMALS,
  DREAMS,
  GENDERS,
  HOBBIES,
  LEVELS,
  TRAVEL,
  type Option,
} from "./profile-options";

export type Gender = (typeof GENDERS)[number]["id"];
export type Level = (typeof LEVELS)[number]["id"];

/** What the form sends for one picker: a chip id, or "other" with free text. */
export type ChoiceInput = { id: string; text?: string };
/** What we store: the chip in all three scripts, or the student's own words. */
export type Choice = Option | { id: "other"; text: string };

export type Profile = {
  name: string;
  email: string;
  gender: Gender;
  from: string;
  level: Level;
  travel: Choice | null;
  hobby: Choice | null;
  animal: Choice | null;
  dream: Choice | null;
};

export type ProfileInput = Omit<Profile, "travel" | "hobby" | "animal" | "dream"> & {
  travel: ChoiceInput | null;
  hobby: ChoiceInput | null;
  animal: ChoiceInput | null;
  dream: ChoiceInput | null;
};

export const CHOICE_FIELDS = ["travel", "hobby", "animal", "dream"] as const;
export type ChoiceField = (typeof CHOICE_FIELDS)[number];

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const LIMITS = { name: 60, email: 254, from: 60, other: 60 };

function clean(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

/** Turns a chip id into the full option (dream uses the student's gender). */
export function resolveChoice(
  field: ChoiceField,
  input: ChoiceInput | null | undefined,
  gender: Gender,
): Choice | null {
  if (!input || typeof input.id !== "string") return null;
  if (input.id === "other") {
    const text = clean(input.text, LIMITS.other);
    return text ? { id: "other", text } : null;
  }
  if (field === "dream") {
    const d = DREAMS.find((o) => o.id === input.id);
    if (!d) return null;
    const g = gender === "female" ? "f" : "m";
    return { id: d.id, en: d.en, ar: d.ar[g], chat: d.chat[g] };
  }
  const list = field === "travel" ? TRAVEL : field === "hobby" ? HOBBIES : ANIMALS;
  return list.find((o) => o.id === input.id) ?? null;
}

/** Short English label for emails and the teacher table. */
export function choiceLabel(choice: Choice | null): string {
  if (!choice) return "–";
  if (choice.id === "other") return `${(choice as { text: string }).text} (own answer)`;
  const c = choice as Option;
  return `${c.en} · ${c.ar} · ${c.chat}`;
}

export function validateProfile(body: unknown): { profile: Profile; errors: string[] } {
  const b = (body ?? {}) as Record<string, unknown>;
  const gender = (GENDERS.some((g) => g.id === b.gender) ? b.gender : "") as Gender;
  const level = (LEVELS.some((l) => l.id === b.level) ? b.level : "") as Level;
  const profile: Profile = {
    name: clean(b.name, LIMITS.name),
    email: clean(b.email, LIMITS.email).toLowerCase(),
    gender,
    from: clean(b.from, LIMITS.from),
    level,
    travel: null,
    hobby: null,
    animal: null,
    dream: null,
  };
  const errors: string[] = [];
  if (!profile.name) errors.push("name");
  if (!EMAIL_RE.test(profile.email)) errors.push("email");
  if (!gender) errors.push("gender");
  if (!profile.from) errors.push("from");
  if (!level) errors.push("level");

  for (const field of CHOICE_FIELDS) {
    const input = b[field] as ChoiceInput | null | undefined;
    const choice = resolveChoice(field, input, gender || "male");
    // A chip was picked but it doesn't exist, or "other" was left empty.
    if (input && input.id && !choice) errors.push(field);
    profile[field] = choice;
  }
  return { profile, errors };
}
