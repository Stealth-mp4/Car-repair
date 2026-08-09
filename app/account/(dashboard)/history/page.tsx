"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, currentUser } from "@/lib/account/store";
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
  formatDate,
  formatMoney,
} from "@/components/account/ui";
import { WrenchIcon, CheckCircleIcon, DollarIcon, CarIcon } from "@/components/account/icons";

const STATUS_STYLE = {
  active: "text-ok",
  expiring: "text-warn",
  expired: "text-red",
} as const;

/**
 * Service history — the account-area view of the Vehicle Passport. Reads the
 * same content/{vehicles,service-records,invoices,warranties}/*.json through
 * lib/passport, so there is exactly one set of records behind the access-code
 * page at /passport and the signed-in page here.
 */
export default function AccountHistoryPage() {
  const user = useAccount(currentUser);
  if (!user) return null;

  const vehicles = user.customerId ? getVehiclesForCustomer(user.customerId) : [];
  const records = vehicles.flatMap((v) =>
    getServiceHistory(v.id).map((r) => ({ ...r, vehicle: v })),
  );
  const allRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const invoices = vehicles.flatMap((v) => getInvoices(v.id));
  const lifetimeSpend = invoices.reduce((sum, i) => sum + i.amount, 0);
  const liveWarranties = vehicles
    .flatMap((v) => getWarranties(v.id))
    .filter((w) => warrantyStatus(w) !== "expired");

  if (vehicles.length === 0) {
    return (
      <Panel title="Your vehicles">
        <EmptyState
          title="No records on file yet"
          body="Once we've worked on your car, every service, warranty, and invoice shows up here. If you've been in before, the shop can link your existing records to this account."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account/book"
            style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
            className="btn-sweep mono-label bg-red px-5 py-3 text-ink"
          >
            Book your first visit
          </Link>
          <Link
            href="/passport"
            className="mono-label rounded-full border border-line px-5 py-3 text-cream transition-colors hover:border-red hover:text-ink"
          >
            I have an access code
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={WrenchIcon}
          label="Total services"
          value={allRecords.length}
          detail="lifetime"
        />
        <StatTile
          icon={CheckCircleIcon}
          label="Active warranties"
          value={liveWarranties.length}
          detail="still in cover"
        />
        <StatTile
          feature
          icon={DollarIcon}
          label="Lifetime spend"
          value={formatMoney(lifetimeSpend)}
          detail={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        />
      </div>

      <h2 className="font-display text-xl text-ink">Your vehicles</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {vehicles.map((v) => {
          const cover = v.media.find((m) => m.type === "image");
          const warranties = getWarranties(v.id);
          return (
            <div
              key={v.id}
              className="overflow-hidden rounded-media border border-line bg-black-raised"
            >
              {cover ? (
                <div className="media-frame relative aspect-16/9 w-full rounded-none">
                  <Image
                    src={cover.src}
                    alt={cover.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="graded object-cover"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <p className="mono-label flex items-center gap-2 text-red">
                  <CarIcon className="h-3.5 w-3.5" />
                  {v.year}
                </p>
                <h3 className="mt-2 font-display text-xl text-ink">
                  {v.make} {v.model}
                </h3>
                <dl className="mt-4 space-y-1 text-sm">
                  {v.wrapColor ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-cream/70">Wrap</dt>
                      <dd className="text-ink">{v.wrapColor}</dd>
                    </div>
                  ) : null}
                  {v.tint ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-cream/70">Tint</dt>
                      <dd className="text-right text-ink">
                        {v.tint.shade}
                        {v.tint.brand ? ` · ${v.tint.brand}` : ""}
                      </dd>
                    </div>
                  ) : null}
                  {v.ppf ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-cream/70">PPF</dt>
                      <dd className="text-right text-ink">
                        {v.ppf.coverage}
                        {v.ppf.brand ? ` · ${v.ppf.brand}` : ""}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {warranties.length > 0 ? (
                  <ul className="mt-5 space-y-1.5 border-t border-line pt-4">
                    {warranties.map((w) => {
                      const status = warrantyStatus(w);
                      return (
                        <li key={w.id} className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-cream/80">
                            {w.service}
                            {w.provider ? ` · ${w.provider}` : ""}
                          </span>
                          <span className={`mono-label ${STATUS_STYLE[status]}`}>
                            {status === "expired" ? "expired" : `to ${formatDate(w.expires)}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                <Link
                  href={`/passport/${v.id}`}
                  className="mono-label link-underline mt-5 inline-block text-red"
                >
                  Open full passport ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <Panel title="Past services">
        <ul>
          {allRecords.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-4 border-b border-line py-3.5 last:border-b-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon/25">
                <WrenchIcon className="h-4 w-4 text-red" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{r.service}</span>
                <span className="mono-label">
                  {r.vehicle.year} {r.vehicle.make} {r.vehicle.model} · {formatDate(r.date)}
                </span>
              </span>
              {r.notes ? (
                <span className="hidden max-w-xs truncate text-sm text-cream/60 lg:block">
                  {r.notes}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
