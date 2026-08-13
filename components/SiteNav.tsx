"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import PromoBar from "@/components/ui/PromoBar";
import { UserIcon } from "@/components/ui/icons";
import { brand, menu, nav, type Promo } from "@/lib/site";
import { useShop } from "@/components/ShopProvider";

/**
 * SiteNav (V5 — Mansory reference) — thin transparent bar over the hero,
 * solidifies past 40px scroll. Desktop (>=1024px): link clusters split left
 * and right, the real logo mark centered between them, "Services" opens a
 * hover dropdown of every service page. Below 1024px a menu button opens a
 * dark, full-height slide-out panel carrying the full link set.
 */
export default function SiteNav({ promo }: { promo: Promo | null }) {
  const shop = useShop();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          solid || open ? "border-b border-line bg-black/95" : "bg-transparent"
        }`}
      >
        <PromoBar promo={promo} />
        <nav
          className="grid grid-cols-3 items-center py-4"
          style={{ paddingInline: "var(--gutter)" }}
        >
          {/* Left cluster — menu button (mobile/tablet only) + primary links (desktop) */}
          <div className="flex items-center gap-8 justify-self-start">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-[5px]">
                <span className="block h-px w-5 bg-ink" />
                <span className="block h-px w-5 bg-ink" />
                <span className="block h-px w-5 bg-ink" />
              </span>
            </button>
            <div className="hidden items-center gap-7 lg:flex">
              {nav.left.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="link-underline mono-label text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Logo mark — centred at every width (client note). The grid stays
              three columns on mobile so the empty right cell balances the menu
              button and the mark lands on the true centre line. */}
          <Link
            href="/"
            className="relative h-9 w-24 justify-self-center sm:h-10 sm:w-28"
          >
            <Image
              src={brand.markTight}
              alt={`${shop.business.name} home`}
              fill
              sizes="120px"
              priority
              className="object-contain"
            />
          </Link>

          {/* Right cluster — desktop only, so mobile is a clean two-column
              grid: menu button left, logo right. */}
          <div className="hidden items-center gap-7 justify-self-end lg:flex">
            <div className="flex items-center gap-7">
              {nav.right.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="link-underline mono-label text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {/* nowrap: the account icon after it leaves just enough room at
                1280-1366 for "Book Appointment" to break onto two lines. */}
            <Link
              href={nav.cta.href}
              className="link-underline mono-label whitespace-nowrap text-ink"
            >
              {nav.cta.label}
            </Link>
            <Link
              href={nav.account.href}
              aria-label={nav.account.label}
              title={nav.account.label}
              className="flex items-center justify-center text-ink transition-colors hover:text-red"
            >
              <UserIcon className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile/tablet menu — dark slide-out panel from the right. z-[60]
          (above the z-50 ChatWidget bubble) so the open panel isn't
          obscured by it. */}
      <div
        className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
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
          className={`absolute inset-y-0 left-0 flex h-full w-full max-w-[380px] flex-col overflow-hidden rounded-r-3xl border-r border-line bg-black text-ink transition-transform duration-500 ease-brand sm:max-w-[420px] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            data-lenis-prevent
            className="scrollbar-none flex h-full w-full flex-col overflow-y-auto overscroll-contain px-7 py-7 sm:px-9 sm:py-9"
          >
            {/* Header row — brand mark + close */}
            <div className="mb-10 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-line bg-black-raised"
              >
                <Image
                  src={brand.markTight}
                  alt={shop.business.name}
                  fill
                  sizes="40px"
                  className="object-contain p-1.5"
                />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-red"
              >
                <span className="relative block h-3.5 w-3.5">
                  <span className="absolute left-0 top-1/2 h-px w-3.5 -translate-y-1/2 rotate-45 bg-ink" />
                  <span className="absolute left-0 top-1/2 h-px w-3.5 -translate-y-1/2 -rotate-45 bg-ink" />
                </span>
              </button>
            </div>

            <div className="flex-1">
              {/* Flat top-level links */}
              <ul className="space-y-1">
                {menu.top.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block py-1.5 font-display text-2xl ${
                        isActive(item.href) ? "font-semibold text-red" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Grouped sections */}
              <div className="mt-8 space-y-8">
                {menu.groups.map((group) => (
                  <div key={group.label}>
                    <p className="mono-label text-muted">{group.label}</p>
                    <ul className="mt-3 space-y-1">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="block py-1 font-display text-lg text-ink/85 transition-colors hover:text-ink"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA + socials */}
            <div className="mt-10 space-y-6">
              <MagneticButton href={nav.cta.href} variant="primary" className="w-full">
                {nav.cta.label}
              </MagneticButton>
              <div className="flex items-center justify-between border-t border-line pt-5">
                <a href={shop.social.instagram} className="mono-label text-muted hover:text-ink">
                  Instagram
                </a>
                <a href={shop.social.facebook} className="mono-label text-muted hover:text-ink">
                  Facebook
                </a>
                <a href={shop.social.tiktok} className="mono-label text-muted hover:text-ink">
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
