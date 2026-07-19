import InstagramGrid from "@/components/sections/InstagramGrid";
import { getInstagram } from "@/lib/instagram";
import { social } from "@/lib/site";

/**
 * On Instagram (V4 — bugatti.com "BUGATTI LIVE" reference) — live grid from
 * @iqballazcustoms (Graph API when a token is set, real shop photos otherwise).
 * Fixed 3-col square grid via InstagramGrid, graded to match the site's photo
 * treatment so it doesn't look like a bolted-on widget.
 */
export default async function InstagramFeed() {
  const posts = await getInstagram(9);
  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="mono-label">On Instagram</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink">
            Latest from the shop.
          </h2>
        </div>
        <a href={social.instagram} className="link-underline text-sm text-muted">
          {social.instagramHandle}
        </a>
      </div>

      <InstagramGrid posts={posts} />
    </section>
  );
}
