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
  {
    author: "Md Shahbaaz Uddin",
    rating: 5,
    source: "google",
    text: "I had a fantastic experience wrapping my vehicle at Iqballaz Customs. From the initial consultation, Mr. Zarak was incredibly helpful with selecting the perfect color, design, and explaining the entire process. The installation is flawless — the edges are completely tucked and it looks like a custom paint job. I highly recommend them if you want quality work and great customer service.",
  },
  {
    author: "Ruben Lopez",
    rating: 5,
    source: "google",
    text: "I recently had my red Tesla Model Y windows tinted at Iqballaz Customs, and I couldn't be happier with the experience. Their pricing was very competitive, and they were incredibly accommodating with my busy schedule, which I really appreciated. The owner, Z, kept me updated throughout the entire process and made sure I knew exactly what was going on every step of the way. The customer service was excellent, and the quality of the tint installation exceeded my expectations. If you're looking for a professional shop that delivers great work and genuinely cares about its customers, I highly recommend Iqballaz Customs. I'll definitely be coming back to have them do the PPF wrap on my Tesla next!",
  },
  {
    author: "Lauren Bernard",
    rating: 5,
    source: "google",
    text: "I couldn't be happier with the work done on my car. They completed a chrome delete, powder coated my wheels, wrapped the roof, and did the mirrors, and the transformation is incredible. The car looks so much better than when I dropped it off. Not only was the quality of the work outstanding, but the turnaround time was impressively fast. The team was professional, communicative, and paid great attention to detail throughout the entire process. I highly recommend them to anyone looking to customize their vehicle!",
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
