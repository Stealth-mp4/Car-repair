import Image from "next/image";
import { social } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";

export type SocialPost = {
  id: string;
  platform: "instagram" | "tiktok" | "facebook";
  image: string;
  alt: string;
  href: string;
};

const INSTAGRAM_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-ink" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17" cy="7" r="1" fill="currentColor" />
  </svg>
);

const FACEBOOK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-ink" aria-hidden="true">
    <path
      d="M14.5 8.5h2V5.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.5V21h3.3v-5.6h2.5l.4-3.2h-2.9V10.2c0-.9.3-1.7 1.4-1.7Z"
      fill="currentColor"
    />
  </svg>
);

const TIKTOK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-ink" aria-hidden="true">
    <path
      d="M16.5 3c.4 2.2 1.8 3.7 4 3.9v2.9c-1.4.1-2.7-.3-4-1.1v6.1c0 3.2-2.6 5.2-5.4 5.2-2.9 0-5.3-2.1-5.3-5.2 0-3.1 2.7-5.4 6-5V13c-1.5-.2-2.9.7-2.9 2.1 0 1.3 1.1 2.2 2.4 2.2 1.5 0 2.6-1.1 2.6-2.8V3h2.6Z"
      fill="currentColor"
    />
  </svg>
);

/** Real per-platform brand colours (structural parity — never a generic grey badge). */
const PLATFORM_BADGE: Record<SocialPost["platform"], { icon: React.ReactNode; className: string }> = {
  instagram: {
    icon: INSTAGRAM_ICON,
    className: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]",
  },
  facebook: { icon: FACEBOOK_ICON, className: "bg-[#1877F2]" },
  tiktok: { icon: TIKTOK_ICON, className: "bg-black" },
};

/**
 * SocialGrid (V5) — exactly four fixed link cards (not a live feed): two
 * Instagram posts, one TikTok video, one Facebook page, each carrying its
 * platform's real brand colour so the badge reads correctly at a glance. A
 * repeating handle ticker runs underneath, matching the reference site's
 * mobile marquee motion.
 */
export default function InstagramGrid({ posts }: { posts: SocialPost[] }) {
  const ticker = Array(8).fill(social.instagramHandle);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {posts.map((p, i) => {
          const badge = PLATFORM_BADGE[p.platform];
          return (
            <Reveal key={p.id} delay={i * 0.08} y={16} className="aspect-[4/5]">
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="media-frame group relative block h-full"
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                <span
                  className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full ${badge.className}`}
                >
                  {badge.icon}
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden border-y border-line py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee-track flex w-max gap-10" style={{ animation: "marquee 18s linear infinite" }}>
          {[...ticker, ...ticker].map((handle, i) => (
            <span key={i} className="mono-label whitespace-nowrap text-cream/60">
              {handle}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
