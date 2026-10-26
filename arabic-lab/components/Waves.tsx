// Soft decorative waves in sky blue and yellow, like the Alsama booklet.
export function Waves({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 w-full ${className}`}
    >
      <path
        className="fill-shape-b"
        d="M0,160 C240,240 480,80 720,140 C960,200 1200,260 1440,180 L1440,320 L0,320 Z"
      />
      <path
        className="fill-shape-a"
        opacity="0.7"
        d="M0,230 C260,180 520,300 780,250 C1040,200 1240,280 1440,240 L1440,320 L0,320 Z"
      />
    </svg>
  );
}
