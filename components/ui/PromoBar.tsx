"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Promo } from "@/lib/site";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type Parts = { day: number; hr: number; min: number; sec: number };

function remaining(endsAt: string, now: number): Parts | null {
  const ms = new Date(endsAt).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return {
    day: Math.floor(ms / DAY),
    hr: Math.floor((ms % DAY) / HOUR),
    min: Math.floor((ms % HOUR) / MINUTE),
    sec: Math.floor((ms % MINUTE) / SECOND),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span className="font-mono text-[0.8rem] tabular-nums text-ink sm:text-sm">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-ink/55">
        {label}
      </span>
    </span>
  );
}

/**
 * Live countdown chip row. Renders nothing until it has mounted and nothing
 * once the deadline passes, so a caller can use `null` as "this offer is over".
 * Shared by the promo bar and the /promos cards.
 */
export function Countdown({ endsAt, className = "" }: { endsAt: string; className?: string }) {
  const [left, setLeft] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setLeft(remaining(endsAt, Date.now()));
    tick();
    const id = setInterval(tick, SECOND);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!left) return null;

  return (
    <span
      className={`flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 sm:gap-3 ${className}`}
    >
      <Unit value={left.day} label="day" />
      <span className="text-ink/30">:</span>
      <Unit value={left.hr} label="hr" />
      <span className="text-ink/30">:</span>
      <Unit value={left.min} label="min" />
      <span className="text-ink/30">:</span>
      <Unit value={left.sec} label="sec" />
    </span>
  );
}

/**
 * Promo bar — the strip above the nav that Meta ads land against. Shows the
 * soonest-expiring live offer and counts down to its deadline, then removes
 * itself the moment the deadline passes.
 *
 * The countdown mounts empty and fills in on the client: the server has no idea
 * what second it is in the visitor's browser, and rendering one would guarantee
 * a hydration mismatch. The offer text itself is server-rendered, so the bar
 * never pops in from nothing.
 */
export default function PromoBar({ promo }: { promo: Promo | null }) {
  const [left, setLeft] = useState<Parts | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!promo) return;
    const tick = () => {
      const parts = remaining(promo.endsAt, Date.now());
      setLeft(parts);
      // A visitor who leaves the tab open past the deadline shouldn't still be
      // looking at a live offer.
      if (!parts) setExpired(true);
    };
    tick();
    const id = setInterval(tick, SECOND);
    return () => clearInterval(id);
  }, [promo]);

  if (!promo || expired) return null;

  return (
    <Link
      href="/promos"
      className="group flex items-center justify-center gap-x-4 gap-y-1 border-b border-maroon/60 bg-burgundy px-4 py-2 text-center sm:gap-x-6"
    >
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-cream sm:text-[0.7rem]">
        {promo.barText}
      </span>
      {left ? <Countdown endsAt={promo.endsAt} /> : null}
      <span className="link-underline hidden font-mono text-[0.6rem] uppercase tracking-[0.1em] text-red sm:inline-block">
        View offers
      </span>
    </Link>
  );
}
