import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "MusicSwipe",
    short_name: "MusicSwipe",
    description:
      "Découvrez et likez de la musique avec MusicSwipe.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#111827",
    lang: "fr-FR",
    dir: "ltr",
    categories: ["music", "entertainment"],
    icons: [
      { src: "/assets/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/assets/icons/maskable-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/assets/icons/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Découvrir",
        url: "/",
      },
    ],
    prefer_related_applications: false,
  };
}
