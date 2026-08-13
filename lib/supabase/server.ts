/**
 * lib/supabase/server.ts — Supabase client for Server Components, Server
 * Actions, and Route Handlers.
 *
 * Runs as the signed-in user, so every query is subject to RLS. This is the
 * one to reach for by default; see ./admin.ts for the rare exception.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function supabaseServer() {
  const store = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. That's fine and expected:
          // the middleware refreshes the session on every request, so the
          // rotated token is already on its way to the browser. Throwing here
          // would break every page that merely READS data.
        }
      },
    },
  });
}

/**
 * The signed-in staff member, or null. Reads `staff` rather than trusting the
 * session alone — an `auth.users` row with no active staff record is somebody
 * who signed up, or was suspended, not somebody who works here.
 */
export async function currentStaff() {
  const db = await supabaseServer();

  // getUser(), never getSession(): getSession reads the cookie without
  // verifying it, so a forged one would pass. getUser revalidates against the
  // auth server.
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("staff")
    .select("*")
    .eq("userId", user.id)
    .eq("status", "active")
    .maybeSingle();

  return data;
}
