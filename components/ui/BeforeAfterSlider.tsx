"use client";

import { useState } from "react";
import Image from "next/image";
import type { BeforeAfter } from "@/lib/builds";

/**
 * BeforeAfterSlider — drag (or arrow-key) the divider to wipe between the before
 * and after shots. The before layer fills the full frame and is revealed with
 * clip-path so neither image squishes. Rendered only when a build has a pair.
 */
export default function BeforeAfterSlider({ data }: { data: BeforeAfter }) {
  const [pos, setPos] = useState(50);
  const label = data.alt ?? "Build";

  return (
    <div className="media-frame relative aspect-[16/10] select-none">
      {/* After (full frame) */}
      <Image
        src={data.after}
        alt={`${label} — after`}
        fill
        sizes="100vw"
        className="graded object-cover"
      />

      {/* Before (clipped to the left of the divider) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={data.before}
          alt={`${label} — before`}
          fill
          sizes="100vw"
          className="graded object-cover"
        />
      </div>

      {/* Divider line + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-ink"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full border border-line bg-graphite">
          <span className="h-3 w-px bg-muted" />
          <span className="h-3 w-px bg-muted" />
        </span>
      </div>

      {/* Corner labels */}
      <span className="mono-label absolute left-3 top-3 rounded-full border border-line bg-graphite/70 px-2 py-1">
        Before
      </span>
      <span className="mono-label absolute right-3 top-3 rounded-full border border-line bg-graphite/70 px-2 py-1">
        After
      </span>

      {/* Range control drives the wipe (mouse, touch, keyboard) */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Reveal before and after"
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
