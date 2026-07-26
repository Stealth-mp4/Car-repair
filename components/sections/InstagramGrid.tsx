"use client";

import { useRef } from "react";
import Image from "next/image";
import type { IgPost } from "@/lib/instagram";
import { social } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";

const CAMERA_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16.8" cy="7.6" r="0.9" fill="currentColor" />
  </svg>
);

const PLAY_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

/**
 * InstagramGrid (V5 — "Wraps Redefined" carousel reference) — a horizontal
 * scrolling row, not a static grid: prev/next arrows, a handle badge per
 * tile, and a play glyph on video posts.
 */
export default function InstagramGrid({ posts }: { posts: IgPost[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative mt-10">
      <div
        ref={trackRef}
        className="scrollbar-none flex gap-3 overflow-x-auto scroll-smooth"
      >
        {posts.map((p, i) => (
          <Reveal
            key={p.id}
            delay={(i % 4) * 0.08}
            y={16}
            className={`shrink-0 ${p.aspect === "4/5" ? "aspect-[4/5]" : "aspect-square"} w-[68vw] sm:w-[38vw] lg:w-[24vw]`}
          >
            <a
              href={p.permalink}
              target="_blank"
              rel="noreferrer"
              className="media-frame group relative block h-full"
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 25vw"
                className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

              {p.isVideo ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-ink">
                    {PLAY_ICON}
                  </span>
                </span>
              ) : null}

              <span className="mono-label absolute inset-x-4 bottom-4 flex items-center gap-1.5 text-ink">
                {CAMERA_ICON}
                {social.instagramHandle}
              </span>
            </a>
          </Reveal>
        ))}
      </div>

      {posts.length > 1 ? (
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            aria-label="Scroll posts left"
            onClick={() => scrollByAmount(-1)}
            className="btn-sweep mono-label flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink"
            style={{ ["--sweep" as string]: "var(--color-black-raised)" }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Scroll posts right"
            onClick={() => scrollByAmount(1)}
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
