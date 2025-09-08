import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MusicSwipe",
  description: "Découvrez et likez de la musique avec MusicSwipe.",
  applicationName: "MusicSwipe",
  themeColor: "#111827",
  manifest: "/manifest.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    title: "MusicSwipe",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/assets/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/assets/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/assets/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: [
      { url: "/assets/branding/logo.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
