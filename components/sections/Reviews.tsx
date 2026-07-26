import ReviewsCarousel from "@/components/sections/ReviewsCarousel";
import { getReviews } from "@/lib/reviews";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

/**
 * Google Reviews (V4 — bugatti.com handwritten-quote-band reference) — real
 * reviews (Places API when configured, on-record fallback otherwise), one
 * large centered italic pull-quote at a time. Server component fetches; the
 * carousel client component handles rotation + progress rules.
 */
export default async function Reviews() {
  const reviews = await getReviews();
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-y border-line py-24 md:py-32"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="flex flex-col items-center text-center">
        <Reveal>
          <p className="mono-label">What customers say</p>
        </Reveal>
        <RevealLines
          as="h2"
          lines={["Real people. Real results."]}
          className="display mt-4 text-3xl text-ink sm:text-4xl"
        />
        <Reveal delay={0.1}>
          <p className="mono-label mt-4 text-maroon">{avg.toFixed(1)} rating on Google</p>
        </Reveal>
      </div>
      <Reveal delay={0.15} className="mt-10">
        <ReviewsCarousel reviews={reviews} />
      </Reveal>
    </section>
  );
}
