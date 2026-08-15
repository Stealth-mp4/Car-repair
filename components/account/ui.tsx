/**
 * components/account/ui.tsx — the small set of surfaces every account page
 * reuses: a panel, a stat tile, a labelled field, a toggle. Kept here rather
 * than repeated per page so the eight pages stay visually identical.
 */
"use client";

import type { SVGProps } from "react";

export const fieldClass =
  "w-full rounded-input border border-line bg-black px-4 py-3 text-ink placeholder:text-muted outline-none transition-colors focus:border-red";

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-media border border-line bg-black-raised ${className}`}>
      {title || action ? (
        <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          {title ? <h2 className="font-display text-lg text-ink">{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      <div className="p-6">{children}</div>
    </section>
  );
}

/**
 * Stat tile. `feature` inverts it to the burgundy plate — used for at most one
 * tile in a row, the way the client's reference highlights a single figure.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  detail,
  feature = false,
}: {
  icon: (p: SVGProps<SVGSVGElement>) => React.ReactElement;
  label: string;
  value: React.ReactNode;
  detail?: string;
  feature?: boolean;
}) {
  return (
    <div
      className={`rounded-media border p-5 ${
        feature ? "border-maroon/60 bg-burgundy" : "border-line bg-black-raised"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          feature ? "bg-black/40" : "bg-maroon/25"
        }`}
      >
        <Icon className="h-[18px] w-[18px] text-red" />
      </span>
      <p className="mono-label mt-4">{label}</p>
      <p className="mt-1 font-display text-3xl leading-none text-ink">{value}</p>
      {detail ? <p className="mt-2 text-sm text-cream/70">{detail}</p> : null}
    </div>
  );
}

export function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: (p: SVGProps<SVGSVGElement>) => React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mono-label flex items-center gap-2">
        {Icon ? <Icon className="h-3.5 w-3.5 text-red" /> : null}
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

/** Rows in a definition-style list — label left, value right, hairline between. */
export function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3.5 last:border-b-0">
      <span className="text-sm text-cream/80">
        {label}
        {sub ? <span className="mono-label mt-0.5 block">{sub}</span> : null}
      </span>
      <span className="text-right text-sm text-ink">{value}</span>
    </div>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-6 border-b border-line py-3.5 text-left last:border-b-0"
    >
      <span className="text-sm text-cream/85">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
          on ? "bg-red" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-ink transition-transform duration-300 ease-brand ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

/** The one filled button style, matching the site's btn-sweep primary. */
export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
      className={`btn-sweep mono-label bg-red px-6 py-3.5 text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

/** Outlined counterpart for secondary actions. */
export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`mono-label rounded-full border border-line px-5 py-2.5 text-cream transition-colors hover:border-red hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-media border border-dashed border-line px-6 py-8 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-cream/70">{body}</p>
    </div>
  );
}

/** Dates are stored ISO; every page shows them the same way. */
/**
 * Accepts a date ("2025-01-22") or a timestamptz
 * ("2026-08-14T17:13:47.695313+00:00") — `promo_claims.claimedAt` and
 * `appointments.createdAt` are the latter, and passing one in used to render
 * "Invalid Date" because the template below appended a second time component.
 *
 * The slice is also what keeps the day correct: parsing a bare "YYYY-MM-DD" is
 * UTC, so anyone west of Greenwich would see the previous day. Forcing local
 * midnight avoids that.
 */
export const formatDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatMoney = (amount: number) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
