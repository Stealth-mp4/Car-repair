import Link from "next/link";
import Image from "next/image";
import type { Build } from "@/lib/builds";
import Reveal from "@/components/ui/Reveal";

/**
 * BuildCard — one gallery card, styled to match the bugatti.com model-grid
 * reference: full-bleed graded photo, eyebrow + title pinned near the top,
 * a centered "View build" pinned near the bottom, dark gradients for
 * legibility. Mixed aspect (4:5 / 1:1) so the grid reads as masonry, not a
 * uniform bento. Inner image scales to 1.06 on hover (never the card).
 */
export default function BuildCard({
  build,
  index = 0,
  priority = false,
}: {
  build: Build;
  index: number;
  priority?: boolean;
}) {
  // deterministic mixed rhythm — every third card is a touch shorter
  const aspect = index % 3 === 1 ? "1 / 1" : "4 / 5";
  const cover = build.media[0];
  const spec = `${build.services.join(" / ")}${build.wrapColor ? ` — ${build.wrapColor}` : ""}`;

  return (
    <Reveal delay={(index % 6) * 0.06} className="mb-4">
      <Link
        href={`/gallery/${build.slug}`}
        className="media-frame group relative flex flex-col justify-between overflow-hidden"
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.06]"
        />
        {cover.type === "video" ? (
          <span className="mono-label absolute left-3 top-3 z-10 rounded-full border border-line bg-black/70 px-2 py-1">
            Video
          </span>
        ) : null}

        {/* Legibility gradients, top and bottom */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />

        <div className="relative z-10 px-5 pt-6 text-center">
          <p className="mono-label text-ink/80">
            {build.year} {build.make}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{build.model}</h3>
        </div>

        <div className="relative z-10 px-5 pb-6 text-center">
          <p className="mono-label mb-3 text-ink/75">{spec}</p>
          <span className="link-underline mono-label text-ink">View build</span>
        </div>
      </Link>
    </Reveal>
  );
}
