"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { brand } from "@/lib/site";
import { useShop } from "@/components/ShopProvider";
import { prefersReducedMotion } from "@/lib/gsap";

const FADE_IN_MS = 400;
const HOLD_MS = 1600;
const FADE_OUT_MS = 500;

/**
 * SplashScreen (V5) — pure black stage, centered logo mark with a gleam sweep,
 * fade in → hold → fade out (~2.5s total). Plays on every full load of the
 * homepage (no once-per-session gate) and nowhere else. Default state already
 * renders the overlay in SSR output, so it's the first thing painted — never
 * a flash of the page behind it. Skipped under prefers-reduced-motion.
 */
export default function SplashScreen() {
  const shop = useShop();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [logoVisible, setLogoVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    if (prefersReducedMotion()) {
      setDone(true);
      return;
    }

    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setLogoVisible(true));
    const toOut = setTimeout(() => setOverlayVisible(false), FADE_IN_MS + HOLD_MS);
    const toDone = setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
    }, FADE_IN_MS + HOLD_MS + FADE_OUT_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(toOut);
      clearTimeout(toDone);
      document.body.style.overflow = "";
    };
  }, [isHome]);

  if (!isHome || done) return null;

  const maskProps = {
    WebkitMaskImage: `url(${brand.markTight})`,
    maskImage: `url(${brand.markTight})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as React.CSSProperties;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      style={{
        opacity: overlayVisible ? 1 : 0,
        transition: `opacity ${FADE_OUT_MS}ms var(--ease-brand)`,
      }}
    >
      <div
        className="relative h-[18vh] w-[18vh] max-h-40 max-w-40"
        style={{
          opacity: logoVisible ? 1 : 0,
          transition: `opacity ${FADE_IN_MS}ms var(--ease-brand)`,
        }}
      >
        <Image
          src={brand.markTight}
          alt={shop.business.name}
          fill
          sizes="200px"
          priority
          className="object-contain"
        />
        {/* Gleam sweep, masked to the logo's own silhouette */}
        <div className="splash-gleam pointer-events-none absolute inset-0" style={maskProps} />
      </div>
    </div>
  );
}
