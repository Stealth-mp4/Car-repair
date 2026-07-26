import Reveal from "@/components/ui/Reveal";

/**
 * PLACEHOLDER BRAND LIST — not Iqballaz's confirmed partners. The client
 * asked to populate this section with real, recognizable brand logos from
 * the industry (film/coating/automotive) as a stand-in until they send the
 * actual brands they carry. Swap this array — and only this array — once
 * that list arrives; nothing else in this component should need to change.
 */
const BRANDS = [
  { name: "3M", href: "https://www.3m.com", logo: "/brands/3m.svg" },
  {
    name: "Avery Dennison",
    href: "https://www.averydennison.com",
    logo: "/brands/avery-dennison.svg",
  },
  { name: "BASF", href: "https://www.basf.com", logo: "/brands/basf.svg" },
  { name: "Brembo", href: "https://www.brembo.com", logo: "/brands/brembo.svg" },
  { name: "Pirelli", href: "https://www.pirelli.com", logo: "/brands/pirelli.svg" },
];

/**
 * Brands band (V5) — "premium brands we work with." Logos only, no card/bar
 * background — they sit directly on the page. Every logo forced to a single
 * white silhouette (brightness-0 invert) so the row reads as one restrained,
 * monochrome strip regardless of each brand's own source colours, and each
 * logo links out to the real brand site.
 */
export default function BrandsBand() {
  return (
    <section className="py-16 md:py-20" style={{ paddingInline: "var(--gutter)" }}>
      <Reveal className="text-center">
        <p className="mono-label">Premium brands we work with</p>
        <p className="mt-3 text-cream">
          Only industry-leading film and coating brands go on your vehicle.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
        {BRANDS.map((brand, i) => (
          <Reveal key={brand.name} delay={i * 0.06} y={12}>
            <a
              href={brand.href}
              target="_blank"
              rel="noreferrer"
              aria-label={brand.name}
              className="opacity-60 grayscale brightness-0 invert transition-opacity hover:opacity-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG, no raster optimization needed */}
              <img src={brand.logo} alt={brand.name} className="h-7 w-auto sm:h-8" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
