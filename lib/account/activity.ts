/**
 * lib/account/activity.ts — the dashboard's activity feed, derived.
 *
 * There is no `activity` table for customers and deliberately never was. Every
 * entry the feed shows is already recorded somewhere as the thing itself:
 *
 *   Account created       customers.joined
 *   Service completed     service_records.date
 *   Appointment requested appointments.createdAt
 *   Promo claimed         promo_claims.claimedAt
 *
 * A table would mean writing a second row on every event and then keeping the
 * two in agreement forever. Deriving means the feed cannot drift from the
 * records it describes, cannot be half-written when an insert fails, and needs
 * no backfill for the history that already exists — Marcus's four services show
 * up in his feed without anyone recording that they should.
 *
 * (The shop-side `activity` table in 0001 is a different thing: an audit log
 * written by a Postgres trigger on six tables, for the console. It records who
 * changed what, not what happened to a customer's car.)
 *
 * Import-free so `node --test` can load it.
 */

export type ActivityKind = "service" | "account";

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  label: string;
  detail: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
};

/** Only the fields the feed reads, so callers can pass their fuller rows. */
type Sources = {
  customer: { joined: string; name: string };
  serviceRecords: { id: string; service: string; date: string }[];
  appointments: {
    id: string;
    service: string;
    createdAt: string;
    status: string;
  }[];
  claims: { id: string; headline: string; claimedAt: string }[];
};

/** timestamptz -> YYYY-MM-DD. The feed groups by day; the clock time is noise. */
const day = (timestamp: string): string => timestamp.slice(0, 10);

/**
 * Newest first.
 *
 * Ties are broken by kind then id rather than left to sort stability, because
 * several of these genuinely share a date — Marcus had a PPF and a tint fitted
 * on the same day — and a feed that reshuffles between renders looks broken.
 */
export function activityFeed(s: Sources): ActivityEntry[] {
  const entries: ActivityEntry[] = [
    {
      id: `joined-${s.customer.joined}`,
      kind: "account",
      label: "Account created",
      detail: "Welcome to Iqballaz Customs",
      date: s.customer.joined,
    },
    ...s.serviceRecords.map((r) => ({
      id: `svc-${r.id}`,
      kind: "service" as const,
      label: "Service completed",
      detail: r.service,
      date: r.date,
    })),
    ...s.appointments.map((a) => ({
      id: `apt-${a.id}`,
      kind: "service" as const,
      // The status the shop has put it in, not "requested" forever — the feed
      // is the customer's view of where things got to.
      label:
        a.status === "cancelled"
          ? "Appointment cancelled"
          : a.status === "confirmed"
            ? "Appointment confirmed"
            : a.status === "completed"
              ? "Appointment completed"
              : "Appointment requested",
      detail: a.service,
      date: day(a.createdAt),
    })),
    ...s.claims.map((c) => ({
      id: `promo-${c.id}`,
      kind: "account" as const,
      label: "Promo claimed",
      detail: c.headline,
      date: day(c.claimedAt),
    })),
  ];

  return entries.sort(
    (a, b) => b.date.localeCompare(a.date) || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id),
  );
}
