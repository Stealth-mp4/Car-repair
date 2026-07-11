import Link from "next/link";
import Image from "next/image";
import type { Build } from "@/lib/builds";

/**
 * BuildCard — one gallery card. Mixed aspect (4:5 / 4:3) so the grid reads as
 * masonry, not a uniform bento. Inner image scales to 1.06 on hover (never the
 * card); a "View build" underline-draw reveals. Lazy over the graded .media-frame.
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
  // deterministic mixed rhythm — every third card is landscape 4:3
  const aspect = index % 3 === 1 ? "4 / 3" : "4 / 5";
  const cover = build.media[0];

  return (
    <Link
      href={`/gallery/${build.slug}`}
      className="group mb-4 block break-inside-avoid"
    >
      <div className="media-frame relative" style={{ aspectRatio: aspect }}>
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="graded object-cover transition-transform duration-600 ease-brand group-hover:scale-[1.06]"
        />
        {cover.type === "video" ? (
          <span className="mono-label absolute left-3 top-3 rounded-full border border-line bg-graphite/70 px-2 py-1">
            Video
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="mono-label">
          {build.year} {build.make} {build.model} — {build.services.join(" / ")}
          {build.wrapColor ? ` — ${build.wrapColor}` : ""}
        </p>
        <span className="link-underline shrink-0 text-sm text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          View build
        </span>
      </div>
    </Link>
  );
}
