"use client";

import type { Review } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="mono-label text-maroon">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="media-frame w-[85vw] shrink-0 border border-line bg-black-raised p-6 sm:w-[380px]">
      <Stars rating={review.rating} />
      <blockquote className="mt-4 text-sm leading-relaxed text-cream">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <p className="mono-label mt-5 text-ink/80">
        {review.author}, Google review
        {review.relativeTime ? ` · ${review.relativeTime}` : ""}
      </p>
    </div>
  );
}

/**
 * ReviewsCarousel — two continuously auto-scrolling marquee rows (no fake
 * review-photo backgrounds, no invented reviews — real on-record text only),
 * each row scrolling opposite directions and pausing on hover. Rows repeat
 * the review set so the loop reads as endless regardless of how few reviews
 * exist. Static under prefers-reduced-motion (handled globally in CSS).
 */
export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const row = [...reviews, ...reviews, ...reviews, ...reviews];
  const reversed = [...reviews].reverse();
  const rowB = [...reversed, ...reversed, ...reversed, ...reversed];

  return (
    <div className="flex flex-col gap-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="group overflow-hidden">
        <div
          className="marquee-track flex w-max gap-4 group-hover:[animation-play-state:paused]"
          style={{ animation: "marquee 50s linear infinite" }}
        >
          {row.map((review, i) => (
            <ReviewCard key={`a-${review.author}-${i}`} review={review} />
          ))}
        </div>
      </div>

      {reviews.length > 1 ? (
        <div className="group overflow-hidden">
          <div
            className="marquee-track flex w-max gap-4 group-hover:[animation-play-state:paused]"
            style={{ animation: "marquee 50s linear infinite reverse" }}
          >
            {rowB.map((review, i) => (
              <ReviewCard key={`b-${review.author}-${i}`} review={review} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
