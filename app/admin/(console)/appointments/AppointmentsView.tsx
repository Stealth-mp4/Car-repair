"use client";

import { useState } from "react";
import DataTable from "@/components/admin/DataTable";
import CalendarView from "@/components/admin/CalendarView";
import { CalendarIcon, ListIcon } from "@/components/admin/icons";
import { Guard } from "@/components/admin/States";

/**
 * Appointments is the one section with two shapes: the generic table (search,
 * sort, filter, paginate) and a calendar, which is how a shop actually reads a
 * week. Both write to the same store collection.
 */
export default function AppointmentsView() {
  const [mode, setMode] = useState<"calendar" | "table">("calendar");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Appointments</h1>
          <p className="mt-1 text-muted">
            Every booked, requested, and completed slot.
          </p>
        </div>
        <div className="flex rounded-input border border-line p-1">
          {(
            [
              ["calendar", "Calendar", CalendarIcon],
              ["table", "List", ListIcon],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={`mono-label flex items-center gap-2 rounded-[6px] px-3 py-1.5 transition-colors ${
                mode === value ? "bg-maroon/50 text-ink" : "text-cream hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "calendar" ? (
        // The table renders its own states; the calendar is a grid of days that
        // would otherwise look like a genuinely empty week.
        <Guard of="appointments" what="appointments" rows={6}>
          <CalendarView />
        </Guard>
      ) : (
        <DataTable slug="appointments" heading={false} />
      )}
    </div>
  );
}
