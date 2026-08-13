import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Panel } from "@/components/admin/Panel";
import StatusPill from "@/components/admin/StatusPill";
import { ResetStaffPassword } from "@/components/admin/PasswordForms";
import { canSee } from "@/lib/admin/access";
import { currentStaff } from "@/lib/supabase/server";
import {
  BusinessForm,
  HoursForm,
  OpeningHoursForm,
  SocialForm,
} from "@/components/admin/SettingsForms";
import { loadSettings } from "./actions";

export const metadata: Metadata = { title: "Settings" };

/**
 * Settings. Business details, hours and social links are editable and stored in
 * the `settings` table (migration 0003); lib/site.ts supplies the default for
 * any group that has never been saved.
 *
 * Integrations below stay read-only on purpose — they are environment
 * variables, and a form that appeared to set a secret without being able to
 * would be worse than no form.
 */

/**
 * Last-edited stamp, shown only once a group has actually been saved.
 *
 * Deliberately silent otherwise: a group falling back to lib/site.ts is
 * serving the same values it would if you'd typed them in, so announcing
 * "never saved" only reads as a problem. The case where the distinction is
 * real — a failed read — gets the alert at the top of the page instead.
 */
function Source({ at }: { at?: string }) {
  if (!at) return null;
  return (
    <p className="mono-label border-t border-line px-5 py-3 normal-case tracking-normal">
      Last saved {new Date(at).toLocaleString()}
    </p>
  );
}

const integrations = [
  {
    name: "Lead intake",
    detail: "POST /api/lead — contact form, quote builder, chat widget",
    env: "LEAD_WEBHOOK_URL (optional)",
    status: "active",
    note: "Every enquiry lands in Messages with the caller's number. The webhook is an extra copy for a CRM, not required.",
  },
  {
    name: "Payments",
    detail: "Card + financing capture",
    env: "STRIPE_SECRET_KEY",
    status: "pending",
    note: "Payment records are stored and editable, but nothing is charged — the amounts are entered by hand.",
  },
  {
    name: "Email / SMS",
    detail: "Appointment confirmations and reminders",
    env: "RESEND_API_KEY, TWILIO_AUTH_TOKEN",
    status: "pending",
    note: "Password reset emails are built and wait on SMTP. Confirming an appointment still sends the customer nothing.",
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
    env: "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY",
    status: "active",
    note: "Supabase Auth, one account per staff member, with per-role RLS. Passwords are changed in Your account.",
  },
];

export default async function AdminSettings() {
  // Settings is Super Admin only in the access matrix, and this route has no
  // [section] guard in front of it — it renders from its own file.
  const me = await currentStaff();
  if (!canSee(me?.access, "settings")) redirect("/admin");

  const { values, saved, error } = await loadSettings();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-muted">
          Business details, hours, and the services this console talks to.
        </p>
      </header>

      {/* A failed read means the forms below are showing lib/site.ts defaults,
          and saving one would write those defaults over whatever is really
          stored. Say so rather than letting them look authoritative. */}
      {error && (
        <div role="alert" className="rounded-media border border-red/50 bg-black-raised px-5 py-4">
          <p className="mono-label text-red">Couldn&apos;t load saved settings</p>
          <p className="mt-2 text-sm text-cream">
            The forms below are showing the built-in defaults, not what&apos;s stored.
            Reload before saving anything, or you may overwrite real values.
          </p>
          <code className="mono-label mt-2 inline-block break-all normal-case tracking-normal text-muted">
            {error}
          </code>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {/* flex-col on the panel + flex-1 on the form is what keeps every Save
            button on the card's bottom edge: grid items stretch to the tallest
            in their row, so a short form would otherwise end halfway up. */}
        <Panel title="Business" className="flex flex-col">
          <BusinessForm values={values.business} />
          <Source at={saved.business} />
        </Panel>

        <Panel title="Opening hours" className="flex flex-col">
          <HoursForm values={values.hours} />
          <Source at={saved.hours} />
        </Panel>

        <Panel title="Opening hours (search engines)" className="flex flex-col">
          <p className="px-5 pt-5 text-sm text-muted">
            The structured version of the hours beside this. Nobody sees it on the
            site — it goes into the listing Google reads, so it&apos;s worth keeping
            it honest.
          </p>
          <OpeningHoursForm values={values.openingHours} />
          <Source at={saved.openingHours} />
        </Panel>

        <Panel title="Social" className="flex flex-col">
          <SocialForm values={values.social} />
          <Source at={saved.social} />
        </Panel>

        <Panel title="Support" className="scroll-mt-24" >
          <div id="support" className="space-y-4 p-5">
            <p className="text-cream">
              <strong className="text-ink">Promos publish.</strong> Editing one in the
              console updates /promos, the offer bar above the nav, and the member
              promos page within a request or two — those pages are cached and
              rebuild themselves after a change. Expired offers drop off on their own.
            </p>
            <p className="text-cream">
              <strong className="text-ink">So do the settings above.</strong> Name,
              phone, address, hours and social links feed the footer, contact page,
              booking forms and the search-engine listing, all on the same cache-and-
              rebuild cycle, including the site domain and the search-engine listing.
              Nothing on this page is hand-edited in code any more. What still lives
              in lib/site.ts is design copy — the hero lines, the wordmark, the
              service pages — none of which is a shop detail.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${values.business.email}`}
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

      <Panel title="Reset a staff password">
        <p className="px-5 pt-5 text-sm text-muted">
          The fallback when the reset email can&apos;t reach someone — wrong
          address on file, or no mailbox at all. Everyone can reset their own
          password from the sign-in page; this sets one by hand instead, to be
          handed over in person and changed from Your account.
        </p>
        <ResetStaffPassword />
      </Panel>
    </div>
  );
}
