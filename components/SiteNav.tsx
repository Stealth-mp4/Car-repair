"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { business, menu, social } from "@/lib/site";

/**
 * SiteNav (V4 — bugatti.com reference) — thin transparent bar over the hero,
 * solidifies past 40px scroll. "MENU" opens a full-screen overlay: a paper
 * panel sliding in from the left with grouped links, plus two stacked visual
 * cards on wide screens. Replaces the old hover mega-panel entirely.
 */
export default function SiteNav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the overlay is open; close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          solid || open ? "border-b border-line bg-black/95" : "bg-transparent"
        }`}
      >
        <nav
          className="grid grid-cols-3 items-center py-5"
          style={{ paddingInline: "var(--gutter)" }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group flex items-center gap-2.5 justify-self-start"
            aria-expanded={open}
            aria-label="Open menu"
          >
            <span className="flex flex-col gap-[3px]">
              <span className="block h-px w-4 bg-ink transition-transform duration-300 group-hover:translate-x-0.5" />
              <span className="block h-px w-4 bg-ink" />
            </span>
            <span className="mono-label text-ink">Menu</span>
          </button>

          <Link
            href="/"
            className="flex items-baseline justify-center gap-1.5 justify-self-center"
          >
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              {business.wordmark}
            </span>
            <span className="mono-label hidden sm:inline">{business.wordmarkSub}</span>
          </Link>

          <Link
            href="/quote"
            className="link-underline mono-label justify-self-end text-ink"
          >
            Get a Quote
          </Link>
        </nav>
      </header>

      {/* Full-screen overlay menu */}
      <div
        className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          className={`absolute inset-y-0 left-0 flex h-full w-full max-w-[560px] bg-paper text-black transition-transform duration-500 ease-brand md:max-w-none md:w-[80%] xl:w-[85%] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            data-lenis-prevent
            className="scrollbar-none flex h-full w-full flex-col overflow-y-auto overscroll-contain px-8 py-8 sm:px-12 sm:py-10"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="mb-10 flex h-8 w-8 items-center justify-center self-start"
            >
              <span className="relative block h-4 w-4">
                <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 rotate-45 bg-black" />
                <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 -rotate-45 bg-black" />
              </span>
            </button>

            <div className="flex-1 space-y-10 md:grid md:grid-cols-3 md:gap-x-10 md:gap-y-0 md:space-y-0">
              {menu.groups.map((group) => (
                <div key={group.label}>
                  <p className="mono-label text-black/50">{group.label}</p>
                  <ul className="mt-3 space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`group flex items-baseline gap-2 py-1.5 font-display text-xl ${
                            "pinned" in item && item.pinned
                              ? "font-semibold text-red"
                              : "text-black"
                          }`}
                        >
                          {item.label}
                          <span className="text-sm opacity-0 transition-opacity group-hover:opacity-100">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom utility row */}
            <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
              <a href={social.instagram} className="mono-label text-black/60 hover:text-black">
                Instagram
              </a>
              <a href={social.facebook} className="mono-label text-black/60 hover:text-black">
                Facebook
              </a>
            </div>
          </div>

          {/* Visual cards — wide screens only */}
          <div
            data-lenis-prevent
            className="scrollbar-none hidden w-[340px] shrink-0 flex-col gap-4 overflow-y-auto overscroll-contain border-l border-black/10 bg-black p-4 lg:flex"
          >
            {menu.visuals.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                onClick={() => setOpen(false)}
                className="media-frame group relative block aspect-[4/3] shrink-0"
              >
                <Image
                  src={v.image}
                  alt={v.alt}
                  fill
                  sizes="340px"
                  className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <span className="absolute inset-x-4 bottom-4 font-display text-lg text-ink">
                  {v.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
