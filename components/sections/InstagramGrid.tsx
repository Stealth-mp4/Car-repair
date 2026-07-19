"use client";

import { useState } from "react";
import Image from "next/image";
import type { IgPost } from "@/lib/instagram";

const INITIAL_COUNT = 6;

/**
 * InstagramGrid (V4 — bugatti.com "BUGATTI LIVE" reference) — fixed square
 * grid (not masonry), a decorative dot row under each three-tile block, and
 * a "Load more posts" reveal for the remaining tiles.
 */
export default function InstagramGrid({ posts }: { posts: IgPost[] }) {
  const [visible, setVisible] = useState(Math.min(INITIAL_COUNT, posts.length));
  const shown = posts.slice(0, visible);
  const rows: IgPost[][] = [];
  for (let i = 0; i < shown.length; i += 3) rows.push(shown.slice(i, i + 3));

  return (
    <div className="mt-10">
      {rows.map((row, ri) => (
        <div key={ri} className="mb-2">
          <div className="grid grid-cols-3 gap-2">
            {row.map((p) => (
              <a
                key={p.id}
                href={p.permalink}
                target="_blank"
                rel="noreferrer"
                className="media-frame group relative block aspect-square"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="33vw"
                  className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.06]"
                />
              </a>
            ))}
          </div>
          {/* Decorative dot row — visual echo of the reference's per-tile carousel dots */}
          <div className="mt-2 flex justify-center gap-1.5">
            {row.map((p, i) => (
              <span
                key={p.id}
                className={`h-1 w-1 rounded-full ${i === 0 ? "bg-red" : "bg-line"}`}
              />
            ))}
          </div>
        </div>
      ))}

      {visible < posts.length ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => Math.min(v + 3, posts.length))}
            className="mono-label rounded-full border border-line px-5 py-2.5 text-ink transition-colors hover:border-red"
          >
            Load more posts
          </button>
        </div>
      ) : null}
    </div>
  );
}
