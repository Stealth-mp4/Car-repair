import Link from "next/link";
import Image from "next/image";
import { services } from "@/lib/site";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

/**
 * Our Services (V4 — bugatti.com "OUR HYPER SPORTS CARS" grid reference) —
 * a boxed dark grid of poster cards: small mono tagline top, big italic
 * display name mid-lower, "LEARN MORE" mono link at the bottom edge. Two
 * columns of paired cards, the odd one out spans full width.
 */
function PosterCard({
  href,
  title,
  short,
  image,
  alt,
  filmBrand,
  className = "",
}: {
  href: string;
  title: string;
  short: string;
  image: string;
  alt: string;
  filmBrand?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`media-frame group relative block ${className}`}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-black/40" />

      <p className="mono-label absolute inset-x-5 top-5 text-ink/70">{short}</p>

      {filmBrand ? (
        <span className="mono-label absolute right-5 top-5 rounded-full border border-line bg-black/60 px-2 py-1">
          {filmBrand}
        </span>
      ) : null}

      <div className="absolute inset-x-5 bottom-5">
        <h3 className="display text-3xl italic text-ink md:text-4xl">{title}</h3>
        <span className="reveal-mask mt-2 block">
          <span className="mono-label block translate-y-full transition-transform duration-[450ms] ease-brand group-hover:translate-y-0">
            Learn more
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedServices() {
  const [a, b, c, d, e] = services;

  return (
    <section
      className="border-y border-line bg-black-raised py-20 md:py-28"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="mono-label">Our services</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["Five disciplines, one standard."]}
            className="mt-3 max-w-md font-display text-2xl text-ink sm:text-3xl"
          />
        </div>
        <Link href="/services" className="link-underline text-sm text-cream">
          All services →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[a, b, c, d].map((item, i) =>
          item ? (
            <Reveal key={item.href} delay={i * 0.08} className="aspect-[4/5]">
              <PosterCard
                href={item.href}
                title={item.title}
                short={item.short}
                image={item.image}
                alt={`${item.title} — Iqballaz Customs`}
                filmBrand={item.filmBrand}
                className="h-full"
              />
            </Reveal>
          ) : null
        )}
        {e ? (
          <Reveal delay={0.32} className="aspect-[16/9] md:col-span-2">
            <PosterCard
              href={e.href}
              title={e.title}
              short={e.short}
              image={e.image}
              alt={`${e.title} — Iqballaz Customs`}
              filmBrand={e.filmBrand}
              className="h-full"
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
