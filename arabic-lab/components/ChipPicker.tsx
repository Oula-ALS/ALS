"use client";

import { useId } from "react";
import type { ChoiceInput } from "@/lib/registration";
import { LIMITS } from "@/lib/registration";

export type ChipOption = { id: string; en: string; ar: string; chat: string };

type Props = {
  legend: string;
  legendAr: string;
  name: string;
  options: ChipOption[];
  value: ChoiceInput | null;
  onChange: (value: ChoiceInput | null) => void;
  error?: string;
};

const chip =
  "flex cursor-pointer flex-col items-center rounded-2xl border-2 px-3 py-2 text-center transition-colors " +
  "border-sky/60 bg-surface hover:border-orange " +
  "has-[:checked]:border-plum has-[:checked]:bg-yellow has-[:checked]:text-plum " +
  "has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]";

export function ChipPicker({ legend, legendAr, name, options, value, onChange, error }: Props) {
  const otherId = useId();
  const errorId = useId();
  const isOther = value?.id === "other";

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 font-display text-lg font-bold text-heading">
        {legend} ·{" "}
        <span lang="ar" dir="rtl">
          {legendAr}
        </span>{" "}
        <span className="font-sans text-sm font-normal text-muted">(optional)</span>
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {options.map((o) => (
          <label key={o.id} className={chip}>
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={value?.id === o.id}
              onChange={() => onChange({ id: o.id })}
              className="sr-only"
            />
            <span lang="ar" dir="rtl" className="text-lg font-medium">
              {o.ar}
            </span>
            <span className="text-xs opacity-80">{o.chat}</span>
            <span className="text-sm">{o.en}</span>
          </label>
        ))}
        <label className={chip}>
          <input
            type="radio"
            name={name}
            value="other"
            checked={isOther}
            onChange={() => onChange({ id: "other", text: "" })}
            className="sr-only"
          />
          <span className="text-lg" aria-hidden="true">
            ✏️
          </span>
          <span className="text-sm">Something else</span>
        </label>
      </div>

      {isOther && (
        <div className="mt-3">
          <label htmlFor={otherId} className="text-sm font-medium">
            Your answer (English, Arabic or chat letters)
          </label>
          <input
            id={otherId}
            type="text"
            autoFocus
            maxLength={LIMITS.other}
            value={value?.text ?? ""}
            onChange={(e) => onChange({ id: "other", text: e.target.value })}
            dir="auto"
            className="mt-1 w-full rounded-xl border-2 border-sky bg-surface px-3 py-2"
          />
        </div>
      )}

      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-sm text-muted underline"
        >
          Clear
        </button>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
