import Link from "next/link";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import ParallaxImage from "@/components/ui/ParallaxImage";

/**
 * Tesla Hub cinematic band (V4 — bugatti.com "Solitaire" reference) — full-bleed
 * image, centered content: small eyebrow, large italic display headline, short
 * caption, underline link. Replaces the old split-grid teaser.
 */
export default function TeslaTeaser() {
  return (
    <section className="relative flex min-h-[72svh] flex-col items-center justify-center overflow-hidden border-b border-line">
      <ParallaxImage
        src="/DSC_4436.webp"
        alt="Tesla Cybertruck in satin black wrap under studio light"
        className="absolute inset-0"
        overlayClassName="bg-black/60"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <Reveal>
          <p className="mono-label">Tesla Hub</p>
        </Reveal>
        <RevealLines
          as="h2"
          lines={["Built around the cars we know best."]}
          className="display mt-4 max-w-3xl text-ink italic"
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-muted">
            PPF for panel gaps, tint for range and heat, and colour-change sized to
            Model 3, Y, S, X — and the Cybertruck.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <Link href="/tesla" className="link-underline mt-7 text-sm text-ink">
            Explore Tesla Hub
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
