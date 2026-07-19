/**
 * lib/instagram.ts — Instagram feed source (build.md section 8).
 * LIVE when INSTAGRAM_ACCESS_TOKEN is set (Graph API). Otherwise falls back to
 * real shop photos from /public so the grid renders truthfully now. Every tile is
 * graded to match the site's photo treatment so it never looks bolted-on.
 */

export type IgPost = {
  id: string;
  src: string;
  alt: string;
  permalink: string;
  /** grid aspect — mixed 4:5 / 1:1 masonry */
  aspect: "4/5" | "1/1";
};

/** Real shop images (from /public) — honest placeholder until the token is added. */
const FALLBACK_POSTS: IgPost[] = [
  { id: "f1", src: "/DSC_4434.jpeg", alt: "Cybertruck satin black wrap", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "4/5" },
  { id: "f2", src: "/DSC_4458.jpeg", alt: "Tesla Model 3 stealth PPF", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "1/1" },
  { id: "f3", src: "/DSC_4468.jpeg", alt: "Ceramic tint on glass roof", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "4/5" },
  { id: "f4", src: "/DSC_4443.jpeg", alt: "Wrap panel detail", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "1/1" },
  { id: "f5", src: "/DSC_4465.jpeg", alt: "Satin PPF side profile", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "4/5" },
  { id: "f6", src: "/DSC_4470.jpeg", alt: "Studio-lit build", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "1/1" },
  { id: "f7", src: "/DSC_4489.jpeg", alt: "Finished wrap under studio light", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "4/5" },
  { id: "f8", src: "/DSC_5212.jpeg", alt: "Completed Tesla build", permalink: "https://www.instagram.com/iqballazcustoms", aspect: "1/1" },
];

type GraphMedia = {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
};

/** Fetch the live @iqballazcustoms feed, or fall back to real shop photos. */
export async function getInstagram(limit = 8): Promise<IgPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return FALLBACK_POSTS.slice(0, limit);

  try {
    const fields = "id,media_url,permalink,caption,media_type,thumbnail_url";
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${token}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return FALLBACK_POSTS.slice(0, limit);
    const data = (await res.json()) as { data?: GraphMedia[] };
    const media = data.data ?? [];
    if (media.length === 0) return FALLBACK_POSTS.slice(0, limit);
    return media.map((m, i) => ({
      id: m.id,
      src: m.media_type === "VIDEO" ? m.thumbnail_url ?? m.media_url : m.media_url,
      alt: m.caption?.slice(0, 120) ?? "Iqballaz Customs build",
      permalink: m.permalink,
      aspect: i % 3 === 0 ? ("4/5" as const) : ("1/1" as const),
    }));
  } catch {
    return FALLBACK_POSTS.slice(0, limit);
  }
}
