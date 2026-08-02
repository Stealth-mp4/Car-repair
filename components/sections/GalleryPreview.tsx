"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import type { Build } from "@/lib/builds";

/**
 * Gallery preview (section 6) — pinned horizontal track scrubbed sideways on
 * desktop. Falls back to a vertical stack under 768px (matchMedia, no pin) and
 * under prefers-reduced-motion (CSS forces the .hscroll column layout).
 */
export default function GalleryPreview({ builds }: { builds: Build[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const distance = () => track.scrollWidth - section.clientWidth;
      if (distance() <= 0) return;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.5,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
      return () => tween.kill();
    });

    return () => mm.revert();
  }, [builds.length]);

  return (
    <section ref={sectionRef} className="overflow-hidden py-20 md:py-28">
      <div
        className="flex items-end justify-between gap-6"
        style={{ paddingInline: "var(--gutter)" }}
      >
        <div>
          <p className="mono-label">Recent builds</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink">
            Fresh off the bench.
          </h2>
        </div>
        <Link href="/gallery" className="link-underline text-sm text-muted">
          View all
        </Link>
      </div>

      <div
        ref={trackRef}
        className="hscroll mt-10 flex flex-col gap-6 md:flex-row md:flex-nowrap md:gap-8"
        style={{ paddingInline: "var(--gutter)" }}
      >
        {builds.map((b) => (
          <Link
            key={b.slug}
            href={`/gallery/${b.slug}`}
            className="group block md:w-[32vw] md:shrink-0 lg:w-[23vw]"
          >
            <div className="media-frame aspect-[4/5]">
              <Image
                src={b.media[0].src}
                alt={b.media[0].alt}
                sizes="(max-width: 768px) 100vw, 40vw"
                fill
                className="graded object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="mono-label">
                {b.year} {b.make} {b.model} · {b.services.join(" / ")}
                {b.wrapColor ? ` · ${b.wrapColor}` : ""}
              </p>
              <span className="link-underline shrink-0 text-sm text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                View build
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
