import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import BuildCard from "@/components/ui/BuildCard";
import Faq, { type FaqItem } from "@/components/ui/Faq";
import RevealLines from "@/components/ui/RevealLines";
import ServiceShowcase, { type ShowcaseItem } from "@/components/ui/ServiceShowcase";
import { filterBuilds } from "@/lib/builds";

export const metadata: Metadata = {
  // Targets "Tesla Wrap Houston" specifically (build.md SEO).
  title: "Tesla Wrap Houston — Wraps, Tint & PPF for Model 3/Y/S/X",
  description:
    "Tesla-specific wraps, ceramic tint, and paint protection film in Houston. PPF for panel gaps, tint for range and heat, colour-change for Model 3, Y, S, X and Cybertruck. Iqballaz Customs.",
};

const REASONS: ShowcaseItem[] = [
  {
    href: "/services/paint-protection-film",
    image: "/PPF.webp",
    alt: "Paint protection film applied to a Tesla's front end",
    eyebrow: "Paint protection film",
    title: "PPF for the chip zones",
    caption:
      "Tesla frunk edges, rockers, and the low nose take chips fast. Film on the high-impact areas keeps resale paint clean.",
  },
  {
    href: "/services/ceramic-tint",
    image: "/WINDOW_TINT.webp",
    alt: "Ceramic window tint on a Tesla glass roof",
    eyebrow: "Ceramic tint",
    title: "Tint for range & heat",
    caption:
      "Ceramic tint cuts cabin and glass-roof heat, so the AC — and the battery behind it — works less in a Houston summer.",
  },
  {
    href: "/services/vehicle-wraps",
    image: "/VINYL_WRAP.webp",
    alt: "Colour-change vinyl wrap on a Tesla",
    eyebrow: "Vehicle wraps",
    title: "Wraps sized to the model",
    caption:
      "Colour-change cut for Model 3, Y, S, and X — and Cybertruck stainless, which we wrap so it reads as paint.",
  },
  {
    href: "/about",
    image: "/DSC_4434.webp",
    alt: "Tesla Cybertruck in satin black wrap in the Houston studio",
    eyebrow: "Iqballaz Customs",
    title: "One shop, by appointment",
    caption:
      "No franchise counter. The same hands that quote your Tesla do the install and check every edge.",
    ctaLabel: "About the shop",
  },
];

const TESLA_FAQS: FaqItem[] = [
  {
    q: "Does a wrap or PPF void my Tesla warranty?",
    a: "No. A wrap or paint protection film sits on top of the factory paint and doesn't touch the mechanical, electrical, or battery warranty.",
  },
  {
    q: "Can you tint the glass roof?",
    a: "Yes. A ceramic tint across the panoramic roof cuts a large share of the overhead heat Model 3 and Y owners feel in summer.",
  },
  {
    q: "Will tint actually help my range?",
    a: "Indirectly. Less cabin heat means less air-conditioning load, and in Houston heat that shows up as better efficiency.",
  },
  {
    q: "Can you wrap a Cybertruck?",
    a: "Yes — regularly. Stainless is one of our specialties, and we wrap edges so there's no visible steel and it reads as a painted finish.",
  },
  {
    q: "Which finish suits a Model 3 or Y best?",
    a: "Satin and stealth finishes are the most popular and hide road grime well. We'll show you options against your own car before you commit.",
  },
];

export default function TeslaHubPage() {
  const teslas = filterBuilds({ make: "Tesla" });
  const quoteHref = "/quote?make=Tesla";

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[80svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/DSC_4434.webp"
            alt="Tesla Cybertruck in satin black wrap under studio light"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="graded object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent" />
        </div>
        <div className="relative z-10 pb-16" style={{ paddingInline: "var(--gutter)" }}>
          <p className="mono-label text-red">Tesla Hub · Houston</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 text-ink"
            lines={["Tesla Wrap Houston.", "Dialed for Model 3/Y/S/X."]}
          />
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href={quoteHref} variant="primary">
              Get a Tesla Quote
            </MagneticButton>
            <Link href="/gallery?make=tesla" className="link-underline text-ink">
              See Tesla builds
            </Link>
          </div>
        </div>
      </section>

      {/* Why Tesla owners choose us */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <p className="mono-label">Why Tesla owners choose us</p>
        <div className="mt-8">
          <ServiceShowcase items={REASONS} />
        </div>
      </section>

      {/* Tesla gallery embed (make=tesla) */}
      {teslas.length > 0 ? (
        <section className="pb-8" style={{ paddingInline: "var(--gutter)" }}>
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-4xl font-semibold text-ink">Tesla builds.</h2>
            <Link href="/gallery?make=tesla" className="link-underline text-sm text-muted">
              View all
            </Link>
          </div>
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {teslas.map((b, i) => (
              <BuildCard key={b.slug} build={b} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Tesla-specific FAQ + schema */}
      <Faq items={TESLA_FAQS} heading="Tesla questions" />

      {/* CTA band */}
      <section
        className="border-t border-line bg-black-raised py-24 md:py-28"
        style={{ paddingInline: "var(--gutter)" }}
      >
        <RevealLines
          as="h2"
          className="display max-w-4xl text-ink"
          lines={["Your Tesla,", "built right."]}
        />
        <div className="mt-10">
          <MagneticButton href={quoteHref} variant="paper">
            Start a Tesla quote
          </MagneticButton>
        </div>
      </section>
    </>
  );
}
