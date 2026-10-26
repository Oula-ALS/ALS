import type { Metadata, Viewport } from "next";
import { Baloo_Bhaijaan_2, Readex_Pro } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const baloo = Baloo_Bhaijaan_2({
  variable: "--font-baloo",
  subsets: ["arabic", "latin"],
  weight: ["500", "700", "800"],
});

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Alsama Arabic Lab",
  description:
    "Practise Levantine Arabic between classes at Alsama Language School.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0f22" },
  ],
};

// Applies a saved light/dark choice before the page paints (no flash).
const themeScript = `try{var t=localStorage.getItem("alsama-lab:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${baloo.variable} ${readex.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
