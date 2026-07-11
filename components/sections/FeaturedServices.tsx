import Link from "next/link";
import Image from "next/image";
import { featuredServices } from "@/lib/site";

/**
 * Featured Services (section 3) — asymmetric strip, NOT a centered 3-up grid:
 * one large card (col-span-7) beside two stacked smaller cards (col-span-5).
 * Hover: inner image scales to 1.06 (never the card) + a mono spec tag
 * clip-reveals from the bottom edge.
 */
function ServiceCard({
  href,
  title,
  short,
  image,
  alt,
  className = "",
}: {
  href: string;
  title: string;
  short: string;
  image: string;
  alt: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`media-frame group relative block ${className}`}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="graded object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-graphite/80 via-graphite/10 to-transparent" />
      <div className="absolute inset-x-5 bottom-5">
        <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
        <span className="reveal-mask mt-1">
          <span className="mono-label block translate-y-full transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
            {short}
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedServices() {
  const [lead, ...rest] = featuredServices();
  const small = rest.slice(0, 2);

  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="flex items-end justify-between gap-6">
        <p className="mono-label">What we do</p>
        <Link href="/services" className="link-underline text-sm text-muted">
          All services
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
        {lead ? (
          <ServiceCard
            href={lead.href}
            title={lead.title}
            short={lead.short}
            image={lead.image}
            alt={`${lead.title} — Iqballaz Customs`}
            className="aspect-[4/5] md:col-span-7 md:aspect-auto"
          />
        ) : null}

        <div className="flex flex-col gap-4 md:col-span-5">
          {small.map((s) => (
            <ServiceCard
              key={s.slug}
              href={s.href}
              title={s.title}
              short={s.short}
              image={s.image}
              alt={`${s.title} — Iqballaz Customs`}
              className="aspect-[16/10] flex-1"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
