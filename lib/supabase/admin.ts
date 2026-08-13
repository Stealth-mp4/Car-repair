/**
 * lib/supabase/admin.ts — the secret-key client. BYPASSES RLS ENTIRELY.
 *
 * Use it only where there is no signed-in user to act as and the operation is
 * genuinely privileged: seeding, inviting staff, scheduled jobs. Everything
 * else uses ./server.ts, which runs as the user and is subject to policy.
 *
 * Reaching for this to "fix" a query that returns nothing is how a data leak
 * ships — an empty result under RLS usually means the policy is right and the
 * caller isn't who you think.
 */

import "server-only";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  // No session persistence: this client is never a user, so storing or
  // refreshing a token would only risk leaking one between requests.
  { auth: { persistSession: false, autoRefreshToken: false } },
);
