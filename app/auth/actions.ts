"use server";

import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { validatePassword } from "@/lib/auth/password";

export type AuthState = { error?: string; ok?: string };

/**
 * Send a reset link.
 *
 * The response is deliberately identical whether or not the address has an
 * account, and the Supabase error is swallowed after logging: a form that says
 * "no such user" is an account-enumeration oracle, and this one is reachable by
 * anyone on the internet. Supabase rate-limits the endpoint itself.
 */
export async function sendResetLink(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Enter a valid email address." };

  // Built from the request rather than a hardcoded domain so it works in dev,
  // on a preview deploy, and in production without a rebuild. Supabase only
  // honours it if it matches the project's redirect allow-list.
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const db = await supabaseServer();
  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/auth/reset`,
  });
  if (error) console.error("[auth/forgot]", error.message);

  return { ok: "If that address has an account, a reset link is on its way." };
}

/**
 * Set a new password for whoever the recovery link signed in.
 *
 * `getUser()` is the authorisation check: reaching this action at all requires
 * a session, and the only way to have one here is to have opened a link sent to
 * that mailbox. No current-password prompt, because not knowing it is the
 * entire reason someone is on this page.
 */
export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  const invalid = validatePassword(next, confirm);
  if (invalid) return { error: invalid };

  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    return { error: "That reset link has expired. Ask for a new one and try again." };
  }

  const { error } = await db.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { ok: "Password updated. You're signed in." };
}
