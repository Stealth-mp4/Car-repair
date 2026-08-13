/**
 * scripts/invite-staff.ts — creates a console login for every staff row that
 * doesn't have one yet, and links it back via staff.userId.
 *
 *   node --experimental-strip-types scripts/invite-staff.ts
 *
 * Prints each generated password ONCE. They are not stored anywhere and cannot
 * be recovered — hand them over, and have people change them at first sign-in.
 *
 * Deliberately not using Supabase's invite emails: those need SMTP configured,
 * and the built-in sender is rate-limited to a couple an hour and meant for
 * testing only. Set up SMTP and switch to inviteUserByEmail when the shop is
 * onboarding staff regularly rather than once.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");

const db = createClient(url, key, { auth: { persistSession: false } });

/** 18 random chars. crypto, not Math.random — this is a real credential. */
const tempPassword = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(14))).toString("base64url");

async function main() {
// Active staff only. An 'invited' row is someone who hasn't accepted yet —
// minting them a working password here would skip the acceptance it represents.
const { data: staff, error } = await db
  .from("staff")
  .select("id, name, email, userId")
  .is("userId", null)
  .eq("status", "active");

if (error) throw new Error(error.message);
if (!staff?.length) {
  console.log("Every staff row already has a login.");
  return;
}

for (const person of staff) {
  const password = tempPassword();

  const { data: created, error: authError } = await db.auth.admin.createUser({
    email: person.email,
    password,
    // No confirmation email to bounce off unconfigured SMTP; the shop is
    // handing these out in person anyway.
    email_confirm: true,
  });

  if (authError) {
    console.error(`  ${person.email.padEnd(32)} FAILED — ${authError.message}`);
    continue;
  }

  // The link is what makes them staff. Without it they have valid credentials
  // and no console access, which is exactly what the login action rejects.
  const { error: linkError } = await db
    .from("staff")
    .update({ userId: created.user.id })
    .eq("id", person.id);

  if (linkError) {
    console.error(`  ${person.email.padEnd(32)} created but NOT linked — ${linkError.message}`);
    continue;
  }

  console.log(`  ${person.email.padEnd(32)} ${password}`);
}

console.log("\nPasswords above are shown once. Change them after first sign-in.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
