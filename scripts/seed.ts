/**
 * scripts/seed.ts — loads the existing seed records into Supabase.
 *
 *   node --experimental-strip-types scripts/seed.ts
 *
 * Reads straight from lib/admin/data.ts and lib/site.ts rather than restating
 * 300 rows as SQL, so the seed can't drift from the fixtures the console was
 * built against. Idempotent: every write is an upsert on the primary key.
 *
 * Needs SUPABASE_SECRET_KEY (the sb_secret_… key, formerly service_role) — it
 * writes past RLS, which no browser session is allowed to do.
 */

import { createClient } from "@supabase/supabase-js";
import * as seed from "../lib/admin/data.ts";
import { promos } from "../lib/site.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");

const db = createClient(url, key, { auth: { persistSession: false } });

/** Drops keys the DB now derives, so a stale seed value can't override a view. */
const omit = <T extends object>(rows: T[], ...keys: string[]) =>
  rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !keys.includes(k))));

/**
 * The fixtures were authored against this date, and every one of them is
 * relative to it: appointments "this week", payments "last month", warranties
 * expiring "soon".
 */
const ANCHOR = "2026-08-03";

const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
const SHIFT_DAYS = Math.round((Date.parse(today) - Date.parse(ANCHOR)) / 86_400_000);

/**
 * Slides every ISO date in the seed forward by however long it's been since the
 * fixtures were written, so a freshly seeded console looks like a shop that is
 * open today rather than one that stopped taking bookings on a date in the past.
 *
 * Shifts the whole set by the same offset, so the relationships the fixtures
 * encode (this invoice is 22 days overdue, that project is due next week) all
 * survive. Matches the leading YYYY-MM-DD only, leaving times and zones alone.
 */
function reanchor<T>(value: T): T {
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return value;
    const d = new Date(`${m[0]}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + SHIFT_DAYS);
    return (d.toISOString().slice(0, 10) + value.slice(10)) as T;
  }
  if (Array.isArray(value)) return value.map(reanchor) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, reanchor(v)]),
    ) as T;
  }
  return value;
}

async function put(table: string, rows: object[], onConflict = "id") {
  const { error } = await db.from(table).upsert(reanchor(rows), { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table.padEnd(14)} ${rows.length}`);
}

async function main() {
  // Order follows the foreign keys: customers before vehicles before the rest.
  await put("customers", omit(seed.customers, "vehicleCount", "lifetimeValue"));
  await put("vehicles", omit(seed.vehicles, "customerName"));
  await put("appointments", seed.appointments);
  await put("projects", seed.projects);
  await put("invoices", omit(seed.invoices, "fileUrl"));
  await put("payments", seed.payments);
  await put("services", seed.serviceItems, "slug");
  await put("reviews", seed.reviews);
  await put("messages", seed.messages);
  await put("staff", omit(seed.staff, "userId"));
  await put("inventory", seed.inventory);
  await put("finance", seed.finance);
  await put("promos", promos);

  // Seeding fires the activity triggers, which would bury the real feed under a
  // hundred "created" rows. Clear them and put back the authored ones.
  await db.from("activity").delete().neq("id", "");
  await put("activity", seed.activity);
  await put("notifications", seed.notifications);

  console.log("seeded");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
