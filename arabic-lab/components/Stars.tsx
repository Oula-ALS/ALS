export function Stars({ value, size = "text-lg" }: { value: number; size?: string }) {
  return (
    <span role="img" aria-label={`${value} of 3 stars`} className={`whitespace-nowrap ${size}`}>
      {[1, 2, 3].map((n) => (
        <span key={n} aria-hidden="true" className={n <= value ? "" : "opacity-25 grayscale"}>
          ⭐
        </span>
      ))}
    </span>
  );
}
