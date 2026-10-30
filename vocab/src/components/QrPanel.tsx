import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Ar from "./Ar";

interface Props {
  url: string;
  level: string;
  title: string;
  titleIsArabic: boolean;
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Opens a one-page handout (logo, unit, big QR code, link) in a new window and prints it. */
function printHandout(svg: string, url: string, level: string, title: string, titleIsArabic: boolean) {
  const w = window.open("", "_blank", "width=720,height=960");
  if (!w) return window.print(); // pop-ups blocked: print this page instead
  w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)} · Alsama Vocab</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&family=Nunito:wght@400;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 18mm; }
  body { margin: 0; font-family: Nunito, sans-serif; color: #000; background: #fff; text-align: center; }
  img { height: 70px; } .level { color: #B7155A; font-weight: 800; margin: 18px 0 4px; font-size: 18px; }
  h1 { margin: 0; font-size: 34px; } h1[lang="ar"] { font-family: "Noto Naskh Arabic", serif; direction: rtl; }
  .scan { font-size: 20px; margin: 14px 0 20px; } .qr svg { width: 110mm; height: auto; } .url { font-size: 16px; word-break: break-all; margin-top: 12px; }
</style></head><body>
<img src="${window.location.origin}/images/logo.png" alt="Alsama Language School">
<p class="level">${esc(level)}</p>
<h1${titleIsArabic ? ' lang="ar" dir="rtl"' : ""}>${esc(title)}</h1>
<p class="scan">Scan to practise these words on your phone</p>
<div class="qr">${svg}</div>
<p class="url">${esc(url)}</p>
</body></html>`);
  w.document.close();
  w.onload = () => {
    w.focus();
    w.print();
  };
}

/** QR code for the unit link, with a print-ready handout for class. */
export default function QrPanel({ url, level, title, titleIsArabic }: Props) {
  const [open, setOpen] = useState(false);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (!open || svg) return;
    // Black on white so it scans and prints well, also in dark mode.
    QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [open, svg, url]);

  if (!open) {
    return (
      <button type="button" className="btn-ghost" onClick={() => setOpen(true)}>
        ▦ QR code for handouts
      </button>
    );
  }

  return (
    <div className="card w-full p-5 text-center">
      <p className="text-sm font-bold text-brand">{level}</p>
      {titleIsArabic ? <Ar className="block text-2xl font-bold">{title}</Ar> : <p className="text-2xl font-extrabold">{title}</p>}
      <div
        className="mx-auto mt-3 w-full max-w-64 overflow-hidden rounded-xl bg-white [&>svg]:h-auto [&>svg]:w-full"
        role="img"
        aria-label={`QR code for ${url}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-2 break-all text-sm text-muted">{url}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" className="btn-primary" disabled={!svg} onClick={() => printHandout(svg, url, level, title, titleIsArabic)}>
          🖨 Print
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
