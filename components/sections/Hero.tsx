"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import RevealLines from "@/components/ui/RevealLines";
import MagneticButton from "@/components/ui/MagneticButton";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { business } from "@/lib/site";

/**
 * Hero (V4 — bugatti.com reference) — full-bleed graded media, centered
 * content stack (cue → headline → caption → outline CTA → ghost link), slow
 * parallax on the media layer. Looping muted background video with the shop
 * photo as poster/fallback — drop the exported clip at
 * /public/videos/hero-reel.mp4.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    if (!section || !media || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(media, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[94svh] flex-col items-center justify-center overflow-hidden"
    >
      {/* Media layer (parallax) — cropped tighter, bleeds further off frame */}
      <div ref={mediaRef} className="absolute inset-x-0 -top-[12%] h-[126%] scale-[1.04]">
        <video
          className="graded absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          //poster="/DSC_4438.jpeg"
        >
          <source src="/videos/hero-reel.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black to-transparent" />
      </div>

      {/* Centered content stack */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mono-label">{business.cue}</p>

        <RevealLines
          as="h1"
          trigger="load"
          className="display mt-5 text-ink"
          lineClassName="text-center"
          lines={["Wrapped in Houston.", "Built for Tesla."]}
        />

        <p className="mono-label mt-6 text-ink/70">{business.trust}</p>

        <div className="mt-9 flex flex-col items-center gap-5">
          <MagneticButton href="/quote" variant="outline">
            Get a Quote
          </MagneticButton>
          <Link href="/gallery" className="link-underline text-sm text-ink/80">
            See the work
          </Link>
        </div>
      </div>

      {/* Thin section-divider rule (bugatti.com reference) */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-line" />
    </section>
  );
}
