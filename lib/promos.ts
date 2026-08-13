import "server-only";

import { createClient } from "@supabase/supabase-js";
import { promos as fallback, type Promo } from "@/lib/site";

/**
 * Live promotions for the public site, from the database the console edits.
 *
 * Anonymous client, deliberately: no cookies, so the pages that call this stay
 * statically renderable. Reaching for supabaseServer() here would make /promos
 * and the site nav dynamic on every visit — the busiest pages on the site — to
 * read rows that are identical for everyone.
 *
 * Freshness comes from revalidation instead: saving a promo in the console
 * calls revalidatePath, so the next visitor gets a re-rendered page. An edit is
 * live within a request, not instantly, which is the right trade for something
 * that changes weekly.
 */
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);

/** Same rule as the old activePromos(): unexpired, soonest deadline first. */
const live = (rows: Promo[]) =>
  rows
    .filter((p) => new Date(p.endsAt) > new Date())
    .sort((a, b) => a.endsAt.localeCompare(b.endsAt));

export async function getPromos(): Promise<Promo[]> {
  const { data, error } = await db.from("promos").select("*");

  // Falls back to lib/site.ts rather than rendering an empty promos page. This
  // is the page paid ad traffic lands on: showing the built-in offers during an
  // outage is wrong-ish, showing nothing at all is worse. An offer removed on
  // purpose should be deleted from lib/site.ts too — see README-admin.md.
  if (error) {
    console.error("[promos] falling back to lib/site.ts:", error.message);
    return live(fallback);
  }

  // RLS already filters expired rows, but `live()` runs anyway: the policy is
  // evaluated when the page renders and the page may then be cached, so the
  // sort and the deadline check have to hold at render time regardless.
  return live(data as Promo[]);
}
