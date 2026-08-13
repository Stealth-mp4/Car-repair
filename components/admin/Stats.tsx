"use client";

import Link from "next/link";
import { useAdmin, dashboardStats } from "@/lib/admin/store";
import { canSee, seesMoney } from "@/lib/admin/access";
import { currency } from "@/lib/admin/format";
import { CalendarIcon, CarIcon, DollarIcon, UsersIcon } from "@/components/admin/icons";

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
  href,
  icon: Icon,
  status,
  error,
}: {
  label: string;
  value: string;
  href: string;
  icon: (p: { className?: string }) => React.ReactNode;
  status: "loading" | "ready";
  /** Set when the tile's source collection failed to load. */
  error?: string;
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
      {/* A tile is a single number with no room to qualify itself, so a failed
          or pending load shows a dash. "0" here would be read as fact. */}
      <p className="mt-1 font-display text-3xl tracking-tight text-ink">
        {error || status === "loading" ? (
          <span className="text-muted">—</span>
        ) : (
          value
        )}
      </p>
      <p className={`mono-label mt-2 ${error ? "text-red" : ""}`}>
        {error ? "Couldn't load" : status === "loading" ? "Loading…" : "Live"}
      </p>
    </Link>
  );
}

/** The four headline tiles, each reporting its own source's load state. */
export function StatRow() {
  const store = useAdmin();
  const stats = dashboardStats(store);
  const { status, errors } = store;
  // Revenue reads the payments table, which RLS closes to technicians and front
  // desk. Rendering the tile anyway would show them a confident "$0" — a wrong
  // number is worse than an absent one.
  const access = useAdmin((s) => s.me?.access);
  const money = seesMoney(access);
  // Same reasoning as `money`, for the same reason it was missed: a technician
  // can't read customers, so this tile counted an empty list and reported "0
  // new customers" as fact.
  const people = canSee(access, "customers");

  const columns = 2 + (money ? 1 : 0) + (people ? 1 : 0);

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 ${
        columns === 4 ? "xl:grid-cols-4" : columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2"
      }`}
    >
      <StatCard
        label="Total Appointments"
        value={String(stats.appointments)}
        status={status}
        error={errors.appointments}
        href="/admin/appointments"
        icon={CalendarIcon}
      />
      <StatCard
        label="Active Projects"
        value={String(stats.activeProjects)}
        status={status}
        error={errors.projects}
        href="/admin/projects"
        icon={CarIcon}
      />
      {money && (
        <StatCard
          label="Total Revenue"
          value={currency(stats.revenue)}
          status={status}
          // The tile sums payments rows now, so it answers for that collection
          // rather than for the chart's pre-aggregated series.
          error={errors.payments}
          href="/admin/finance"
          icon={DollarIcon}
        />
      )}
      {people && (
        <StatCard
          label="New Customers"
          value={String(stats.newCustomers)}
          status={status}
          error={errors.customers}
          href="/admin/customers"
          icon={UsersIcon}
        />
      )}
    </div>
  );
}
