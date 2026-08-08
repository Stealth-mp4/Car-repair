import Link from "next/link";
import Image from "next/image";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import ClipReveal from "@/components/ui/ClipReveal";

/**
 * About teaser (V5 homepage) — the shop's own story in brief, one still image
 * of the storefront, generous space on the left (never both sides). Copy
 * mirrors the confirmed /about page voice rather than inventing new claims.
 */
export default function AboutTeaser() {
  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-8">
        <div className="md:col-span-6">
          <Reveal>
            <p className="mono-label">About</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["Built One Car at a Time."]}
            className="display mt-4 text-4xl text-ink sm:text-5xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-lg text-cream">
              Every vehicle that enters IQBALLAZ is treated like a flagship build. No
              production lines. No rushed installs. Just obsessive craftsmanship,
              precision, and results that speak for themselves.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/about" className="link-underline mt-7 inline-block text-sm text-ink">
              Discover Our Story →
            </Link>
          </Reveal>
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <ClipReveal className="media-frame relative aspect-[4/5]">
            <Image
              src="/client/about-shop-night.webp"
              alt="Iqballaz Customs storefront at night"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="graded object-cover"
            />
          </ClipReveal>
        </div>
      </div>
    </section>
  );
}
