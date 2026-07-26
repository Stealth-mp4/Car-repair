import InstagramGrid from "@/components/sections/InstagramGrid";
import { getInstagram } from "@/lib/instagram";
import { social } from "@/lib/site";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

/**
 * On Instagram (V5) — live grid from @iqballazcustoms (Graph API when a token
 * is set, real shop photos otherwise). Fixed 3-col square grid via
 * InstagramGrid, graded to match the site's photo treatment, plus follow
 * links out to all three live socials (Instagram, Facebook, TikTok).
 */
export default async function InstagramFeed() {
  const posts = await getInstagram(9);
  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="mono-label">Follow the build</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["Latest from the shop."]}
            className="mt-3 font-display text-4xl font-semibold text-ink"
          />
        </div>
        <Reveal delay={0.1} className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <a href={social.instagram} className="link-underline text-sm text-cream">
            Instagram
          </a>
          <a href={social.facebook} className="link-underline text-sm text-cream">
            Facebook
          </a>
          <a href={social.tiktok} className="link-underline text-sm text-cream">
            TikTok
          </a>
        </Reveal>
      </div>

      <InstagramGrid posts={posts} />
    </section>
  );
}
