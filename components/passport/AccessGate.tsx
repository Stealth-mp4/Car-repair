"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { openPassport } from "@/app/(site)/passport/actions";

const inputClass =
  "w-full rounded-input border border-line bg-black-raised px-4 py-3 text-center text-ink placeholder:text-muted outline-none transition-colors focus:border-red";

/**
 * AccessGate — single mono-labeled "Access code" input + a pill submit CTA.
 * Visually and behaviourally matches MagneticButton's primary variant (sweep
 * fill, magnetic lean toward the cursor), but is a real <button type="submit">
 * inside a <form action={openPassport}> rather than a Link — MagneticButton's
 * navigation semantics don't fit a form post. See build.md hover law.
 */
export default function AccessGate({ error }: { error?: boolean }) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = btnRef.current;
    if (!el || prefersReducedMotion()) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
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
  }, []);

  return (
    <form action={openPassport} className="mx-auto flex w-full max-w-xs flex-col items-center gap-4">
      <label htmlFor="code" className="mono-label">
        Access code
      </label>
      <input
        id="code"
        name="code"
        type="text"
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="e.g. MD-7719"
        className={inputClass}
        required
      />
      {error ? (
        <p className="mono-label text-red">Code not recognized. Check with the shop.</p>
      ) : null}
      <button
        ref={btnRef}
        type="submit"
        style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
        className="btn-sweep mono-label mt-2 inline-flex items-center justify-center bg-red px-6 py-3 text-ink will-change-transform"
      >
        Open passport
      </button>
    </form>
  );
}
