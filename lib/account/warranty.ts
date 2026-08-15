/**
 * lib/account/warranty.ts — how close a warranty is to running out.
 *
 * Replaces `warrantyStatus` in lib/passport.ts, which took a Warranty row from
 * the JSON. Warranties are columns on a service record now (0013), and the
 * important difference is the null case: work with no cover sold returns null
 * here, where the old signature could only say "expired". Printing a red
 * "expired" against a job that never had a warranty is a confident wrong
 * answer, which is the one thing the console's notes are most insistent about.
 *
 * Import-free so `node --test` can load it.
 */

export type WarrantyStatus = "active" | "expiring" | "expired";

/** Inside this many days of expiry counts as "expiring". */
export const EXPIRING_WINDOW_DAYS = 60;

/**
 * `today` is passed in rather than read from the clock: the dashboard pins
 * "today" to the shop's timezone (see TODAY in lib/admin/data.ts), and a helper
 * that reads Date.now() itself can't be tested and drifts from the rest of the
 * UI at midnight.
 */
export function warrantyStatus(
  expires: string | null | undefined,
  today: string,
): WarrantyStatus | null {
  if (!expires) return null;
  if (expires < today) return "expired";

  // String dates, so the arithmetic happens in UTC on both sides — no local
  // timezone can shift one of them across a day boundary and not the other.
  const days = (Date.parse(`${expires}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000;
  return days <= EXPIRING_WINDOW_DAYS ? "expiring" : "active";
}
