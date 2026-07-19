import ReviewsCarousel from "@/components/sections/ReviewsCarousel";
import { getReviews } from "@/lib/reviews";

/**
 * Google Reviews (section 7) — real reviews (Places API when configured, on-record
 * fallback otherwise), one large pull-quote at a time. Server component fetches;
 * the carousel client component handles rotation + progress rules.
 */
export default async function Reviews() {
  const reviews = await getReviews();
  if (reviews.length === 0) return null;

  return (
    <section
      className="border-y border-line py-24 md:py-32"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <p className="mono-label">What customers say</p>
      <div className="mt-8">
        <ReviewsCarousel reviews={reviews} />
      </div>
    </section>
  );
}
