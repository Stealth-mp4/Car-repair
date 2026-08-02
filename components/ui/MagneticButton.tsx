"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Variant = "primary" | "ghost" | "paper" | "outline";

const base =
  "btn-sweep mono-label inline-flex items-center justify-center px-6 py-3 will-change-transform";

const variants: Record<Variant, { className: string; sweep: string }> = {
  // Red fill — the primary "Book Appointment" CTA. Red stays < 4% of screen.
  primary: { className: "bg-red text-ink", sweep: "var(--color-red-deep)" },
  // Hairline ghost link — fills to black-raised on hover.
  ghost: { className: "border border-line text-ink", sweep: "var(--color-black-raised)" },
  // Inverted paper — for dark-on-dark CTA bands.
  paper: { className: "bg-paper text-black", sweep: "var(--color-ink)" },
  // Thin red-outline pill (bugatti.com hero cue) — fills red on hover, text flips to ink.
  outline: { className: "border border-red text-red hover:text-ink", sweep: "var(--color-red)" },
};

/**
 * MagneticButton — pill CTA that leans toward the cursor via gsap.quickTo and
 * whose fill sweeps up from the bottom on hover (no scale). Static under
 * prefers-reduced-motion. See build.md hover law.
 */
export default function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
  strength = 0.35,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  const v = variants[variant];
  return (
    <Link
      ref={ref}
      href={href}
      className={`${base} ${v.className} ${className}`}
      style={{ ["--sweep" as string]: v.sweep } as React.CSSProperties}
    >
      {children}
    </Link>
  );
}
