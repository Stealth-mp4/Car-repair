"use client";

import { useAccount, currentUser } from "@/lib/account/store";
import { getVehiclesForCustomer, getInvoices } from "@/lib/passport";
import { payments } from "@/lib/site";
import { useShop } from "@/components/ShopProvider";
import {
  Panel,
  StatTile,
  EmptyState,
  formatDate,
  formatMoney,
} from "@/components/account/ui";
import {
  FileIcon,
  CheckCircleIcon,
  CardIcon,
  DollarIcon,
  ArrowRightIcon,
} from "@/components/account/icons";

export default function AccountBillingPage() {
  const shop = useShop();
  const user = useAccount(currentUser);
  if (!user) return null;

  const vehicles = user.customerId ? getVehiclesForCustomer(user.customerId) : [];
  const invoices = vehicles
    .flatMap((v) => getInvoices(v.id))
    .sort((a, b) => b.date.localeCompare(a.date));

  const thisYear = new Date().getFullYear();
  const paidThisYear = invoices
    .filter((i) => new Date(i.date).getFullYear() === thisYear)
    .reduce((sum, i) => sum + i.amount, 0);
  const lifetime = invoices.reduce((sum, i) => sum + i.amount, 0);

  const stripeReady = payments.portalUrl.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          feature
          icon={DollarIcon}
          label="Lifetime spend"
          value={formatMoney(lifetime)}
          detail={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"} on file`}
        />
        <StatTile
          icon={FileIcon}
          label="Outstanding"
          value={formatMoney(0)}
          detail="0 invoices due"
        />
        <StatTile
          icon={CheckCircleIcon}
          label={`Paid in ${thisYear}`}
          value={formatMoney(paidThisYear)}
          detail="settled"
        />
      </div>

      {/* Stripe — the only online payment method */}
      <div className="rounded-media border border-maroon/60 bg-burgundy p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/40">
            <CardIcon className="h-5 w-5 text-red" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl text-ink">Payments run through Stripe</h2>
            <p className="mt-2 max-w-xl text-cream/85">
              Card details never touch this site. Stripe handles the payment and holds the
              card on file, so you manage payment methods and download receipts in their
              secure portal.
            </p>
          </div>
        </div>

        <div className="mt-7">
          {stripeReady ? (
            <a
              href={payments.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
              className="btn-sweep mono-label inline-flex items-center gap-2 bg-red px-6 py-3.5 text-ink"
            >
              {payments.label}
              <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45" />
            </a>
          ) : (
            <>
              <span
                aria-disabled="true"
                className="mono-label inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-red/40 px-6 py-3.5 text-ink/60"
              >
                {payments.label}
                <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45" />
              </span>
              <p className="mono-label mt-3 leading-relaxed">
                <span className="text-warn">Not connected yet</span>
                <br />
                <span className="normal-case tracking-normal text-cream/80">
                  Add the shop&apos;s Stripe link in{" "}
                  <code className="text-ink">lib/site.ts → payments.portalUrl</code> and this
                  button goes live. Until then, pay in person or call{" "}
                  <a href={shop.business.phoneHref} className="link-underline text-ink">
                    {shop.business.phone}
                  </a>
                  .
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      <Panel title="Invoice history">
        {invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            body="Invoices from completed work show up here, with a receipt you can download."
          />
        ) : (
          <ul>
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex items-center gap-4 border-b border-line py-3.5 last:border-b-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon/25">
                  <FileIcon className="h-4 w-4 text-red" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{invoice.description}</span>
                  <span className="mono-label">
                    {invoice.id.toUpperCase()} · {formatDate(invoice.date)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm text-ink">{formatMoney(invoice.amount)}</span>
                  <span className="mono-label text-ok">paid</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
