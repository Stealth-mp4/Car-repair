"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

type Tag = "h1" | "h2" | "h3" | "p";

/**
 * RevealLines — authored lines, each in an overflow-hidden mask, yPercent 112 -> 0,
 * stagger 0.09. `trigger="load"` for the hero, `"scroll"` for sections.
 * Renders statically (no transform) under prefers-reduced-motion.
 * See build.md MOTION ENGINE.
 */
export default function RevealLines({
  lines,
  as = "h2",
  trigger = "scroll",
  className = "",
  lineClassName = "",
}: {
  lines: string[];
  as?: Tag;
  trigger?: "load" | "scroll";
  className?: string;
  lineClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-line]");

    if (prefersReducedMotion()) {
      gsap.set(targets, { yPercent: 0 });
      return;
    }

    gsap.set(targets, { yPercent: 112 });
    const play = () =>
      gsap.to(targets, {
        yPercent: 0,
        duration: 1.05,
        stagger: 0.12,
        ease: "power3.out",
      });

    if (trigger === "load") {
      play();
      return;
    }
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 80%",
      once: true,
      onEnter: play,
    });
    return () => st.kill();
  }, [trigger]);

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-mask">
          <span data-line className={`block ${lineClassName}`}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
