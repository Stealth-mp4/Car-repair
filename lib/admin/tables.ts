/**
 * lib/admin/tables.ts — the map between store collections and the database.
 *
 * Reads and writes don't always hit the same object: two collections read from
 * a view that joins in a derived column, and you can't insert into a join. Kept
 * in one file so a read source and its write target can't drift apart.
 */

import type { RowCollections } from "@/lib/admin/store";

/** Where each collection is READ from — a table, or a view that adds derived columns. */
export const READ_FROM = {
  appointments: "appointments",
  projects: "projects",
  customers: "admin_customers",
  vehicles: "admin_vehicles",
  invoices: "invoices",
  serviceRecords: "admin_service_records",
  payments: "payments",
  services: "services",
  reviews: "reviews",
  messages: "messages",
  staff: "staff",
  inventory: "inventory",
  promos: "promos",
  promoClaims: "admin_promo_claims",
  finance: "finance",
  activity: "activity",
  // `notifications` is intentionally absent: the table exists but nothing ever
  // wrote to it, and the bell now derives what needs attention from live rows.
  // See `attention()` in lib/admin/store.ts.
} as const satisfies Record<keyof RowCollections, string>;

/** Where each collection is WRITTEN to. Only the view-backed ones differ. */
export const WRITE_TO = {
  ...READ_FROM,
  customers: "customers",
  vehicles: "vehicles",
  serviceRecords: "service_records",
  promoClaims: "promo_claims",
} as const;

/**
 * Columns the database computes and the client must not send back. A stale
 * `lifetimeValue` from a form round-trip would be rejected as an unknown
 * column — these are view columns, not table columns.
 */
export const DERIVED: Partial<Record<keyof RowCollections, string[]>> = {
  customers: ["vehicleCount", "lifetimeValue"],
  vehicles: ["customerName"],
  serviceRecords: ["vehicleLabel"],
  // paidAt is stamped by the trigger in 0015 and squareOrderId is written by the
  // webhook (0016) — neither is typed. Sending the client's copy back would let
  // a form loaded before a payment landed overwrite both with nulls.
  promoClaims: ["customerName", "paidAt", "squareOrderId"],
};

/** Row identity. Everything is keyed by `id` except the service catalogue. */
export const PRIMARY_KEY: Partial<Record<keyof RowCollections, string>> = {
  services: "slug",
};

export const pkOf = (c: keyof RowCollections) => PRIMARY_KEY[c] ?? "id";

/** Strips derived columns before a write. */
export function writable(collection: keyof RowCollections, row: Record<string, unknown>) {
  const drop = DERIVED[collection];
  if (!drop) return row;
  return Object.fromEntries(Object.entries(row).filter(([k]) => !drop.includes(k)));
}
