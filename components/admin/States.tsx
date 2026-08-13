"use client";

import { useState } from "react";
import { useAdmin, type Collections } from "@/lib/admin/store";

/**
 * The three things a panel can show instead of data: still loading, failed to
 * load, or genuinely empty. One file, because the distinction between them is
 * the whole point and keeping them apart in three components invites a tab to
 * quietly render the wrong one.
 */

/** Shimmering placeholder rows. Height matched to a table row so nothing jumps. */
export function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3 flex-1 animate-pulse rounded-full bg-line" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-line" />
          <div className="hidden h-3 w-20 animate-pulse rounded-full bg-line lg:block" />
        </div>
      ))}
    </div>
  );
}

export function Loading({ label = "Loading", rows }: { label?: string; rows?: number }) {
  return (
    <div>
      {/* The visual is decorative; this is what a screen reader gets. */}
      <p role="status" className="sr-only">
        {label}…
      </p>
      <Skeleton rows={rows} />
    </div>
  );
}

/**
 * A failed fetch. Never renders the data area — the entire point is that we do
 * not know what the data is, so the tab must not imply an answer.
 */
export function LoadError({ what, message }: { what: string; message?: string }) {
  const reload = useAdmin((s) => s.reload);
  const [retrying, setRetrying] = useState(false);

  return (
    <div role="alert" className="px-5 py-12 text-center">
      <p className="font-display text-lg text-ink">Couldn&apos;t load {what}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Nothing is shown here because we don&apos;t know what&apos;s there — this is
        not an empty {what} list.
      </p>
      {message && (
        <code className="mono-label mt-3 inline-block break-all rounded-input border border-line px-3 py-1.5 normal-case tracking-normal text-cream">
          {message}
        </code>
      )}
      <button
        type="button"
        disabled={retrying}
        onClick={async () => {
          setRetrying(true);
          await reload();
          setRetrying(false);
        }}
        className="btn-sweep mono-label mt-5 bg-red px-5 py-2.5 text-ink disabled:opacity-60"
        style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
      >
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

/**
 * Wraps a dashboard panel's body. Renders the panel's data only when we
 * actually have it; otherwise the skeleton or the error, never the data area.
 */
export function Guard({
  of,
  what,
  rows,
  children,
}: {
  of: keyof Collections;
  what: string;
  rows?: number;
  children: React.ReactNode;
}) {
  const status = useAdmin((s) => s.status);
  const error = useAdmin((s) => s.errors[of]);

  if (error) return <LoadError what={what} message={error} />;
  if (status === "loading") return <Loading label={`Loading ${what}`} rows={rows} />;
  return <>{children}</>;
}

/** Genuinely nothing there — a claim we can only make after a clean load. */
export function Empty({ what }: { what: string }) {
  return (
    <p className="px-5 py-12 text-center text-muted">
      No {what} yet. New records will appear here.
    </p>
  );
}
