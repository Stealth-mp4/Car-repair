/**
 * lib/account/data.ts — customer account types + seed data.
 *
 * SIMULATED, DELIBERATELY. There is no backend behind any of this: sign-up and
 * sign-in mutate the zustand store in lib/account/store.ts and persist to the
 * visitor's own localStorage. Nothing leaves the browser, passwords are held in
 * plain text, and clearing site data wipes every account. That is fine for a
 * clickable demo and is NOT fine to launch — see the SECURITY note in store.ts
 * for what replacing it involves.
 *
 * Sibling to lib/admin/data.ts, which seeds the console the same way.
 *
 * SCOPE: the shop does not run memberships, a points programme, or referrals,
 * so there are no plans, tiers, or reward types here. The account is exactly
 * three things — book a visit, look up your own service records and invoices,
 * keep your details current.
 */

export type ActivityKind = "service" | "account";

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  label: string;
  detail: string;
  date: string;
};

export type AppointmentRequest = {
  id: string;
  service: string;
  /** both optional — the shop confirms the slot, the customer only requests it */
  date?: string;
  time?: string;
  vehicle?: string;
  note?: string;
  createdAt: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
};

export type NotificationKey = "billing" | "service" | "promos";

/**
 * An offer this member has claimed. Written when they click through to the
 * promo's checkout, which is the only moment the site sees.
 *
 * `headline` is copied rather than looked up by id: an offer expires and drops
 * out of `activePromos()`, but the customer's record of claiming it shouldn't
 * turn into a blank row six weeks later.
 *
 * There is deliberately no "paid" state. Payment happens on Square/Stripe's
 * hosted page and nothing tells this site the outcome — inventing a status here
 * would be a lie the dashboard can't back up. A real webhook is what upgrades
 * this to a payment record.
 */
export type ClaimedPromo = {
  promoId: string;
  headline: string;
  claimedAt: string;
};

export type AccountUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** plain text — simulated store, see the file header */
  password: string;
  /**
   * Links this login to a customer in content/customers/*.json, so Service
   * History and Billing show that customer's real passport records instead of
   * inventing a second set. Self-signed-up accounts have no link and get the
   * empty state until the shop attaches one.
   */
  customerId?: string;
  vehicle: { makeModel: string; plate: string };
  joined: string;
  appointments: AppointmentRequest[];
  activity: ActivityEntry[];
  claims: ClaimedPromo[];
  notifications: Record<NotificationKey, boolean>;
};

/* ---- Seeded demo account ------------------------------------------------ */

/**
 * One seeded login so the client can open the dashboard with data in it.
 * Deliberately tied to `cust-001` (Marcus Delgado) in content/customers, which
 * already has two vehicles, four service records, four invoices, and four
 * warranties behind it — so Service History and Billing show real records
 * rather than lorem.
 *
 * The credentials are printed on the sign-in page on purpose, exactly as the
 * admin console does with its own demo login.
 */
export const DEMO_LOGIN = {
  email: "marcus.delgado@example.com",
  password: "iqballaz",
} as const;

export const seedUser: AccountUser = {
  id: "usr-001",
  firstName: "Marcus",
  lastName: "Delgado",
  email: DEMO_LOGIN.email,
  phone: "(713) 555-0142",
  password: DEMO_LOGIN.password,
  customerId: "cust-001",
  vehicle: { makeModel: "2023 Tesla Model 3", plate: "MD 7719" },
  joined: "2025-01-18",
  appointments: [],
  // One claimed offer so the Promos tab opens with something in it. The id
  // matches a live promo in lib/site.ts.
  claims: [
    {
      promoId: "satin-black-wrap-1999",
      headline: "$1,999 satin black wrap special",
      claimedAt: "2026-08-02",
    },
  ],
  activity: [
    {
      id: "ac-003",
      kind: "account",
      label: "Promo claimed",
      detail: "$1,999 satin black wrap special",
      date: "2026-08-02",
    },
    {
      id: "ac-002",
      kind: "service",
      label: "Service completed",
      detail: "Ceramic tint — Model 3",
      date: "2025-03-04",
    },
    {
      id: "ac-001",
      kind: "account",
      label: "Account created",
      detail: "Welcome to Iqballaz Customs",
      date: "2025-01-18",
    },
  ],
  notifications: { billing: true, service: true, promos: false },
};
