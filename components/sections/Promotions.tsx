import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import { activePromos } from "@/lib/site";

/**
 * Current Promotions (V4 — bugatti.com "SUR MESURE" split-panel reference) —
 * large image left, dark copy panel right, a thin decorative progress rule
 * under the whole block. This is the single place red gets real weight (the
 * eyebrow + the CTA fill) — the background itself stays black, never red.
 */
export default function Promotions() {
  const promo = activePromos()[0];
  if (!promo) return null;

  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <p className="mono-label">Current offer</p>
      <p className="mt-2 max-w-xl text-muted">
        One live package at a time, booked as a single build.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-12">
        <div className="media-frame relative aspect-[4/3] md:col-span-5">
          <Image
            src={promo.image}
            alt="Vinyl wrap detail: current promotion"
            fill
            sizes="(max-width: 768px) 100vw, 42vw"
            className="graded object-cover"
          />
        </div>

        <div className="flex flex-col justify-center bg-black-raised px-8 py-10 md:col-span-7 md:px-14">
          <p className="mono-label text-red">{promo.label}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.02] text-ink sm:text-4xl md:text-5xl">
            {promo.headline}
          </h2>
          <p className="mt-4 max-w-md text-muted">{promo.detail}</p>
          <div className="mt-7">
            <MagneticButton href={promo.cta.href} variant="primary">
              {promo.cta.label}
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Thin decorative progress rule */}
      <div className="mt-px h-px w-full bg-line">
        <div className="h-px w-1/4 bg-red" />
      </div>
    </section>
  );
}
