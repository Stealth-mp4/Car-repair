import type { Metadata } from "next";
import ServiceShowcase, { type ShowcaseItem } from "@/components/ui/ServiceShowcase";
import MagneticButton from "@/components/ui/MagneticButton";
import { services, business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Wraps, ceramic tint, paint protection film, starlight headliners, and wheels at Iqballaz Customs in Houston.",
};

export default function ServicesIndexPage() {
  const items: ShowcaseItem[] = services.map((s) => ({
    href: s.href,
    title: s.title,
    image: s.image,
    alt: s.title,
    eyebrow: s.filmBrand ? `${s.filmBrand} — certified install` : business.wordmark,
    caption: s.short,
  }));

  return (
    <section className="min-h-[70vh] pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <p className="mono-label">Services</p>
      <h1 className="display mt-4 max-w-3xl text-ink">What we do.</h1>
      <p className="mt-5 max-w-xl text-muted">
        Every build starts with the same shop, the same hands, and the same film brands —
        picked below by what you're here for.
      </p>

      <div className="mt-14">
        <ServiceShowcase items={items} />
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-12">
        <MagneticButton href="/quote" variant="primary">
          Get a Quote
        </MagneticButton>
        <p className="mono-label text-muted">{business.trust}</p>
      </div>
    </section>
  );
}
