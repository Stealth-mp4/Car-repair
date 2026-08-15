"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/auth/password";
import { safeNext } from "@/lib/account/redirect";
import { fullName } from "@/lib/account/name";
import { createPaymentLink, squareConfigured } from "@/lib/square";

/**
 * app/account/actions.ts — real customer auth, replacing the localStorage
 * simulation that lib/account/store.ts used to be.
 *
 * Same Supabase Auth the console uses, and the same session cookie: there is
 * one `auth.users` table and one login. What separates a customer from a staff
 * member is which row they own — `customers.userId` here, `staff.userId` there
 * — which is why both sign-in paths check for their own row and sign out
 * anyone holding the other kind.
 */

/** `email` is echoed back so a failed attempt doesn't clear the field. */
export type AccountAuthState = { error?: string; notice?: string; email?: string };

/**
 * A passport code for a brand-new self-signup: initials plus four digits, the
 * shape of the hand-authored ones ("MD-7719"). Not a secret in the
 * cryptographic sense and not treated as one — the /passport gate is being
 * replaced by this very session — but it's a visible identifier on a printed
 * record, so it comes from the platform CSPRNG rather than Math.random.
 */
function passportCode(firstName: string, lastName: string): string {
  const initials = `${firstName[0] ?? "X"}${lastName[0] ?? "X"}`.toUpperCase();
  const digits = String(crypto.getRandomValues(new Uint16Array(1))[0] % 10000).padStart(4, "0");
  return `${initials}-${digits}`;
}

export async function signUp(
  _prev: AccountAuthState,
  form: FormData,
): Promise<AccountAuthState> {
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const vehicle = String(form.get("vehicle") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const destination = safeNext(String(form.get("next") ?? "") || null);

  // Same rules the booking form applies in lib/lead.ts, plus the shared
  // password check the reset flow uses — one minimum length across the site.
  if (!firstName) return { error: "Please add your first name.", email };
  if (!lastName) return { error: "Please add your last name.", email };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "That email doesn't look right.", email };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Please add a valid phone number.", email };
  const badPassword = validatePassword(password, confirm);
  if (badPassword) return { error: badPassword, email };

  const db = await supabaseServer();
  const { data, error } = await db.auth.signUp({ email, password });

  if (error) return { error: error.message, email };

  // No session means the project requires email confirmation — and it's also
  // what Supabase returns for an address that ALREADY has an account, on
  // purpose, so that this form can't be used to test which emails are
  // registered. Both cases get the same wording for the same reason.
  //
  // NOTE: no SMTP is configured yet, so on a confirmation-required project that
  // email never arrives and signup dead-ends here. See HANDOVER.md.
  if (!data.session || !data.user) {
    return { notice: "Check your email to confirm your account, then sign in." };
  }

  // The customers row is written with the secret key because there is no
  // customer INSERT policy and deliberately shouldn't be: `my_customer_id()`
  // authorises against this row, so it can't be the thing authorising its own
  // creation. This action is the trusted boundary, the same way /api/lead is.
  //
  // Deliberately NOT matched against an existing customer by email address.
  // Auto-linking would mean anyone who signs up as marcus.delgado@example.com
  // inherits Marcus's vehicles and invoices — an account takeover wearing a
  // convenience feature's clothes, and email confirmation is the only thing
  // that would stop it. Walk-in duplicates get merged by the office instead.
  const { error: rowError } = await supabaseAdmin.from("customers").insert({
    userId: data.user.id,
    name: fullName(firstName, lastName),
    phone,
    email,
    accessCode: passportCode(firstName, lastName),
  });

  if (rowError) {
    // The auth.users row exists but has nothing behind it, so the account is
    // real and useless. Say so plainly rather than dropping them into an empty
    // dashboard that looks like their data was lost.
    console.error("[account/signup]", rowError.message);
    await db.auth.signOut();
    return { error: "We couldn't finish setting up your account. Please try again.", email };
  }

  // ponytail: `vehicle` from the form is dropped — a vehicles row needs make,
  // model and year, and this is one free-text field. The office adds the car at
  // intake. Wire it when the signup form asks for the parts separately.
  void vehicle;

  redirect(destination);
}

export async function signIn(
  _prev: AccountAuthState,
  form: FormData,
): Promise<AccountAuthState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const destination = safeNext(String(form.get("next") ?? "") || null);

  const db = await supabaseServer();
  const { data, error } = await db.auth.signInWithPassword({ email, password });

  // One message for both halves — "no such account" would confirm which of the
  // two was right. Supabase rate-limits the endpoint itself.
  if (error || !data.user) {
    return { error: "That email and password don't match an account.", email };
  }

  // A valid login is not a customer. Staff hold credentials in the same
  // auth.users table, and the console is where they belong — the mirror of the
  // check app/admin/login/actions.ts does in the other direction.
  const { data: customer } = await db
    .from("customers")
    .select("id")
    .eq("userId", data.user.id)
    .maybeSingle();

  if (!customer) {
    await db.auth.signOut();
    return { error: "That account doesn't have a customer dashboard.", email };
  }

  redirect(destination);
}

export async function signOut() {
  const db = await supabaseServer();
  await db.auth.signOut();
  redirect("/account/login");
}

/* ---- Booking and offers --------------------------------------------------- */

export type BookingState = { error?: string; ok?: boolean };

/**
 * Request a slot. Inserts straight into the shop's `appointments` table as
 * 'pending', which is what `customer_books` (0011) permits and all it permits —
 * the policy pins the status, so a client posting 'confirmed' is refused by the
 * database rather than trusted here.
 *
 * `customerName` and `vehicle` are resolved server-side from the session rather
 * than accepted from the form. They're `not null` columns the shop reads off
 * its own calendar, and a client that can name itself can name someone else.
 */
export async function requestAppointment(
  _prev: BookingState,
  form: FormData,
): Promise<BookingState> {
  const service = String(form.get("service") ?? "").trim();
  const date = String(form.get("date") ?? "").trim();
  const time = String(form.get("time") ?? "").trim();

  if (!service) return { error: "Pick a service so we know what we're quoting." };
  // Required because `appointments.date` is not null — the shop's calendar has
  // nowhere to put a request with no day attached. It is still only a
  // preference; the shop confirms the actual slot.
  if (!date) return { error: "Pick a preferred date — we'll confirm the exact slot." };
  if (!time) return { error: "Pick a preferred time." };

  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { data: customer } = await db
    .from("customers")
    .select("id, name, primaryVehicleId")
    .eq("userId", user.id)
    .single();
  if (!customer) return { error: "You're not signed in." };

  // The car they picked as primary, if the shop has one on file. `vehicle` is
  // not null, so this falls back to a phrase the front desk can act on rather
  // than an empty cell that reads as missing data.
  let vehicle = "Not specified";
  if (customer.primaryVehicleId) {
    const { data: v } = await db
      .from("vehicles")
      .select("year, make, model")
      .eq("id", customer.primaryVehicleId)
      .maybeSingle();
    if (v) vehicle = `${v.year} ${v.make} ${v.model}`;
  }

  const { error } = await db.from("appointments").insert({
    customerId: customer.id,
    customerName: customer.name,
    vehicle,
    service,
    date,
    time,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/account", "layout");
  return { ok: true };
}

/**
 * Record that someone went to an offer's checkout, then send them there.
 *
 * The redirect is the point. The first version of this recorded the claim from
 * an onClick beside a `<Link>` and let the navigation happen in parallel — and
 * nothing was ever written, because the navigation cancels the in-flight
 * request. A click that both writes and navigates has to do them in that order,
 * on the server.
 *
 * Everything that matters is looked up here rather than posted by the client:
 *
 *   headline    so a form can't write a claim that misdescribes the offer.
 *   destination so this can't be turned into an open redirect. `payUrl` and
 *               `cta.href` come from the promos table the shop controls; a
 *               destination from the form would be a URL an attacker picks,
 *               reached through a link on our own domain.
 *
 * Signed-in customers only. Anyone else is sent to log in instead of on to
 * checkout — an offer is held against an account, so a sale nobody can be
 * matched to is the thing this is meant to prevent.
 *
 * Two checkout paths, picked by whether the promo has a price:
 *
 *   priceCents set   a Square link built for this claim, carrying its id. The
 *                    webhook ticks `paid` when the money lands. (0016)
 *   priceCents null  the shop's static `payUrl`, identical for everyone,
 *                    carrying nothing. Somebody ticks `paid` by hand. (0015)
 *
 * The second is not a fallback that ought to be removed — it is how every promo
 * behaves until a price is entered, which is what lets this ship before anyone
 * has finished setting up Square.
 */
export async function claimPromo(form: FormData): Promise<never> {
  const promoId = String(form.get("promoId") ?? "");

  const db = await supabaseServer();

  /*
   * Signed-in customers only — the client's rule, and the enforcing half of it.
   * PromoClaim already renders "Create account to claim" when signed out, but a
   * server action is a public endpoint: the button being absent is not what
   * stops anyone. Checked before the promo is even looked up, so an anonymous
   * caller can't use this to probe which offer ids exist.
   *
   * A staff session lands here too, having no `customers` row. That is correct
   * — an offer is held against a customer account, and there is nothing to hold
   * it against — though it does mean a signed-in staff member gets sent to a
   * login form. Rare enough to leave; the alternative is a bespoke error page
   * for a case that shouldn't happen on the public site.
   */
  const { data: { user } } = await db.auth.getUser();
  const customerId = user
    ? (
        await db.from("customers").select("id").eq("userId", user.id).maybeSingle()
      ).data?.id
    : undefined;

  // Fixed destination rather than one passed in the form: `next` ends up in a
  // redirect, and a client-supplied one is an open redirect. The only signed-out
  // route to this action is the public promos page anyway.
  if (!customerId) redirect(`/account/login?next=${encodeURIComponent("/promos")}`);

  // Anonymous-readable (0004), but by here the caller is a known customer.
  const { data: promo } = await db
    .from("promos")
    .select("headline, payUrl, cta, priceCents")
    .eq("id", promoId)
    .maybeSingle();

  if (!promo) redirect("/promos");

  const fallback =
    promo.payUrl || (promo.cta as { href?: string } | null)?.href || "/quote";

  // The unique constraint in 0014 makes a second click a no-op rather than
  // a duplicate, so ignoreDuplicates is the happy path, not error handling.
  const { error } = await db
    .from("promo_claims")
    .upsert(
      { customerId, promoId, headline: promo.headline },
      { onConflict: "customerId,promoId", ignoreDuplicates: true },
    );

  // Logged, not surfaced. A bookkeeping row failing must not stand between
  // someone and a checkout page.
  if (error) console.error("[account/claimPromo]", error.message);
  else revalidatePath("/account", "layout");

  // Read back rather than returned from the upsert: `ignoreDuplicates` returns
  // nothing on the second click, and the second click is exactly the case that
  // still needs a link. Same row either way.
  const { data: claim } = await db
    .from("promo_claims")
    .select("id, paid")
    .eq("customerId", customerId)
    .eq("promoId", promoId)
    .maybeSingle();

  // Already settled. Sending them back to a checkout for something they've paid
  // for is how a shop takes the same money twice.
  if (claim?.paid) redirect("/account/promos");

  if (!claim || !promo.priceCents || !squareConfigured()) redirect(fallback);

  // Built inside the try, redirected to outside it: `redirect` works by
  // throwing, so a catch wrapped around it would swallow the success path and
  // quietly send everyone to the fallback.
  let url: string | undefined;

  try {
    url = await createPaymentLink({
      claimId: claim.id,
      // What appears on the Square page and the receipt, so it has to be the
      // offer as the customer saw it advertised.
      name: promo.headline,
      priceCents: promo.priceCents,
      // Back to their own offers page, which will already show Paid if the
      // webhook beat them home. The redirect is a courtesy — the webhook is
      // what records the payment, precisely because people close the tab.
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/account/promos`,
    });
  } catch (e) {
    // A Square outage or a mis-set token. The claim is already recorded, so the
    // customer lands on the booking form and the shop still knows they wanted
    // it — worse than paying, better than a 500.
    console.error("[account/claimPromo] square:", (e as Error).message);
  }

  redirect(url ?? fallback);
}

/* ---- Profile -------------------------------------------------------------- */

export type ProfileState = { error?: string; ok?: string };

/**
 * Update your own contact details.
 *
 * No `eq("userId", …)` guard is strictly needed — `customer_updates_self` in
 * 0011 restricts the statement to the caller's row on both sides — but the
 * filter stays explicit so the query says what it means without the reader
 * having to go and read the policy. `revalidatePath` is what makes the shell's
 * greeting and the profile fields show the new values: the layout fetched the
 * old row on the server.
 *
 * `email` here is the CONTACT address on the shop's record, not the login.
 * Changing the login address needs a confirmation link sent to the new mailbox,
 * and no SMTP is configured yet (HANDOVER.md) — so it is left alone rather than
 * changed to something the person then can't sign in with.
 */
export async function updateProfile(
  _prev: ProfileState,
  form: FormData,
): Promise<ProfileState> {
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();

  // Surname optional, deliberately: `customers.name` is one column and holds
  // one-word names, so requiring both halves would lock those people out of
  // their own profile form the moment it split the value.
  if (!firstName) return { error: "Name can't be blank." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "That email doesn't look right." };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Please add a valid phone number." };

  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { error } = await db
    .from("customers")
    .update({ name: fullName(firstName, lastName), email, phone })
    .eq("userId", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account", "layout");
  return { ok: "Saved." };
}

/**
 * Pick which of your own cars is the default.
 *
 * A preference on the customer's own row, so `customer_updates_self` from 0011
 * already covers it and no write grant on `vehicles` was needed — the shop
 * still owns intake. The trigger extended in 0012 rejects an id that isn't
 * theirs; this doesn't re-check it, because a check here would be advice and
 * that one is enforcement.
 *
 * Called on click rather than behind a save button: it's one field, and a radio
 * that needs confirming reads like it didn't take.
 */
export async function setPrimaryVehicle(vehicleId: string): Promise<ProfileState> {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { error } = await db
    .from("customers")
    .update({ primaryVehicleId: vehicleId })
    .eq("userId", user.id);

  // 42501 is the trigger refusing a vehicle that belongs to someone else.
  if (error) {
    return { error: error.code === "42501" ? "That isn't one of your vehicles." : error.message };
  }

  revalidatePath("/account", "layout");
  return { ok: "Primary vehicle updated." };
}

/**
 * Flip one notification preference.
 *
 * Reads the current value from the database rather than trusting a boolean off
 * the client: the toggle is rendered from a server-fetched row, so anything the
 * browser sends back is a round trip through code we don't control. Reading
 * first also means two tabs can't clobber each other's other keys.
 *
 * The preferences are stored and honoured by nothing yet — there is no SMTP.
 * They record what the customer asked for so that whatever sends mail later has
 * something to obey.
 */
export async function toggleNotification(
  key: "billing" | "service" | "promos",
): Promise<ProfileState> {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { data: row, error: readError } = await db
    .from("customers")
    .select("notifications")
    .eq("userId", user.id)
    .single();

  if (readError) return { error: readError.message };

  const current = row.notifications as Record<string, boolean>;
  const { error } = await db
    .from("customers")
    .update({ notifications: { ...current, [key]: !current[key] } })
    .eq("userId", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account", "layout");
  return {};
}

/**
 * Change your own password. Requires the current one.
 *
 * Supabase does NOT require it — an active session is enough — which makes an
 * unattended logged-in machine a silent account takeover. Same re-authenticate
 * step the console does in app/admin/(console)/account/actions.ts, for the same
 * reason.
 */
export async function changePassword(
  _prev: ProfileState,
  form: FormData,
): Promise<ProfileState> {
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  const invalid = validatePassword(next, confirm);
  if (invalid) return { error: invalid };

  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user?.email) return { error: "You're not signed in." };

  const { error: authError } = await db.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (authError) return { error: "Your current password isn't right." };

  const { error } = await db.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { ok: "Password changed." };
}
