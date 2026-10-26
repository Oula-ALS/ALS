import Link from "next/link";

// Placeholder until Stage 4 builds the home screen.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-heading">Home</h1>
      <p className="mt-4 text-muted">The home screen is coming in a later stage.</p>
      <Link href="/" className="mt-8 inline-block font-medium text-accent-text underline">
        Back to welcome
      </Link>
    </div>
  );
}
