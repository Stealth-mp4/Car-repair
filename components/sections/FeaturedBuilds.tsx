"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Build } from "@/lib/builds";
import { prefersReducedMotion } from "@/lib/gsap";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

const FEATURED_COUNT = 4;
const AUTOPLAY_MS = 4500;

/**
 * Featured Builds (V5 homepage) — preview of the top four builds, autoplaying
 * every AUTOPLAY_MS and looping back to the first. Hovering a list item takes
 * over immediately and resets the autoplay timer.
 */
export default function FeaturedBuilds({ builds: allBuilds }: { builds: Build[] }) {
  const builds = allBuilds.slice(0, FEATURED_COUNT);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || builds.length < 2) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % builds.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [builds.length]);

  const selectIndex = (i: number) => {
    setActiveIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!prefersReducedMotion() && builds.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveIndex((cur) => (cur + 1) % builds.length);
      }, AUTOPLAY_MS);
    }
  };

  const active = builds[activeIndex];
  if (!active) return null;

  return (
    <section
      className="border-y border-line bg-black-raised py-20 md:py-28"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="mono-label">Featured builds</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["Fresh off the bench."]}
            className="display mt-4 text-4xl text-ink sm:text-5xl"
          />
        </div>
        <Link href="/gallery" className="link-underline text-sm text-cream">
          View all builds →
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Preview */}
        <Reveal delay={0.1} className="lg:col-span-8">
          <Link
            href={`/gallery/${active.slug}`}
            className="group relative block overflow-hidden rounded-media"
          >
            <div key={active.slug} className="build-fade-in relative aspect-[16/10]">
              <Image
                src={active.media[0].src}
                alt={active.media[0].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/30" />

              {/* Service pills — top-left */}
              <div className="absolute inset-x-5 top-5 flex flex-wrap gap-2">
                {active.services.map((s) => (
                  <span
                    key={s}
                    className="mono-label rounded-full border border-line bg-black/60 px-2.5 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Build name — bottom-left */}
              <div className="absolute inset-x-5 bottom-5">
                <h3 className="display text-2xl text-ink sm:text-3xl">
                  {active.year} {active.make} {active.model}
                </h3>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* List of every build — hover previews, click opens */}
        <div className="flex flex-col divide-y divide-line border-t border-line lg:col-span-4 lg:border-t-0 lg:divide-y-0">
          {builds.map((b, i) => (
            <Reveal key={b.slug} delay={0.15 + i * 0.08}>
              <Link
                href={`/gallery/${b.slug}`}
                onMouseEnter={() => selectIndex(i)}
                className={`group flex items-center gap-5 py-5 lg:border-t lg:border-line ${i === 0 ? "pt-0 lg:border-t-0" : ""} ${
                  i === activeIndex ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span className="mono-label text-maroon">{String(i + 1).padStart(2, "0")}</span>
                <div className="media-frame relative aspect-[4/3] w-24 shrink-0 sm:w-28">
                  <Image
                    src={b.media[0].src}
                    alt={b.media[0].alt}
                    fill
                    sizes="120px"
                    className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.05]"
                  />
                </div>
                <div className="min-w-0">
                  <p className={`font-display text-lg ${i === activeIndex ? "text-ink" : "text-cream"}`}>
                    {b.year} {b.make} {b.model}
                  </p>
                  <p className="mono-label mt-1 truncate">{b.services.join(" / ")}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
