import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/admin/Panel";
import StatusPill from "@/components/admin/StatusPill";
import { business, hours, social, promo, services } from "@/lib/site";

export const metadata: Metadata = { title: "Settings" };

/**
 * Settings — deliberately read-only. Every value below is currently sourced
 * from `lib/site.ts` or an environment variable, so rendering editable inputs
 * would fake a save that has nowhere to go. Each panel names where the value
 * actually lives; wire the fields up once a settings table + PATCH route exist
 * (see the "Going live" section of README-admin.md).
 */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-3 last:border-0">
      <dt className="mono-label">{label}</dt>
      <dd className="text-cream">{value}</dd>
    </div>
  );
}

function Source({ children }: { children: React.ReactNode }) {
  return (
    <p className="mono-label border-t border-line px-5 py-3 normal-case tracking-normal">
      {children}
    </p>
  );
}

const integrations = [
  {
    name: "Lead intake",
    detail: "POST /api/lead — quote form + chat widget",
    env: "LEAD_WEBHOOK_URL",
    status: "pending",
    note: "Falls back to server logs until a destination is set.",
  },
  {
    name: "Payments",
    detail: "Card + financing capture",
    env: "STRIPE_SECRET_KEY",
    status: "pending",
    note: "Payments below are seed records; nothing is charged yet.",
  },
  {
    name: "Email / SMS",
    detail: "Appointment confirmations and reminders",
    env: "RESEND_API_KEY, TWILIO_AUTH_TOKEN",
    status: "pending",
    note: "Confirming an appointment currently only updates local state.",
  },
  {
    name: "Reviews sync",
    detail: "Google Business Profile",
    env: "GOOGLE_PLACES_API_KEY",
    status: "pending",
    note: "Reviews are hand-entered until the Places pull is wired.",
  },
  {
    name: "Console auth",
    detail: "Who can reach /admin",
    env: "ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET",
    status: "active",
    note: "Seeded demo login (admin / iqballaz), signed session cookie. Set the env vars or add per-user accounts before real use.",
  },
];

export default function AdminSettings() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-muted">
          Business details, hours, and the services this console talks to.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Business">
          <dl className="px-5">
            <Field label="Name" value={business.name} />
            <Field label="Phone" value={business.phone} />
            <Field label="Email" value={business.email} />
            <Field
              label="Address"
              value={`${business.address.street}, ${business.address.locality}, ${business.address.region} ${business.address.postalCode}`}
            />
            <Field label="Site" value={business.url} />
          </dl>
          <Source>Edited in lib/site.ts → `business`</Source>
        </Panel>

        <Panel title="Opening hours">
          <dl className="px-5">
            {hours.map((h) => (
              <Field key={h.day} label={h.day} value={h.value} />
            ))}
          </dl>
          <Source>
            Edited in lib/site.ts → `hours` + `openingHours` (the second feeds the
            LocalBusiness JSON-LD, keep them in step)
          </Source>
        </Panel>

        <Panel title="Public site">
          <dl className="px-5">
            <Field label="Live promo" value={promo.active ? promo.headline : "None"} />
            <Field label="Promo window" value={promo.label} />
            <Field label="Service pages" value={`${services.length} published`} />
            <Field label="Instagram" value={social.instagramHandle} />
            <Field label="TikTok" value={social.tiktokHandle} />
          </dl>
          <Source>Edited in lib/site.ts → `promo`, `services`, `social`</Source>
        </Panel>

        <Panel title="Support" className="scroll-mt-24" >
          <div id="support" className="space-y-4 p-5">
            <p className="text-cream">
              This console ships with seed data. Everything you change here lives in
              the browser until the services below are connected.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${business.email}`}
                className="btn-sweep mono-label inline-flex items-center bg-red px-5 py-2.5 text-ink"
                style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
              >
                Email the shop
              </a>
              <Link
                href="/admin/activity"
                className="btn-sweep mono-label inline-flex items-center border border-line px-5 py-2.5 text-ink"
                style={{ ["--sweep" as string]: "var(--color-black-raised)" } as React.CSSProperties}
              >
                Open activity log
              </Link>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Integrations">
        <ul>
          {integrations.map((i) => (
            <li
              key={i.name}
              className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-line px-5 py-4 last:border-0"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-ink">{i.name}</span>
                <span className="mono-label mt-1 block">{i.detail}</span>
                <span className="mt-1 block text-sm text-muted">{i.note}</span>
              </span>
              <code className="mono-label rounded-input border border-line px-3 py-1.5 normal-case tracking-normal text-cream">
                {i.env}
              </code>
              <StatusPill tone={i.status === "active" ? "ok" : "warn"}>
                {i.status === "active" ? "Connected" : "Not connected"}
              </StatusPill>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
