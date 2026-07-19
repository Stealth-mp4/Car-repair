import Link from "next/link";
import Image from "next/image";
import { services } from "@/lib/site";

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
      <div className="flex items-end justify-between gap-6">
        <p className="mono-label">Our services</p>
        <Link href="/services" className="link-underline text-sm text-muted">
          All services
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {a ? (
          <PosterCard
            href={a.href}
            title={a.title}
            short={a.short}
            image={a.image}
            alt={`${a.title} — Iqballaz Customs`}
            filmBrand={a.filmBrand}
            className="aspect-[4/5]"
          />
        ) : null}
        {b ? (
          <PosterCard
            href={b.href}
            title={b.title}
            short={b.short}
            image={b.image}
            alt={`${b.title} — Iqballaz Customs`}
            filmBrand={b.filmBrand}
            className="aspect-[4/5]"
          />
        ) : null}
        {c ? (
          <PosterCard
            href={c.href}
            title={c.title}
            short={c.short}
            image={c.image}
            alt={`${c.title} — Iqballaz Customs`}
            filmBrand={c.filmBrand}
            className="aspect-[4/5]"
          />
        ) : null}
        {d ? (
          <PosterCard
            href={d.href}
            title={d.title}
            short={d.short}
            image={d.image}
            alt={`${d.title} — Iqballaz Customs`}
            filmBrand={d.filmBrand}
            className="aspect-[4/5]"
          />
        ) : null}
        {e ? (
          <PosterCard
            href={e.href}
            title={e.title}
            short={e.short}
            image={e.image}
            alt={`${e.title} — Iqballaz Customs`}
            filmBrand={e.filmBrand}
            className="aspect-[16/9] md:col-span-2"
          />
        ) : null}
      </div>
    </section>
  );
}
