/**
 * Panel — the console's only card. Raised stage + warm hairline, 12px radius,
 * no shadow (DESIGN.md "Hairline-Not-Shadow Rule"). Optional header row with a
 * title and a right-hand slot for a period select or a "View all" link.
 */

import Link from "next/link";
import { ArrowRightIcon } from "@/components/admin/icons";

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
    /*
     * min-w-0 is load-bearing. A grid item defaults to `min-width: auto`, which
     * refuses to shrink below its content's intrinsic width — so a panel whose
     * body is wider than the column stretches the column instead, pushing past
     * the viewport where `body { overflow-x: clip }` chops it off. That reads as
     * a clipped panel. With min-w-0 the panel takes the column's width and
     * ScrollX below can actually do its job.
     */
    <section
      className={`min-w-0 rounded-media border border-line bg-black-raised ${className}`}
    >
      {title ? (
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg tracking-tight text-ink">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/**
 * ScrollX — horizontal scroll for panel bodies that genuinely can't compress:
 * the revenue chart's axis + labels, and list rows carrying a thumbnail, two
 * lines of text, a date, a time, and a status pill. Below the min width these
 * scroll instead of clipping or truncating everything to an ellipsis.
 *
 * The scrollbar is deliberately left visible — it's the only affordance saying
 * there's more to the right.
 *
 * The min-width is released at `sm`, and the scroll container with it. On the
 * dashboard grid these panels are only 333-420px wide at xl, so an unscoped
 * min-width made them scroll on desktop too — where they were never clipped.
 */
export function ScrollX({
  children,
  min = "min-w-[30rem]",
}: {
  children: React.ReactNode;
  /** static Tailwind min-w-* class; must be a literal, Tailwind can't see interpolation */
  min?: string;
}) {
  return (
    <div className="overflow-x-auto sm:overflow-x-visible">
      <div className={`${min} sm:min-w-0`}>{children}</div>
    </div>
  );
}

/** "View All →" link used in panel headers. */
export function ViewAll({ href, label = "View All" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mono-label link-underline inline-flex items-center gap-1.5 text-cream transition-colors hover:text-red"
    >
      {label}
      <ArrowRightIcon className="h-3.5 w-3.5" />
    </Link>
  );
}
