/**
 * lib/admin/format.ts — display formatting for the console.
 *
 * Everything here is pure and clock-free: values are derived from the ISO
 * strings passed in and from `TODAY`, never `Date.now()`, so the server render
 * and the client hydration always agree. Swap `TODAY` for the request clock
 * when the data goes live and this stays correct.
 */

import { TODAY } from "@/lib/admin/data";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const currency = (n: number) => usd.format(n);

/** "$98.5K" — for axis ticks and tight stat tiles only. */
export function compact(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}

/** ISO date -> "May 27, 2026". Parsed as UTC so the day never shifts by zone. */
export function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** ISO date -> "May 27" (no year) for dense rows. */
export function dayMonth(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "13:00" -> "1:00 PM" */
export function timeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Activity-feed stamp: time of day today, "Yesterday", else the date. */
export function feedStamp(isoDateTime: string): string {
  const [date, time = "00:00"] = isoDateTime.split("T");
  const days = Math.round(
    (Date.parse(`${TODAY}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / DAY_MS
  );
  if (days <= 0) return timeLabel(time.slice(0, 5));
  if (days === 1) return "Yesterday";
  return dayMonth(date);
}

/** "James Carter" -> "JC" */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
