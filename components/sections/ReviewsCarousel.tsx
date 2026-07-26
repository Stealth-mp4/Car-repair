"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/reviews";
import { prefersReducedMotion } from "@/lib/gsap";

const ADVANCE_MS = 7000;
const FADE_MS = 350;

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="mono-label text-maroon">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))} · {rating.toFixed(1)}
    </span>
  );
}

/**
 * ReviewsCarousel — one review at a time, cross-fading out then in (not a
 * scroll track). Auto-advances on a timer, plus explicit prev/next buttons;
 * both paths go through the same fade. Static under prefers-reduced-motion.
 */
export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const count = reviews.length;
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      const target = ((next % count) + count) % count;
      if (target === active) return;

      if (prefersReducedMotion()) {
        setActive(target);
        return;
      }

      setVisible(false);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => {
        setActive(target);
        setVisible(true);
      }, FADE_MS);
    },
    [active, count]
  );

  useEffect(() => {
    if (count <= 1 || prefersReducedMotion()) return;
    const t = setInterval(() => goTo(active + 1), ADVANCE_MS);
    return () => clearInterval(t);
  }, [active, count, goTo]);

  useEffect(() => () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
  }, []);

  if (count === 0) return null;
  const review = reviews[active];

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <div
        className="transition-opacity"
        style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      >
        <Stars rating={review.rating} />

        <blockquote className="mt-6 max-w-[65ch] font-display text-xl italic leading-[1.4] text-ink sm:text-2xl">
          &ldquo;{review.text}&rdquo;
        </blockquote>

        <p className="mono-label mt-6">
          {review.author} — Google review
          {review.relativeTime ? ` · ${review.relativeTime}` : ""}
        </p>
      </div>

      {count > 1 ? (
        <div className="mt-10 flex items-center gap-6">
          <button
            type="button"
            aria-label="Previous review"
            onClick={() => goTo(active - 1)}
            className="btn-sweep mono-label flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink"
            style={{ ["--sweep" as string]: "var(--color-black-raised)" }}
          >
            ←
          </button>

          {/* Thin progress rules (not dots) that fill on the active review */}
          <div className="flex gap-3">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show review ${i + 1}`}
                onClick={() => goTo(i)}
                className="h-px w-12 bg-line sm:w-16"
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

          <button
            type="button"
            aria-label="Next review"
            onClick={() => goTo(active + 1)}
            className="btn-sweep mono-label flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink"
            style={{ ["--sweep" as string]: "var(--color-black-raised)" }}
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
