import Link from "next/link";
import Image from "next/image";
import { services } from "@/lib/site";
import MagneticButton from "@/components/ui/MagneticButton";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

/**
 * Our Services (V4 — bugatti.com "OUR HYPER SPORTS CARS" grid reference) —
 * a boxed dark grid of poster cards: big italic display name at the bottom
 * edge, "LEARN MORE" mono link beneath it. Two columns of paired cards.
 */
function PosterCard({
  href,
  title,
  image,
  alt,
  filmBrand,
  className = "",
}: {
  href: string;
  title: string;
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

/** Homepage grid shows only the first 4 services — Wheels & Tires stays on /services but drops off this teaser. */
const HOME_TITLE_OVERRIDE: Record<string, string> = {
  "starlight-headliners": "Accessories",
};

export default function FeaturedServices() {
  const [a, b, c, d] = services;

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
            lines={["Built Around Your Vision."]}
            className="mt-3 max-w-md font-display text-2xl text-ink sm:text-3xl"
          />
          <Reveal delay={0.05}>
            <p className="mt-3 max-w-md text-cream">
              Every service is performed with the same obsession for craftsmanship,
              whether it&apos;s a full color change, paint protection, ceramic tint,
              custom lighting, or a complete vehicle transformation.
            </p>
          </Reveal>
        </div>
        <Link href="/services" className="link-underline text-sm text-cream">
          View services →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[a, b, c, d].map((item, i) =>
          item ? (
            <Reveal key={item.href} delay={i * 0.08} className="aspect-[4/5]">
              <PosterCard
                href={item.href}
                title={HOME_TITLE_OVERRIDE[item.slug] ?? item.title}
                image={item.image}
                alt={`${item.title}: Iqballaz Customs`}
                filmBrand={item.filmBrand}
                className="h-full"
              />
            </Reveal>
          ) : null
        )}
      </div>

      <Reveal delay={0.4} className="mt-10 flex justify-center">
        <MagneticButton href="/services" variant="ghost">
          View all services
        </MagneticButton>
      </Reveal>
    </section>
  );
}
