import InstagramGrid, { type SocialPost } from "@/components/sections/InstagramGrid";
import { social } from "@/lib/site";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

/**
 * Curated cross-platform picks (V5) — four fixed real posts, not a live API
 * feed. All four permalinks and cover frames are the client's own.
 */
const POSTS: SocialPost[] = [
  {
    id: "ig-1",
    platform: "instagram",
    image: "/client/social-instagram-1.webp",
    alt: "Mercedes-Benz S-Class on the highway: Instagram reel",
    href: "https://www.instagram.com/p/DY6LXDLOaX0/",
  },
  {
    id: "ig-2",
    platform: "instagram",
    image: "/client/social-instagram-2.webp",
    alt: "RAM TRX in desert tan on the highway: Instagram reel",
    href: "https://www.instagram.com/p/DZ8phYUu4O0/",
  },
  {
    id: "tiktok-1",
    platform: "tiktok",
    image: "/client/social-tiktok.webp",
    alt: "Iqballaz Customs: TikTok video",
    href: "https://www.tiktok.com/@_iqballazcustoms/video/7633500088916135198",
  },
  {
    id: "fb-1",
    platform: "facebook",
    image: "/client/social-facebook.webp",
    alt: "Iqballaz Customs: Facebook page",
    href: "https://www.facebook.com/people/Iqballaz-customs/61562782624220/",
  },
];

/**
 * On Instagram (V5) — four fixed cross-platform cards (see POSTS above),
 * graded to match the site's photo treatment, plus follow links out to all
 * three live socials (Instagram, Facebook, TikTok).
 */
export default function InstagramFeed() {
  const posts = POSTS;

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
