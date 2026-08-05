import type { Metadata } from "next";
import "./globals.css";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: "Iqballaz Customs | Vehicle Wraps, Tint & PPF in Houston",
    template: "%s | Iqballaz Customs",
  },
  description:
    "Houston's premium vehicle customization shop. Vinyl wraps, ceramic tint, paint protection film, and Tesla-specific builds. By appointment.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: business.name,
    url: business.url,
  },
};

/**
 * Root layout — document shell only (fonts, globals). The public
 * marketing chrome (nav, footer, splash, smooth scroll, chat) lives in
 * `app/(site)/layout.tsx`; `app/admin` renders its own shell instead.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
     * suppressHydrationWarning on <html> and <body>: browser extensions
     * (dark-mode, zoom, wallet injectors) stamp attributes onto these two
     * elements before React hydrates — the reported mismatch was a
     * `class="zoom-1 dark"` that no code here writes. The flag only ignores
     * attribute diffs one level deep on these elements, so real mismatches
     * anywhere inside the app still surface.
     */
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/*
         * Fonts — Fontshare (General Sans + Satoshi) and Google (JetBrains
         * Mono). Rendered in the tree, NOT inside a hand-written <head>:
         * React 19 hoists <link> itself, and hand-authoring <head> in the App
         * Router leaves stray whitespace text nodes there that hydration then
         * reports as a mismatch. The favicon comes from app/favicon.ico
         * automatically, so it needs no tag at all.
         */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@600&f[]=satoshi@400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
