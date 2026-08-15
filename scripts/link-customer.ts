/**
 * scripts/link-customer.ts — gives an EXISTING customer row a real login.
 *
 *   npx tsx --env-file=.env.local scripts/link-customer.ts marcus.delgado@example.com
 *
 * Signup (app/account/actions.ts) creates its own customer row and deliberately
 * never adopts one by matching email — that would be an account takeover, since
 * no SMTP means no email confirmation to prove the mailbox. So the seeded and
 * walk-in customers the console already holds have `userId = null` and nobody
 * can sign in as them. This is the office-side counterpart: the shop, holding
 * the secret key, attaches a login to a record it already trusts.
 *
 * Prints the password ONCE. It isn't stored and can't be recovered.
 *
 * Sibling to invite-staff.ts, same reasoning about invite emails: those need
 * SMTP, and there isn't any yet.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");

const email = process.argv[2];
if (!email) throw new Error("Usage: link-customer.ts <customer email>");

const db = createClient(url, key, { auth: { persistSession: false } });

/** 18 random chars. crypto, not Math.random — this is a real credential. */
const tempPassword = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(14))).toString("base64url");

async function main() {
  const { data: customer, error } = await db
    .from("customers")
    .select("id, name, email, userId")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!customer) throw new Error(`No customer row with email ${email}`);
  if (customer.userId) {
    console.log(`${customer.name} already has a login. Nothing to do.`);
    return;
  }

  const password = tempPassword();

  // email_confirm: the shop is vouching for this address, and the confirmation
  // mail couldn't be delivered anyway. Remove it once SMTP is configured and
  // this becomes a genuine invite.
  const { data: created, error: authError } = await db.auth.admin.createUser({
    email: customer.email,
    password,
    email_confirm: true,
  });
  if (authError) throw new Error(authError.message);

  const { error: linkError } = await db
    .from("customers")
    .update({ userId: created.user.id })
    .eq("id", customer.id);

  // The auth user exists but points at nothing, so say which one — leaving an
  // orphan behind silently is how the next run fails with "email already
  // registered" and no explanation.
  if (linkError) {
    throw new Error(
      `Created auth user ${created.user.id} but failed to link it: ${linkError.message}`,
    );
  }

  console.log(`${customer.name} <${customer.email}>`);
  console.log(`  password: ${password}`);
  console.log("  Hand it over and have them change it at first sign-in.");
}

// Not top-level await: tsx transforms these to CJS, which doesn't support it.
// Same ending as invite-staff.ts.
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
