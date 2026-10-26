import Image from "next/image";

// Plum logo in light mode, lightened logo in dark mode (swapped in CSS).
export function Logo({ width = 140, priority = false }: { width?: number; priority?: boolean }) {
  const height = Math.round((width * 165) / 481);
  return (
    <span className="inline-block" style={{ width, height }}>
      <Image
        src="/brand/alsama-logo.png"
        alt="Alsama Language School"
        width={width}
        height={height}
        priority={priority}
        className="logo-light"
      />
      <Image
        src="/brand/alsama-logo-light.png"
        alt="Alsama Language School"
        width={width}
        height={height}
        priority={priority}
        className="logo-dark"
      />
    </span>
  );
}
