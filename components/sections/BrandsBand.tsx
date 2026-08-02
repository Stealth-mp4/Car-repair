import type { ReactNode } from "react";

type Brand = {
  name: string;
  href: string;
  /** Logo artwork. STEK only ships a mark, so it renders `node` instead. */
  logo?: string;
  node?: ReactNode;
  /** Per-brand height — the artwork is not optically consistent across brands. */
  h: string;
};

/**
 * The film, tint and coating brands the shop carries. Logos keep their own
 * colours; where a brand's primary artwork is black ink (Avery Dennison,
 * LLumar, TinyBot, Inozetek) the file in /public/brands is the reversed
 * white version, since the band sits on a black plate.
 */
const BRANDS: Brand[] = [
  { name: "TinyBot", href: "https://www.tinybotfilm.com", logo: "/brands/tinybot.svg", h: "h-5 sm:h-6" },
  { name: "XPEL", href: "https://www.xpel.com", logo: "/brands/xpel.svg", h: "h-5 sm:h-6" },
  {
    name: "STEK",
    href: "https://stekautomotive.com",
    h: "h-7 sm:h-8",
    node: (
      <span className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- static logo art */}
        <img src="/brands/stek-mark.svg" alt="" className="h-7 w-auto sm:h-8" />
        <span className="font-display text-xl font-bold tracking-[0.08em] text-ink sm:text-2xl">
          STEK
        </span>
      </span>
    ),
  },
  {
    name: "Avery Dennison",
    href: "https://graphics.averydennison.com",
    logo: "/brands/avery-dennison.svg",
    h: "h-6 sm:h-7",
  },
  { name: "3M", href: "https://www.3m.com", logo: "/brands/3m.svg", h: "h-7 sm:h-8" },
  { name: "Inozetek", href: "https://inozetek.com", logo: "/brands/inozetek.png", h: "h-4 sm:h-5" },
  { name: "KPMF", href: "https://www.kpmf.com", logo: "/brands/kpmf.png", h: "h-7 sm:h-8" },
  { name: "HEXIS", href: "https://www.hexis-graphics.com", logo: "/brands/hexis.svg", h: "h-6 sm:h-7" },
  { name: "ORAFOL", href: "https://www.orafol.com", logo: "/brands/oracal.png", h: "h-7 sm:h-8" },
  { name: "SunTek", href: "https://www.suntekfilms.com", logo: "/brands/suntek.svg", h: "h-5 sm:h-6" },
  { name: "LLumar", href: "https://www.llumar.com", logo: "/brands/llumar.png", h: "h-5 sm:h-6" },
  { name: "Gtechniq", href: "https://gtechniq.com", logo: "/brands/gtechniq.svg", h: "h-6 sm:h-7" },
];

const LeadIn = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <span aria-hidden="true" className="text-2xl font-semibold italic leading-none text-red">
      //
    </span>
    <span>
      <span className="mono-label block text-ink">Trusted by the industry</span>
      <span className="mt-1 block text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
        Premium vinyl, tint &amp; protection brands
      </span>
    </span>
  </div>
);

const Logo = ({ brand }: { brand: Brand }) =>
  brand.node ?? (
    // eslint-disable-next-line @next/next/no-img-element -- static logo art, no raster optimization needed
    <img src={brand.logo} alt={brand.name} className={`${brand.h} w-auto`} />
  );

/**
 * Brands band (V5) — static grid on desktop, auto-scrolling marquee on mobile,
 * matching the reference site. Both render the same list from BRANDS; the
 * mobile strip is duplicated once so its loop is seamless.
 */
export default function BrandsBand() {
  const strip = (
    <div className="flex w-max shrink-0 items-center">
      <LeadIn className="shrink-0 pr-2" />
      {BRANDS.map((brand) => (
        <span key={brand.name} className="flex shrink-0 items-center border-l border-line px-8">
          <Logo brand={brand} />
        </span>
      ))}
      <span className="w-8 shrink-0 border-l border-line" />
    </div>
  );

  return (
    <section
      aria-label="Brands we work with"
      className="overflow-hidden border-y border-line py-8 md:py-14"
    >
      {/* Desktop — static, no motion */}
      <div className="hidden md:block" style={{ paddingInline: "var(--gutter)" }}>
        <LeadIn />
        <div className="mt-10 grid grid-cols-4 items-center justify-items-center gap-x-10 gap-y-9 lg:grid-cols-6">
          {BRANDS.map((brand) => (
            <a
              key={brand.name}
              href={brand.href}
              target="_blank"
              rel="noreferrer"
              aria-label={brand.name}
              className="flex items-center opacity-90 transition-opacity hover:opacity-100"
            >
              <Logo brand={brand} />
            </a>
          ))}
        </div>
      </div>

      {/* Mobile — continuous marquee */}
      <div className="md:hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          className="marquee-track flex w-max items-center"
          style={{ animation: "marquee 32s linear infinite" }}
        >
          {strip}
          {/* Second pass exists only to close the loop — not announced twice. */}
          <div aria-hidden="true" className="contents">
            {strip}
          </div>
        </div>
      </div>
    </section>
  );
}
