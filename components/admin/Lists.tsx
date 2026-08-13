"use client";

import Image from "next/image";
import { useAdmin, upcomingAppointments } from "@/lib/admin/store";
import { dayMonth, feedStamp, initials, shortDate, timeLabel } from "@/lib/admin/format";
import { Panel, ScrollX, ViewAll } from "@/components/admin/Panel";
import { Empty, Guard } from "@/components/admin/States";
import StatusPill from "@/components/admin/StatusPill";
import { toneFor } from "@/lib/admin/sections";
import {
  CalendarIcon,
  CarIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarIcon,
  DotsIcon,
  MailIcon,
  StarIcon,
  UserIcon,
} from "@/components/admin/icons";

/* ---- Recent appointments ------------------------------------------------- */

export function RecentAppointments() {
  const appointments = useAdmin((s) => s.appointments);
  const rows = [...appointments]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  return (
    <Panel
      title="Recent Appointments"
      className="h-full"
      action={<ViewAll href="/admin/appointments" />}
    >
      <Guard of="appointments" what="appointments" rows={5}>
      {rows.length === 0 && <Empty what="appointments" />}
      <ScrollX>
        <ul>
          {rows.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0"
            >
              <span className="media-frame relative h-12 w-20 shrink-0">
                {a.image && (
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="graded object-cover"
                  />
                )}
              </span>
              {/* Date + time sit under the title rather than in their own columns:
                  this panel is a third of the grid, and four side-by-side columns
                  crushed the vehicle name to an ellipsis. */}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{a.vehicle}</span>
                <span className="mono-label mt-0.5 block truncate">{a.service}</span>
                <span className="mono-label mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {dayMonth(a.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {timeLabel(a.time)}
                  </span>
                </span>
              </span>
              <StatusPill tone={toneFor(a.status)}>{a.status}</StatusPill>
            </li>
          ))}
        </ul>
      </ScrollX>
      </Guard>
    </Panel>
  );
}

/* ---- Upcoming appointments ----------------------------------------------- */

export function UpcomingAppointments() {
  const rows = upcomingAppointments(useAdmin()).slice(0, 4);
  const setStatus = useAdmin((s) => s.setAppointmentStatus);

  return (
    <Panel
      title="Upcoming Appointments"
      className="h-full"
      action={<ViewAll href="/admin/appointments" label="View Calendar" />}
    >
      <Guard of="appointments" what="appointments" rows={4}>
      {rows.length === 0 && <Empty what="upcoming appointments" />}
      <ScrollX>
        <ul>
          {rows.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line px-5 py-4 last:border-0"
            >
              <span className="font-display text-lg tracking-tight text-ink">
                {timeLabel(a.time)}
              </span>
              <span className="mono-label w-14">{dayMonth(a.date)}</span>
              <CarIcon className="h-5 w-5 shrink-0 text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{a.vehicle}</span>
                <span className="mono-label mt-1 block truncate">{a.service}</span>
              </span>
              {a.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => setStatus(a.id, "confirmed")}
                  className="mono-label rounded-full border border-warn/40 px-3 py-1 text-warn transition-colors hover:border-ok/40 hover:text-ok"
                >
                  Confirm
                </button>
              ) : (
                <StatusPill tone={toneFor(a.status)}>{a.status}</StatusPill>
              )}
            </li>
          ))}
        </ul>
      </ScrollX>
      </Guard>
    </Panel>
  );
}

/* ---- Recent customers ---------------------------------------------------- */

export function RecentCustomers() {
  const customers = useAdmin((s) => s.customers);
  const rows = [...customers]
    .sort((a, b) => b.joined.localeCompare(a.joined))
    .slice(0, 5);

  return (
    <Panel
      title="Recent Customers"
      className="h-full"
      action={<ViewAll href="/admin/customers" />}
    >
      <Guard of="customers" what="customers" rows={5}>
      {rows.length === 0 && <Empty what="customers" />}
      <ul>
        {rows.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0"
          >
            <span className="mono-label flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-maroon bg-burgundy text-ink">
              {initials(c.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{c.name}</span>
              <span className="mono-label mt-0.5 flex items-baseline justify-between gap-3">
                <span className="truncate normal-case tracking-normal">{c.email}</span>
                <span className="shrink-0">{shortDate(c.joined)}</span>
              </span>
            </span>
            <a
              href={`mailto:${c.email}`}
              aria-label={`Email ${c.name}`}
              className="rounded-input p-1.5 text-muted transition-colors hover:text-red"
            >
              <DotsIcon className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>
      </Guard>
    </Panel>
  );
}

/* ---- Recent activity ----------------------------------------------------- */

const activityIcon = {
  appointment: CalendarIcon,
  payment: DollarIcon,
  project: CheckCircleIcon,
  customer: UserIcon,
  review: StarIcon,
  message: MailIcon,
} as const;

export function RecentActivity() {
  const activity = useAdmin((s) => s.activity);
  const rows = [...activity].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);

  return (
    <Panel
      title="Recent Activity"
      className="h-full"
      action={<ViewAll href="/admin/activity" />}
    >
      <Guard of="activity" what="activity" rows={5}>
      {rows.length === 0 && <Empty what="activity" />}
      <ScrollX>
        <ul>
          {rows.map((a) => {
            const Icon = activityIcon[a.kind];
            return (
              <li
                key={a.id}
                className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0"
              >
                <Icon className="h-4 w-4 shrink-0 text-red" />
                <span className="min-w-0 flex-1 truncate text-sm text-cream">
                  {a.text}
                </span>
                <span className="mono-label shrink-0">{feedStamp(a.at)}</span>
              </li>
            );
          })}
        </ul>
      </ScrollX>
      </Guard>
    </Panel>
  );
}
