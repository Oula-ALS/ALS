import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alsama Arabic Lab",
    short_name: "Arabic Lab",
    description: "Practise Levantine Arabic between classes at Alsama Language School.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#351b4a",
    lang: "en",
    categories: ["education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
