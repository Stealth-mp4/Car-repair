import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ChatWidget from "@/components/ui/ChatWidget";
import { business, openingHours } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: "Iqballaz Customs — Vehicle Wraps, Tint & PPF in Houston",
    template: "%s — Iqballaz Customs",
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

// LocalBusiness + AutoRepair schema (build.md SEO). NAP from lib/site.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["AutoRepair", "LocalBusiness"],
  name: business.name,
  url: business.url,
  image: `${business.url}/logo.jpg`,
  telephone: "+18322081071",
  priceRange: business.priceRange,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.locality,
    addressRegion: business.address.region,
    postalCode: business.address.postalCode,
    addressCountry: business.address.country,
  },
  openingHoursSpecification: openingHours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Fonts — Fontshare via <link> (General Sans + Satoshi), JetBrains Mono via Google */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@600&f[]=satoshi@400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="grain">
        <SmoothScroll>
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </SmoothScroll>
        <ChatWidget />
      </body>
    </html>
  );
}
