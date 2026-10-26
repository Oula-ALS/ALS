import Link from "next/link";

// Placeholder until Stage 3 builds the student details form.
export default function StartPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-heading">Student details</h1>
      <p className="mt-4 text-muted">
        The registration form is coming in the next stage.
      </p>
      <Link href="/" className="mt-8 inline-block font-medium text-accent-text underline">
        Back to welcome
      </Link>
    </div>
  );
}
