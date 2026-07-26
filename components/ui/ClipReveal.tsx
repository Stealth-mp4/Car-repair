"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const HIDDEN: Record<"down" | "left" | "right", string> = {
  down: "inset(0 0 100% 0)",
  left: "inset(0 0 0 100%)",
  right: "inset(0 100% 0 0)",
};

/**
 * ClipReveal — wipes a media block into view via clip-path on scroll, instead
 * of a plain fade. No-op under prefers-reduced-motion (renders fully visible,
 * in place).
 */
export default function ClipReveal({
  children,
  className = "",
  direction = "down",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.set(el, { clipPath: HIDDEN[direction] });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(el, {
          clipPath: "inset(0 0 0 0)",
          duration: 1.1,
          ease: "power3.inOut",
        }),
    });
    return () => st.kill();
  }, [direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
