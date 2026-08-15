/**
 * lib/account/auth.ts — who is signed in on /account, server side.
 *
 * Sibling to `currentStaff()` in lib/supabase/server.ts, and deliberately the
 * same shape: a valid Supabase session is not by itself an identity here. The
 * question every account page asks is "which customers row is this?", and the
 * answer is null for staff, for a brand-new signup that hasn't been linked, and
 * for anyone forging a cookie.
 */

import "server-only";
import type { Customer, Vehicle } from "@/lib/builds";
import { supabaseServer } from "@/lib/supabase/server";

export type AccountCustomer = Customer & {
  userId: string;
  joined: string;
  /** null until they pick, or when the shop removes the car (FK is set null) */
  primaryVehicleId: string | null;
  notifications: Record<"billing" | "service" | "promos", boolean>;
};

/**
 * The signed-in customer's own record, or null.
 *
 * The `eq("userId", …)` looks redundant against the `customer_reads_self`
 * policy that filters on exactly that — but RLS returning empty and the query
 * being wrong produce the same result, so the filter stays explicit rather than
 * leaning on a policy to be the query.
 */
export async function currentCustomer(): Promise<AccountCustomer | null> {
  const db = await supabaseServer();

  // getUser(), never getSession() — same reason as currentStaff(): getSession
  // decodes the cookie without verifying it against the auth server.
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("customers")
    .select("id, userId, name, phone, email, accessCode, joined, primaryVehicleId, notifications")
    .eq("userId", user.id)
    .maybeSingle();

  return data as AccountCustomer | null;
}

/**
 * The signed-in customer's own vehicles.
 *
 * Relies on `customer_reads_vehicles` (0011) rather than filtering by
 * customerId here: the policy resolves `my_customer_id()` from the session, so
 * there is no id to pass in and no way for a caller to ask for someone else's.
 * Ordered oldest-first so the radio list doesn't reshuffle between visits.
 */
export async function currentVehicles(): Promise<Vehicle[]> {
  const db = await supabaseServer();
  const { data } = await db.from("vehicles").select("*").order("id");
  return (data ?? []) as Vehicle[];
}

/**
 * The shop's ledger line for each job, not a copy of the PDF — there is no
 * `fileUrl`, because the payment processor holds the actual document. That is
 * why this is its own type rather than the passport's `Invoice`.
 *
 * `status` is the column the old JSON didn't have, and its absence is why the
 * billing page used to print "paid" under every row and a hardcoded $0
 * outstanding. Same policy trick as currentVehicles(): the filtering is
 * `customer_reads_invoices`, not a customerId passed in from the caller.
 */
export type AccountInvoice = {
  id: string;
  vehicleId: string | null;
  date: string;
  dueDate: string;
  description: string;
  amount: number;
  status: "paid" | "due" | "overdue";
};

/**
 * A job done on one of their cars, with its warranty on the same row (0013).
 *
 * `warrantyExpires` null means no cover was sold, which is NOT the same as
 * expired — `warrantyStatus` below returns null for it so the UI can leave it
 * out rather than printing a red "expired" against work that never had one.
 */
export type AccountServiceRecord = {
  id: string;
  vehicleId: string;
  service: string;
  date: string;
  notes: string | null;
  buildSlug: string | null;
  warrantyExpires: string | null;
  warrantyProvider: string | null;
  warrantyTerms: string | null;
};

export async function currentServiceRecords(): Promise<AccountServiceRecord[]> {
  const db = await supabaseServer();
  // Reads the table, not admin_service_records: that view exists to hand the
  // console a vehicle label, and this page already has the vehicles.
  const { data } = await db
    .from("service_records")
    .select("id, vehicleId, service, date, notes, buildSlug, warrantyExpires, warrantyProvider, warrantyTerms")
    .order("date", { ascending: false });
  return (data ?? []) as AccountServiceRecord[];
}

/**
 * Their appointment requests and bookings, newest request first.
 *
 * `customer_reads_appointments` (0011) scopes this. Ordered by createdAt rather
 * than `date`, because `date` is the slot they asked for — a request made this
 * morning for next month would otherwise jump above one made last week for
 * tomorrow.
 */
export type AccountAppointment = {
  id: string;
  service: string;
  vehicle: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  createdAt: string;
};

export async function currentAppointments(): Promise<AccountAppointment[]> {
  const db = await supabaseServer();
  const { data } = await db
    .from("appointments")
    .select("id, service, vehicle, date, time, status, createdAt")
    .order("createdAt", { ascending: false });
  return (data ?? []) as AccountAppointment[];
}

/**
 * Offers they've clicked through to checkout on. Claiming never means "paid" —
 * `paid` is a separate tick the shop makes after seeing the money land in
 * Square, because a Dashboard payment link can't report back who paid. See 0015.
 */
export type AccountClaim = {
  id: string;
  promoId: string;
  headline: string;
  claimedAt: string;
  paid: boolean;
};

export async function currentClaims(): Promise<AccountClaim[]> {
  const db = await supabaseServer();
  const { data } = await db
    .from("promo_claims")
    .select("id, promoId, headline, claimedAt, paid")
    .order("claimedAt", { ascending: false });
  return (data ?? []) as AccountClaim[];
}

export async function currentInvoices(): Promise<AccountInvoice[]> {
  const db = await supabaseServer();
  const { data } = await db
    .from("invoices")
    .select("id, vehicleId, date, dueDate, description, amount, status")
    .order("date", { ascending: false });
  return (data ?? []) as AccountInvoice[];
}
