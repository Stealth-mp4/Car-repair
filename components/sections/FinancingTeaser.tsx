import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import ClipReveal from "@/components/ui/ClipReveal";

const POINTS = [
  { title: "Spread the cost", body: "Break a wrap, PPF, or multi-service build into manageable payments." },
  { title: "Apply with your quote", body: "Tell us you'd like to finance when you request a quote — no separate trip." },
  { title: "Full build covered", body: "Financing applies to the whole build, current promotions included." },
];

/**
 * Financing teaser (V5 homepage) — short intro + the same confirmed value
 * props as the /financing page (no invented lender names/logos), one real
 * photo, CTA into the dedicated page.
 */
export default function FinancingTeaser() {
  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-8">
        <div className="md:col-span-5">
          <Reveal>
            <p className="mono-label">Financing</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["Build now. Pay over time."]}
            className="display mt-4 text-4xl text-ink sm:text-5xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-cream">
              Split the cost of your build across manageable terms — apply when you
              request a quote, no separate trip.
            </p>
          </Reveal>

          <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-1">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={0.15 + i * 0.08}>
                <p className="mono-label text-maroon">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-lg text-ink">{p.title}</h3>
                <p className="mt-1 text-sm text-cream/80">{p.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href="/financing" variant="ghost">
              See terms
            </MagneticButton>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <ClipReveal className="media-frame relative aspect-[4/3]">
            <Image
              src="/wheel_powder_coat.webp"
              alt="Freshly powder-coated wheel — financing available on the full build"
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              className="graded object-cover"
            />
          </ClipReveal>
        </div>
      </div>
    </section>
  );
}
