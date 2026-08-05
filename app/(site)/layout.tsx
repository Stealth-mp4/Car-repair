import SmoothScroll from "@/components/ui/SmoothScroll";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ChatWidget from "@/components/ui/ChatWidget";
import SplashScreen from "@/components/ui/SplashScreen";
import { business, openingHours } from "@/lib/site";

// LocalBusiness + AutoRepair schema (build.md SEO). NAP from lib/site.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["AutoRepair", "LocalBusiness"],
  name: business.name,
  url: business.url,
  image: `${business.url}/logo.webp`,
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

/**
 * Public marketing chrome. `app/admin` deliberately sits outside this group.
 *
 * `grain` lives here rather than on <body>: it paints a fixed, full-viewport
 * SVG-noise layer at z-60, which the admin console has no business carrying.
 * It's a brand device for the marketing site, and in the console it sat above
 * the mobile nav drawer (z-50) — a full-viewport fixed layer that a mobile GPU
 * has to re-rasterise every time another fixed layer appears under it.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grain">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SplashScreen />
      <SmoothScroll>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </SmoothScroll>
      <ChatWidget />
    </div>
  );
}
