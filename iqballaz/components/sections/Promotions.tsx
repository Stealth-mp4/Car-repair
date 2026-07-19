import MagneticButton from "@/components/ui/MagneticButton";
import { promo } from "@/lib/site";

/**
 * Current Promotions (section 4) — full-bleed ember-on-graphite band, ONE live
 * offer at a time. This is the single place ember gets real weight. Edit or
 * disable the offer in lib/site.ts `promo`.
 */
export default function Promotions() {
  if (!promo.active) return null;

  return (
    <section className="border-y border-line bg-surface">
      <div
        className="flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16"
        style={{ paddingInline: "var(--gutter)" }}
      >
        <div className="max-w-2xl">
          <p className="mono-label text-ember">{promo.label}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.02] text-ink sm:text-4xl md:text-5xl">
            {promo.headline}
          </h2>
          <p className="mt-4 text-muted">{promo.detail}</p>
        </div>
        <div className="shrink-0">
          <MagneticButton href={promo.cta.href} variant="primary">
            {promo.cta.label}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
