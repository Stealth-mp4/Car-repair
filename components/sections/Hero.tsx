"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import RevealLines from "@/components/ui/RevealLines";
import MagneticButton from "@/components/ui/MagneticButton";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { business } from "@/lib/site";

/**
 * Hero (section 2) — full-bleed graded media under studio light, slow parallax on
 * the media layer, headline via RevealLines on load bleeding past the right edge.
 * Drop a looping <video> in place of the Image when a clip is available.
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
      className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden"
    >
      {/* Media layer (parallax) */}
      <div ref={mediaRef} className="absolute inset-x-0 -top-[8%] h-[116%]">
        <Image
          src="/DSC_4438.jpeg"
          alt="Installer hand-laying a blue metallic wrap in the Houston studio"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="graded object-cover"
        />
        <div className="absolute inset-0 bg-graphite/45" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-graphite to-transparent" />
      </div>

      {/* Cue line — top-left, mono */}
      <p
        className="mono-label absolute top-28"
        style={{ left: "var(--gutter)" }}
      >
        {business.cue}
      </p>

      {/* Headline + CTAs — offset bottom-left on an uneven grid */}
      <div
        className="relative z-10 pb-16"
        style={{ paddingInline: "var(--gutter)" }}
      >
        <RevealLines
          as="h1"
          trigger="load"
          className="display -mr-[10vw] text-ink"
          lines={["Wrapped in Houston.", "Built for Tesla."]}
        />
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <MagneticButton href="/quote" variant="primary">
            Get a Quote
          </MagneticButton>
          <Link href="/gallery" className="link-underline text-ink">
            See the work
          </Link>
        </div>
      </div>
    </section>
  );
}
