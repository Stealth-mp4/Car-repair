"use client";

import Link from "next/link";
import { useAccount, currentUser } from "@/lib/account/store";
import type { ActivityKind } from "@/lib/account/data";
import {
  getVehiclesForCustomer,
  getServiceHistory,
  getInvoices,
  getWarranties,
  warrantyStatus,
} from "@/lib/passport";
import {
  Panel,
  StatTile,
  EmptyState,
  GhostButton,
  formatDate,
  formatMoney,
} from "@/components/account/ui";
import {
  CalendarIcon,
  WrenchIcon,
  CarIcon,
  DollarIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/account/icons";

const ACTIVITY_ICON: Record<ActivityKind, typeof WrenchIcon> = {
  service: WrenchIcon,
  account: UserIcon,
};

export default function AccountOverviewPage() {
  const user = useAccount(currentUser);
  if (!user) return null;

  // Next service = the soonest appointment this member has requested that
  // hasn't been cancelled or completed. Nothing booked is the common case.
  const nextAppointment = [...user.appointments]
    .filter((a) => a.status !== "cancelled" && a.status !== "completed")
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"))[0];

  const vehicles = user.customerId ? getVehiclesForCustomer(user.customerId) : [];
  const services = vehicles.flatMap((v) => getServiceHistory(v.id));
  const invoices = vehicles.flatMap((v) => getInvoices(v.id));
  const lifetimeSpend = invoices.reduce((sum, i) => sum + i.amount, 0);
  const liveWarranties = vehicles
    .flatMap((v) => getWarranties(v.id))
    .filter((w) => warrantyStatus(w) !== "expired");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-cream/70">
          {vehicles.length > 0
            ? `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} on file · ${liveWarranties.length} warrant${liveWarranties.length === 1 ? "y" : "ies"} still active`
            : "No vehicles on file yet — add one in your profile."}
        </p>
        <Link
          href="/account/book"
          style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
          className="btn-sweep mono-label inline-flex items-center gap-2 bg-red px-5 py-3 text-ink"
        >
          <CalendarIcon className="h-4 w-4" />
          Book appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          feature
          icon={CalendarIcon}
          label="Next service"
          value={nextAppointment?.date ? formatDate(nextAppointment.date) : "—"}
          detail={nextAppointment?.service ?? "Nothing booked"}
        />
        <StatTile
          icon={CarIcon}
          label="Vehicles"
          value={vehicles.length}
          detail={vehicles.length === 0 ? "None on file" : "in your garage"}
        />
        <StatTile
          icon={WrenchIcon}
          label="Services"
          value={services.length}
          detail="completed with us"
        />
        <StatTile
          icon={DollarIcon}
          label="Lifetime spend"
          value={formatMoney(lifetimeSpend)}
          detail={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title="Recent activity"
          className="lg:col-span-2"
          action={
            <Link href="/account/history" className="mono-label link-underline text-red">
              Service history ↗
            </Link>
          }
        >
          {user.activity.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              body="Your appointments and completed work will show up here."
            />
          ) : (
            <ul className="space-y-1">
              {user.activity.slice(0, 6).map((a) => {
                const Icon = ACTIVITY_ICON[a.kind];
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-4 border-b border-line py-3 last:border-b-0"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon/25">
                      <Icon className="h-4 w-4 text-red" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{a.label}</span>
                      <span className="block truncate text-sm text-cream/70">{a.detail}</span>
                    </span>
                    <span className="mono-label shrink-0">{formatDate(a.date)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Warranty cover">
            {liveWarranties.length === 0 ? (
              <p className="text-sm text-cream/70">
                No active warranties on file. Anything we install is covered — the
                paperwork lands here once the work is done.
              </p>
            ) : (
              <ul className="space-y-2">
                {liveWarranties.slice(0, 4).map((w) => (
                  <li key={w.id} className="flex items-start gap-3 text-sm">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red" />
                    <span>
                      <span className="block text-ink">{w.service}</span>
                      <span className="mono-label">to {formatDate(w.expires)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/account/history"
              className="mono-label mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-cream transition-colors hover:border-red hover:text-ink"
            >
              View records
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </Panel>

          <Panel title="Quick actions">
            <div className="flex flex-wrap gap-2">
              <Link href="/account/history">
                <GhostButton type="button" className="flex items-center gap-2">
                  <WrenchIcon className="h-3.5 w-3.5" />
                  Service history
                </GhostButton>
              </Link>
              <Link href="/account/billing">
                <GhostButton type="button" className="flex items-center gap-2">
                  <DollarIcon className="h-3.5 w-3.5" />
                  Invoices
                </GhostButton>
              </Link>
              <Link href="/account/profile">
                <GhostButton type="button" className="flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5" />
                  Edit profile
                </GhostButton>
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
