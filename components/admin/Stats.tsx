"use client";

import Link from "next/link";
import { useAdmin, dashboardStats } from "@/lib/admin/store";
import { deltas } from "@/lib/admin/data";
import { currency } from "@/lib/admin/format";
import { ArrowUpIcon, CalendarIcon, CarIcon, DollarIcon, UsersIcon } from "@/components/admin/icons";

/**
 * DateRange — two native date inputs in one pill. `<input type="date">` gives a
 * real calendar, keyboard entry, and locale formatting for free; a JS picker
 * would be a dependency to reproduce it.
 */
export function DateRange() {
  const range = useAdmin((s) => s.ui.range);
  const setRange = useAdmin((s) => s.setRange);

  const input =
    "bg-transparent font-mono text-xs uppercase tracking-[0.08em] text-cream outline-none [color-scheme:dark]";

  return (
    <div className="inline-flex items-center gap-2 rounded-input border border-line bg-black-raised px-3 py-2">
      <CalendarIcon className="h-4 w-4 text-muted" />
      <input
        type="date"
        aria-label="Range start"
        value={range.from}
        max={range.to}
        onChange={(e) => setRange(e.target.value, range.to)}
        className={input}
      />
      <span className="text-muted">–</span>
      <input
        type="date"
        aria-label="Range end"
        value={range.to}
        min={range.from}
        onChange={(e) => setRange(range.from, e.target.value)}
        className={input}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  href,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: number;
  href: string;
  icon: (p: { className?: string }) => React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-media border border-line bg-black-raised p-5 transition-colors hover:border-maroon"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-input border border-line text-red transition-colors group-hover:border-maroon">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mono-label mt-4">{label}</p>
      <p className="mt-1 font-display text-3xl tracking-tight text-ink">{value}</p>
      <p className="mono-label mt-2 flex items-center gap-1 text-ok">
        <ArrowUpIcon className="h-3 w-3" />
        {delta}% from last week
      </p>
    </Link>
  );
}

/** The four headline tiles. Counts come from the store, deltas from the API. */
export function StatRow() {
  const stats = dashboardStats(useAdmin());

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Appointments"
        value={String(stats.appointments)}
        delta={deltas.appointments}
        href="/admin/appointments"
        icon={CalendarIcon}
      />
      <StatCard
        label="Active Projects"
        value={String(stats.activeProjects)}
        delta={deltas.projects}
        href="/admin/projects"
        icon={CarIcon}
      />
      <StatCard
        label="Total Revenue"
        value={currency(stats.revenue)}
        delta={deltas.revenue}
        href="/admin/finance"
        icon={DollarIcon}
      />
      <StatCard
        label="New Customers"
        value={String(stats.newCustomers)}
        delta={deltas.customers}
        href="/admin/customers"
        icon={UsersIcon}
      />
    </div>
  );
}
