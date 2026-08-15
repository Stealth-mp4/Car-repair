"use client";

import { useInvoices } from "@/lib/account/customer";
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

/** Matches the console's own invoice colours. */
const STATUS_TONE = {
  paid: "text-ok",
  due: "text-warn",
  overdue: "text-red",
} as const;

export default function AccountBillingPage() {
  const shop = useShop();
  // Straight off the session — RLS already scoped these to the signed-in
  // customer, newest first.
  const invoices = useInvoices();

  const thisYear = new Date().getFullYear();

  // Every one of these used to be a lie. "Outstanding" was a hardcoded $0 over
  // "0 invoices due", and each row printed "paid" regardless — because the JSON
  // these came from had no status column at all. It does now.
  const outstanding = invoices.filter((i) => i.status !== "paid");
  const owed = outstanding.reduce((sum, i) => sum + Number(i.amount), 0);

  const paidThisYear = invoices
    .filter((i) => i.status === "paid" && new Date(i.date).getFullYear() === thisYear)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  // Lifetime spend counts what was actually paid, not what was billed —
  // an unpaid invoice isn't spend.
  const lifetime = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

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
          value={formatMoney(owed)}
          detail={`${outstanding.length} invoice${outstanding.length === 1 ? "" : "s"} due`}
        />
        <StatTile
          icon={CheckCircleIcon}
          label={`Paid in ${thisYear}`}
          value={formatMoney(paidThisYear)}
          detail="settled"
        />
      </div>

      {/*
        How the shop actually takes money, stated plainly.

        This used to promise a Stripe billing portal with a "manage payment
        methods" button — and there is no Stripe account, no portal, and no
        stored cards. Invoices are raised in the console and settled in person
        or by a link the shop sends. The one online payment path is a Square
        link on a promo, which is a checkout for that offer, not an account
        portal. Copy that describes a payment system the shop doesn't run is
        worse than no copy: it invites a customer to go looking for a login that
        was never created.
      */}
      <div className="rounded-media border border-maroon/60 bg-burgundy p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/40">
            <CardIcon className="h-5 w-5 text-red" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl text-ink">How to settle an invoice</h2>
            <p className="mt-2 max-w-xl text-cream/85">
              Pay at the shop by card or cash when you collect the vehicle, or ask
              us to send a payment link. Card details never touch this site.
            </p>
            <p className="mt-4 text-cream/85">
              Questions about a bill?{" "}
              <a href={shop.business.phoneHref} className="link-underline text-ink">
                {shop.business.phone}
              </a>
            </p>
          </div>
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
                  <span className={`mono-label ${STATUS_TONE[invoice.status]}`}>
                    {invoice.status === "paid"
                      ? "paid"
                      : `${invoice.status} ${formatDate(invoice.dueDate)}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
