import Link from "next/link";
import Image from "next/image";

/**
 * Tesla Hub cinematic band (V4 — bugatti.com "Solitaire" reference) — full-bleed
 * image, centered content: small eyebrow, large italic display headline, short
 * caption, underline link. Replaces the old split-grid teaser.
 */
export default function TeslaTeaser() {
  return (
    <section className="relative flex min-h-[72svh] flex-col items-center justify-center overflow-hidden border-b border-line">
      <div className="absolute inset-0">
        <Image
          src="/DSC_4436.jpeg"
          alt="Tesla Cybertruck in satin black wrap under studio light"
          fill
          sizes="100vw"
          className="graded object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mono-label">Tesla Hub</p>
        <h2 className="display mt-4 max-w-3xl text-ink italic">
          Built around the cars we know best.
        </h2>
        <p className="mt-5 max-w-xl text-muted">
          PPF for panel gaps, tint for range and heat, and colour-change sized to
          Model 3, Y, S, X — and the Cybertruck.
        </p>
        <Link href="/tesla" className="link-underline mt-7 text-sm text-ink">
          Explore Tesla Hub
        </Link>
      </div>
    </section>
  );
}
