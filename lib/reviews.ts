/**
 * lib/reviews.ts — Google Reviews source (build.md section 7).
 * LIVE when GOOGLE_PLACES_API_KEY + GOOGLE_PLACES_ID are set (server-side fetch).
 * Otherwise falls back to genuine on-record reviews — never fabricated ones
 * (anti-AI checklist: reviews are live-pulled, not a fake trust row).
 */

export type Review = {
  author: string;
  rating: number;
  text: string;
  /** where it came from, for the mono source tag */
  source: "google";
  relativeTime?: string;
};

/**
 * Real, on-record review. Left as the seed so the section renders truthfully
 * before the Places API key is added; it is replaced by live data once keys exist.
 */
const FALLBACK_REVIEWS: Review[] = [
  {
    author: "Mike Maknojia",
    rating: 5,
    source: "google",
    text: "Zarak knows how to wrap professionally and listens to the customer thoroughly. He recently did my Cybertruck and it came out perfect — no peeling corners, no visible stainless whatsoever. People think it's paint. Reasonably priced too. Highly recommend Iqballaz Customs.",
  },
];

type PlacesReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
};

/** Fetch live Google reviews, or fall back to the on-record seed. */
export async function getReviews(): Promise<Review[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACES_ID;
  if (!key || !placeId) return FALLBACK_REVIEWS;

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}&fields=reviews&reviews_sort=newest&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 86_400 } });
    if (!res.ok) return FALLBACK_REVIEWS;
    const data = (await res.json()) as { result?: { reviews?: PlacesReview[] } };
    const reviews = data.result?.reviews ?? [];
    if (reviews.length === 0) return FALLBACK_REVIEWS;
    return reviews
      .filter((r) => r.rating >= 4 && r.text.trim().length > 0)
      .map((r) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        source: "google" as const,
        relativeTime: r.relative_time_description,
      }));
  } catch {
    return FALLBACK_REVIEWS;
  }
}
