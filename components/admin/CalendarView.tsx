"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import { getSection, toneFor, type Row } from "@/lib/admin/sections";
import { TODAY, type Appointment } from "@/lib/admin/data";
import { timeLabel } from "@/lib/admin/format";
import RowForm from "@/components/admin/RowForm";
import StatusPill from "@/components/admin/StatusPill";
import { ChevronIcon } from "@/components/admin/icons";

/* ---- Date helpers ---------------------------------------------------------
 * All arithmetic runs in UTC on "YYYY-MM-DD" strings. Local-time Date math
 * silently shifts a day either side of a DST boundary, and appointments are
 * stored as plain dates with no zone attached.
 * ------------------------------------------------------------------------- */

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);

function addDays(iso: string, n: number) {
  const d = parse(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}

function addMonths(iso: string, n: number) {
  const d = parse(iso);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  // Clamp: Jan 31 + 1 month is Feb 28/29, not Mar 3.
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return toIso(d);
}

/** Monday-based, matching the shop's Mon–Sat week. */
function startOfWeek(iso: string) {
  const d = parse(iso);
  const shift = (d.getUTCDay() + 6) % 7;
  return addDays(iso, -shift);
}

const monthLabel = (iso: string) =>
  parse(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

const dayLabel = (iso: string) =>
  parse(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

const dayNum = (iso: string) => parse(iso).getUTCDate();
const inMonth = (iso: string, anchor: string) => iso.slice(0, 7) === anchor.slice(0, 7);

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Left edge colour per status — same tones the tables and pills use. */
const edge: Record<string, string> = {
  confirmed: "border-l-ok",
  pending: "border-l-warn",
  completed: "border-l-muted",
  cancelled: "border-l-red",
};

type View = "month" | "week" | "day";

/* ---- Chips --------------------------------------------------------------- */

function Chip({ a, onClick }: { a: Appointment; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`block w-full truncate rounded-[4px] border-l-2 bg-black/60 py-1 pl-2 pr-1 text-left text-[0.6875rem] leading-tight text-cream transition-colors hover:bg-burgundy/50 ${
        edge[a.status] ?? "border-l-line"
      } ${a.status === "cancelled" ? "line-through opacity-60" : ""}`}
    >
      <span className="font-mono">{timeLabel(a.time)}</span> {a.vehicle}
    </button>
  );
}

function AgendaRow({ a, onClick }: { a: Appointment; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-l-2 border-b border-b-line px-4 py-3 text-left transition-colors hover:bg-burgundy/25 ${
        edge[a.status] ?? "border-l-line"
      }`}
    >
      <span className="w-20 font-display text-base tracking-tight text-ink">
        {timeLabel(a.time)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ink">{a.vehicle}</span>
        <span className="mono-label mt-0.5 block truncate">
          {a.service} · {a.customerName}
        </span>
      </span>
      <StatusPill tone={toneFor(a.status)}>{a.status}</StatusPill>
    </button>
  );
}

/* ---- Calendar ------------------------------------------------------------ */

export default function CalendarView() {
  const section = getSection("appointments")!;
  const appointments = useAdmin((s) => s.appointments);

  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(TODAY);
  const [editing, setEditing] = useState<{ row: Row; isNew: boolean } | null>(null);

  /** date -> appointments, sorted by time. One pass instead of filtering per cell. */
  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const list = map.get(a.date);
      if (list) list.push(a);
      else map.set(a.date, [a]);
    }
    for (const list of map.values()) list.sort((x, y) => x.time.localeCompare(y.time));
    return map;
  }, [appointments]);

  const days = useMemo(() => {
    if (view === "day") return [anchor];
    const start = view === "week" ? startOfWeek(anchor) : startOfWeek(`${anchor.slice(0, 8)}01`);
    // 6 rows always, so the grid height doesn't jump between months.
    return Array.from({ length: view === "week" ? 7 : 42 }, (_, i) => addDays(start, i));
  }, [view, anchor]);

  const step = (dir: 1 | -1) =>
    setAnchor((a) =>
      view === "month" ? addMonths(a, dir) : addDays(a, dir * (view === "week" ? 7 : 1))
    );

  const openNew = (date: string) =>
    setEditing({ row: { ...section.table!.blank(), date } as Row, isNew: true });

  const heading =
    view === "day"
      ? dayLabel(anchor)
      : view === "week"
        ? `${dayLabel(days[0]).replace(/^\w+, /, "")} – ${dayLabel(days[6]).replace(/^\w+, /, "")}`
        : monthLabel(anchor);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="rounded-input border border-line p-2 text-cream transition-colors hover:border-maroon"
          >
            <ChevronIcon className="h-4 w-4 rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(TODAY)}
            className="mono-label rounded-input border border-line px-4 py-2 text-cream transition-colors hover:border-maroon"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="rounded-input border border-line p-2 text-cream transition-colors hover:border-maroon"
          >
            <ChevronIcon className="h-4 w-4 -rotate-90" />
          </button>
          <h2 className="ml-2 font-display text-xl tracking-tight text-ink">{heading}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-input border border-line p-1">
            {(["month", "week", "day"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`mono-label rounded-[6px] px-3 py-1.5 capitalize transition-colors ${
                  view === v ? "bg-maroon/50 text-ink" : "text-cream hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openNew(anchor)}
            className="btn-sweep mono-label whitespace-nowrap bg-red px-5 py-2.5 text-ink"
            style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
          >
            New appointment
          </button>
        </div>
      </div>

      {/* Grid */}
      {view === "day" ? (
        <div className="rounded-media border border-line bg-black-raised">
          {(byDate.get(anchor) ?? []).map((a) => (
            <AgendaRow key={a.id} a={a} onClick={() => setEditing({ row: a, isNew: false })} />
          ))}
          {!byDate.get(anchor)?.length && (
            <button
              type="button"
              onClick={() => openNew(anchor)}
              className="w-full px-5 py-16 text-center text-muted transition-colors hover:text-cream"
            >
              Nothing booked. Click to add an appointment.
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-media border border-line bg-black-raised">
          <div className="min-w-[46rem]">
            <div className="grid grid-cols-7 border-b border-line">
              {WEEKDAYS.map((d) => (
                <div key={d} className="mono-label px-3 py-2.5 text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((iso) => {
                const list = byDate.get(iso) ?? [];
                const shown = view === "week" ? list : list.slice(0, 3);
                const dim = view === "month" && !inMonth(iso, anchor);
                return (
                  <div
                    key={iso}
                    role="button"
                    tabIndex={0}
                    onClick={() => openNew(iso)}
                    onKeyDown={(e) => e.key === "Enter" && openNew(iso)}
                    className={`min-h-28 cursor-pointer space-y-1 border-b border-r border-line p-2 transition-colors last:border-r-0 hover:bg-burgundy/20 ${
                      view === "week" ? "min-h-64" : ""
                    } ${dim ? "opacity-35" : ""} ${iso === TODAY ? "bg-burgundy/25" : ""}`}
                  >
                    <span
                      className={`mono-label mb-1 block ${
                        iso === TODAY ? "font-mono text-red" : ""
                      }`}
                    >
                      {dayNum(iso)}
                    </span>
                    {shown.map((a) => (
                      <Chip
                        key={a.id}
                        a={a}
                        onClick={() => setEditing({ row: a, isNew: false })}
                      />
                    ))}
                    {list.length > shown.length && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnchor(iso);
                          setView("day");
                        }}
                        className="mono-label pl-2 text-red hover:text-cream"
                      >
                        +{list.length - shown.length} more
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {(["confirmed", "pending", "completed", "cancelled"] as const).map((s) => (
          <span key={s} className="mono-label flex items-center gap-2">
            <span className={`h-3 w-0.5 border-l-2 ${edge[s]}`} />
            {s}
          </span>
        ))}
      </div>

      {editing && (
        <RowForm
          section={section}
          row={editing.row}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
