"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Reveal — generic on-scroll fade + rise for blocks that aren't line-split text.
 * No-op under prefers-reduced-motion (content renders normally, in place).
 */
export default function Reveal({
  children,
  className = "",
  y = 24,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.set(el, { autoAlpha: 0, y });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.8, delay, ease: "power3.out" }),
    });
    return () => st.kill();
  }, [y, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
