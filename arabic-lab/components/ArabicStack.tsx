// Arabic (right-to-left), then chat spelling, then English underneath.
export function ArabicStack({
  ar,
  chat,
  en,
  size = "md",
  showChat = true,
  showEn = true,
}: {
  ar: string;
  chat?: string;
  en?: string;
  size?: "md" | "lg" | "xl";
  showChat?: boolean;
  showEn?: boolean;
}) {
  const arSize = { md: "text-2xl", lg: "text-4xl", xl: "text-5xl" }[size];
  return (
    <span className="flex flex-col items-center text-center">
      <span lang="ar" dir="rtl" className={`font-display font-bold text-heading ${arSize}`}>
        {ar}
      </span>
      {showChat && chat && <span className="text-sm text-muted">{chat}</span>}
      {showEn && en && <span>{en}</span>}
    </span>
  );
}
