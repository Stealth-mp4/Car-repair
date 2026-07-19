"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import { business, nav, services } from "@/lib/site";

/**
 * SiteNav (section 1) — thin, transparent over the hero, solidifies past 40px
 * (graphite + hairline). Hides on scroll-down, reveals on scroll-up. Services
 * opens a mega-panel (not a plain dropdown) with the service links + Tesla Hub
 * pinned. Solid ember "Get a Quote" pill far right.
 */
export default function SiteNav() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const lastY = useRef(0);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover intent: keep the mega-panel open while the cursor travels from the
  // "Services" trigger down into the panel (the gap between them would otherwise
  // fire mouseleave and close it before you can click a link).
  const openMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMegaSoon = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMega(false), 200);
  };
  useEffect(() => () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      // hide on scroll-down (past the hero), reveal on scroll-up
      setHidden(y > lastY.current && y > 240 && !mega);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mega]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-transform duration-500 ease-brand ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div
        className={`transition-colors duration-300 ${
          solid || mega ? "border-b border-line bg-graphite/95 backdrop-blur-0" : "bg-transparent"
        }`}
      >
        <nav
          className="flex items-center justify-between py-4"
          style={{ paddingInline: "var(--gutter)" }}
        >
          <Link href="/" className="flex items-baseline gap-1.5" onClick={() => setMobile(false)}>
            <span className="font-display text-xl font-semibold tracking-tight text-ink">
              {business.wordmark}
            </span>
            <span className="mono-label">{business.wordmarkSub}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 md:flex">
            <div
              onMouseEnter={openMega}
              onMouseLeave={closeMegaSoon}
              className="relative"
            >
              <button
                type="button"
                className="link-underline text-sm text-ink"
                onClick={() => setMega((v) => !v)}
                aria-expanded={mega}
              >
                Services
              </button>
            </div>
            {nav.primary.map((item) => (
              <Link key={item.href} href={item.href} className="link-underline text-sm text-ink">
                {item.label}
              </Link>
            ))}
            <MagneticButton href={nav.cta.href} variant="primary">
              {nav.cta.label}
            </MagneticButton>
          </div>

          {/* Mobile toggle — mono label, no icon soup */}
          <button
            type="button"
            className="mono-label md:hidden"
            onClick={() => setMobile((v) => !v)}
            aria-expanded={mobile}
          >
            {mobile ? "Close" : "Menu"}
          </button>
        </nav>

        {/* Services mega-panel */}
        <div
          onMouseEnter={openMega}
          onMouseLeave={closeMegaSoon}
          className={`hidden overflow-hidden transition-[max-height,opacity] duration-400 ease-brand md:block ${
            mega ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div
            className="grid grid-cols-3 gap-x-10 gap-y-6 py-10"
            style={{ paddingInline: "var(--gutter)" }}
          >
            {services.map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                className="group"
                onClick={() => setMega(false)}
              >
                <p className="font-display text-lg text-ink">{s.title}</p>
                <p className="mono-label mt-1">{s.short}</p>
              </Link>
            ))}
            {/* Tesla Hub pinned */}
            <Link href="/tesla" className="group" onClick={() => setMega(false)}>
              <p className="font-display text-lg text-ember">Tesla Hub</p>
              <p className="mono-label mt-1">Wraps, tint & PPF for Model 3/Y/S/X</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile ? (
        <div
          className="flex min-h-[calc(100svh-64px)] flex-col gap-6 bg-graphite py-10 md:hidden"
          style={{ paddingInline: "var(--gutter)" }}
        >
          {services.map((s) => (
            <Link
              key={s.slug}
              href={s.href}
              className="font-display text-2xl text-ink"
              onClick={() => setMobile(false)}
            >
              {s.title}
            </Link>
          ))}
          <Link href="/tesla" className="font-display text-2xl text-ember" onClick={() => setMobile(false)}>
            Tesla Hub
          </Link>
          {nav.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg text-muted"
              onClick={() => setMobile(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4">
            <MagneticButton href={nav.cta.href} variant="primary">
              {nav.cta.label}
            </MagneticButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
