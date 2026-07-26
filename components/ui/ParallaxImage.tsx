"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * ParallaxImage — full-bleed background image that drifts a few percent on
 * scroll (scrubbed to the section's own position, not a fixed duration).
 * No-op under prefers-reduced-motion (image renders static, in place).
 */
export default function ParallaxImage({
  src,
  alt,
  className = "",
  overlayClassName = "",
  sizes = "100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const media = mediaRef.current;
    if (!wrap || !media || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(media, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, wrap);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <div ref={mediaRef} className="absolute inset-x-0 -top-[10%] h-[120%] scale-[1.03]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="graded object-cover"
        />
      </div>
      {overlayClassName ? <div className={`absolute inset-0 ${overlayClassName}`} /> : null}
    </div>
  );
}
