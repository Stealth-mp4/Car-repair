import Link from "next/link";
import Image from "next/image";

export type ShowcaseItem = {
  href: string;
  title: string;
  image: string;
  alt: string;
  /** small caps line above the title — e.g. a film brand or category tag */
  eyebrow?: string;
  /** spec-sheet copy shown under the title */
  caption?: string;
  ctaLabel?: string;
};

/**
 * ServiceShowcase — full-bleed image cards in a two-column masonry, eyebrow /
 * title pinned near the top and a centered "Learn more" pinned near the
 * bottom, mirroring the bugatti.com model-grid reference. Mixed aspect
 * ratios per index create the staggered rhythm without a real masonry lib.
 */
export default function ServiceShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <div className="columns-1 gap-5 sm:columns-2">
      {items.map((item, i) => (
        <ShowcaseCard key={item.href} item={item} index={i} />
      ))}
    </div>
  );
}

function ShowcaseCard({ item, index }: { item: ShowcaseItem; index: number }) {
  // Deterministic mixed rhythm so the two columns fall out of step, like the
  // reference grid's tall/short pairing.
  const aspect = index % 2 === 0 ? "4 / 5" : "1 / 1";

  return (
    <Link
      href={item.href}
      className="media-frame group relative mb-5 flex flex-col justify-between overflow-hidden"
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={item.image}
        alt={item.alt}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="graded object-cover transition-transform duration-[700ms] ease-brand group-hover:scale-[1.06]"
      />
      {/* Legibility gradients, top and bottom */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />

      <div className="relative z-10 px-6 pt-7 text-center">
        {item.eyebrow ? (
          <p className="mono-label text-ink/80">{item.eyebrow}</p>
        ) : null}
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
          {item.title}
        </h3>
      </div>

      <div className="relative z-10 px-6 pb-7 text-center">
        {item.caption ? (
          <p className="mx-auto mb-4 max-w-[32ch] text-sm text-ink/75">{item.caption}</p>
        ) : null}
        <span className="link-underline mono-label text-ink">
          {item.ctaLabel ?? "Learn more"}
        </span>
      </div>
    </Link>
  );
}
