import Image from "next/image";
import { getInstagram } from "@/lib/instagram";
import { social } from "@/lib/site";

/**
 * Instagram feed (section 8) — live grid from @iqballazcustoms (Graph API when a
 * token is set, real shop photos otherwise). Masonry via CSS columns, mixed 4:5 /
 * 1:1, every tile graded to match the site's photo treatment. Tiles go through
 * next/image so both local fallbacks and live CDN URLs are resized/optimized.
 */
export default async function InstagramFeed() {
  const posts = await getInstagram(8);
  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="mono-label">On the grid</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink">
            Latest from the shop.
          </h2>
        </div>
        <a href={social.instagram} className="link-underline text-sm text-muted">
          {social.instagramHandle}
        </a>
      </div>

      <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4">
        {posts.map((p) => (
          <a
            key={p.id}
            href={p.permalink}
            target="_blank"
            rel="noreferrer"
            className="media-frame group relative mb-4 block break-inside-avoid"
            style={{ aspectRatio: p.aspect }}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="graded object-cover transition-transform duration-600 ease-brand group-hover:scale-[1.06]"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
