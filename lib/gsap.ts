/**
 * lib/gsap.ts — single GSAP entry point.
 * Registers ScrollTrigger once, client-side only. Import { gsap, ScrollTrigger }
 * from here everywhere so plugins are never double-registered.
 * Every consumer must still gate calls behind prefers-reduced-motion.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Brand easing curve — cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = "cubic-bezier(0.22,1,0.36,1)";

/** True when the user asked for reduced motion. Gate all motion on this. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export { gsap, ScrollTrigger };
