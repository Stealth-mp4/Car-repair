import Link from "next/link";
import Image from "next/image";

/**
 * Tesla Hub teaser (section 5) — dedicated asymmetric block: large Tesla build
 * photo left (col-span-8), copy + link right (col-span-4). Signals the advertising
 * focus without dumping the whole /tesla page here.
 */
export default function TeslaTeaser() {
  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-12">
        <div className="media-frame relative aspect-[16/10] md:col-span-8">
          <Image
            src="/DSC_4436.jpeg"
            alt="Tesla Cybertruck in satin black wrap under studio light"
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="graded object-cover"
          />
        </div>

        <div className="flex flex-col justify-center md:col-span-4">
          <p className="mono-label text-ember">Tesla Hub</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.02] text-ink">
            Built around the cars we know best.
          </h2>
          <p className="mt-4 text-muted">
            PPF for panel gaps, tint for range and heat, and colour-change sized to
            Model 3, Y, S, X — and the Cybertruck.
          </p>
          <Link href="/tesla" className="link-underline mt-6 self-start text-ink">
            Explore Tesla Hub
          </Link>
        </div>
      </div>
    </section>
  );
}
