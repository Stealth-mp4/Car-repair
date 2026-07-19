"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/reviews";
import { prefersReducedMotion } from "@/lib/gsap";

const ADVANCE_MS = 7000;

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  // Mono type, not icon graphics (build.md section 7).
  return (
    <span className="mono-label text-red">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))} · {rating.toFixed(1)}
    </span>
  );
}

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);
  const count = reviews.length;

  useEffect(() => {
    if (count <= 1 || prefersReducedMotion()) return;
    const t = setInterval(() => setActive((i) => (i + 1) % count), ADVANCE_MS);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const review = reviews[active];

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <Stars rating={review.rating} />

      <blockquote className="mt-6 font-display text-3xl font-semibold italic leading-[1.15] text-ink sm:text-4xl md:text-5xl">
        “{review.text}”
      </blockquote>

      <p className="mono-label mt-6">
        {review.author} — Google review
        {review.relativeTime ? ` · ${review.relativeTime}` : ""}
      </p>

      {/* Thin progress rules (not dots) that fill on the active review */}
      {count > 1 ? (
        <div className="mt-10 flex gap-3">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show review ${i + 1}`}
              onClick={() => setActive(i)}
              className="h-px w-16 bg-line"
            >
              <span
                key={`${active}-${i}`}
                className="block h-px bg-ink"
                style={{
                  width: i === active ? "100%" : "0%",
                  animation:
                    i === active && !prefersReducedMotion()
                      ? `grow ${ADVANCE_MS}ms linear forwards`
                      : undefined,
                }}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
