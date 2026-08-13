"use server";

import { supabaseServer, currentStaff } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/auth/password";

export type PasswordState = { error?: string; ok?: string };

// Shared with the reset flow — one definition of "acceptable password", so the
// console and the emailed link can't drift apart on it.
const validate = validatePassword;

/** Change your own password. Needs the current one — see below. */
export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invalid = validate(next, confirm);
  if (invalid) return { error: invalid };

  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user?.email) return { error: "You're not signed in." };

  // Supabase does NOT require the current password to change it — an active
  // session is enough. That means an unattended logged-in machine is a silent
  // account takeover, so re-authenticate first and make this a real check.
  const { error: authError } = await db.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (authError) return { error: "Your current password isn't right." };

  const { error } = await db.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { ok: "Password changed." };
}

/**
 * Set someone else's password. Super Admin only.
 *
 * This is the stand-in for a "forgot password" email: the shop has no SMTP
 * configured, so recovery is somebody with the owner account setting a new one
 * and handing it over. Configure SMTP and use resetPasswordForEmail when the
 * team outgrows that.
 */
export async function setStaffPassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const me = await currentStaff();
  if (me?.access !== "Super Admin") return { error: "Only a Super Admin can do that." };

  const staffId = String(formData.get("staffId") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invalid = validate(next, confirm);
  if (invalid) return { error: invalid };

  // Read the target's auth id through the ADMIN client. Read it fresh rather
  // than trusting a userId posted from the browser — otherwise this action
  // would happily reset any account whose uuid someone could guess.
  const { data: target, error: lookupError } = await supabaseAdmin
    .from("staff")
    .select("name, userId")
    .eq("id", staffId)
    .maybeSingle();

  if (lookupError || !target) return { error: "No such staff member." };
  if (!target.userId) return { error: `${target.name} doesn't have a login yet.` };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(target.userId, {
    password: next,
  });
  if (error) return { error: error.message };

  return { ok: `New password set for ${target.name}. Hand it over in person.` };
}
