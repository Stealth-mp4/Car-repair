# Handover — state of play

Written at the end of the admin-console phase, for whoever (or whatever) picks
this up next. Read this before touching anything; most of it was learned the
expensive way.

Stack: Next.js 15 App Router, React 19, Supabase (Postgres + Auth + Storage),
zustand, TanStack Table, Tailwind. One Supabase project — **it is production**,
there is no staging copy. That's a deliberate choice: the shop has no real data
yet, so the cost of a second environment wasn't worth it. Revisit before real
customer records are imported.

---

## What is wired to the database

The **admin console** (`/admin`) is complete and verified end to end.

| Area | State |
|---|---|
| Appointments, projects, vehicles, customers | Live CRUD, RLS-enforced |
| Invoices, payments, finance, inventory, services, reviews | Live CRUD |
| Messages | Live — fed by `/api/lead` from every public form |
| Promos | Live, and publishing to the public site |
| Shop settings (name, phone, address, hours, socials, opening hours) | Live, publishing to the public site |
| Staff / console users | Live, Supabase Auth, four roles |
| Notification bell | Derived from live rows (see below) |
| Revenue chart + breakdown | From `revenue_series` / `revenue_breakdown` views |
| Activity log | Written by a Postgres trigger on six tables |
| Customer auth (`/account` sign-in, sign-up, profile) | Live, Supabase Auth, customer-side RLS |

The **public marketing site** reads shop settings and promos from the database
via `lib/shop.ts` and `lib/promos.ts` — anonymous, cookie-free clients, so the
pages stay statically rendered. Console edits call
`revalidatePath("/", "layout")`.

## What is NOT wired

- **Vehicle passport** (`/passport/*`) — still reads `content/*.json`. It is now
  the ONLY thing that does. `/account` is fully on the database; the passport
  has no session to scope by, so migrating it means deciding what the
  access-code gate becomes. See the passport note below.
- Nothing on `/account` is in-memory any more. `lib/account/store.ts` and
  `lib/account/data.ts` are **deleted**: claimed promos got a table (`0014`),
  appointment requests write to `appointments` (the table and policy already
  existed), and the activity feed is derived rather than stored — see
  `lib/account/activity.ts`. The drawer state that was the store's last
  occupant is a `useState` in `AccountShell`.
- **Vehicle passport** (`/passport/*`) — reads hand-authored JSON from
  `content/{customers,vehicles,warranties,invoices,service-records}/`. Works for
  exactly one customer (Marcus Delgado, code `MD-7719`) because his two vehicle
  files were given ids matching seeded rows. `veh-003` and beyond 404. The
  console's "Passport code" column is therefore a button that hands out codes
  which open nothing — hide it or wire it.
- **Appointment confirmations** — `setAppointmentStatus` flips the row and
  sends the customer nothing. Waiting on SMTP.
- **Password reset delivery** — the flow is built (`/auth/forgot`,
  `/auth/confirm`, `/auth/reset`) and correct, but no SMTP is configured, so no
  email leaves. Client has DNS/Resend instructions.
- **Photos, anywhere.** There is no upload control in the app — no `type="file"`
  in any form, nothing under any other name. Two pieces of plumbing exist for a
  feature that doesn't:
  - `Lead.photos: string[]` in `lib/lead.ts` is **dead**. It's declared,
    `/api/lead` forwards it, and `leadPreview()` renders "Mentioned N photo(s)"
    — but nothing ever populates it, so it is always `[]`. Reading only the
    plumbing makes it look implemented; it isn't. Either wire an upload or
    delete the field.
  - `passport-photos` is a private Storage bucket nothing writes to. The
    `{customerId}/{file}` path convention is load-bearing for its read policy.
    **Keep it private** — making it public bypasses the SELECT policy and
    exposes every customer's vehicle photos.

  Customers asking for a wrap or PPF quote can't send a picture of the car,
  which for this shop is the single most useful thing they could attach.
- **Square** — decided: promos link **directly to Square payment links**, and
  that needs no code. The shop creates a payment link per offer in the Square
  Dashboard and pastes it into Console → Promos → **Payment link**
  (`promos.payUrl`); `claimPromo` already records the claim and redirects there.
  Everything that is not a promo goes through the quote form and is invoiced by
  hand, so there is no other payment integration.

  A static Dashboard link is the same link for everyone and carries no reference
  id, so **the site cannot learn whether anyone paid** — an account-level webhook
  would say a payment arrived without saying whose. `0015` therefore makes
  confirmation a human tick: **Console → Promo claims → Paid**, which stamps
  `paidAt` and decrements the offer's `spotsLeft` via a trigger. Un-ticking gives
  the spot back.

  `0016` adds the automatic path alongside it, chosen **per promo** by whether
  `priceCents` is set:

  | `priceCents` | Link | Confirmed by |
  |---|---|---|
  | blank | the fixed `payUrl` | a person, in the console |
  | set | built per click, carrying the claim id | `/api/square/webhook` |

  Nothing has to be migrated: every existing promo has a blank price and keeps
  behaving exactly as before. Setting a price also removes a footgun — the price
  currently lives as prose in `headline` and again in the Square product, kept in
  step by hand.

  Both paths set the same `paid` column and fire the same 0015 trigger. The
  webhook is idempotent three times over: it filters on `.eq("paid", false)`,
  `squareOrderId` is uniquely indexed, and the trigger ignores an unchanged
  `paid`. That is deliberate — a double-decremented counter is invisible until
  the shop oversells.

  Needs `SQUARE_*` and `NEXT_PUBLIC_SITE_URL` (see `.env.example`) and a
  **deployed HTTPS URL** for the webhook subscription; Square cannot reach a
  laptop. Untested against a live Square account as of writing.

  Claiming is **signed-in customers only** (client's rule). `claimPromo` sends
  anyone else to `/account/login?next=/promos` rather than on to Square — a sale
  that reaches checkout with no account behind it is one nobody can ever match
  to a customer. The button already hid itself when signed out; the action is
  the half that enforces it.

  `spotsLeft` stays a hand-editable number rather than becoming
  `spotsTotal - count(paid)`. Spots also sell at the counter with no claim row
  behind them — the seeded offer is 7 of 10 precisely because three went over
  the counter — so deriving it would silently resurrect those three. The trigger
  owns the online half; staff own the rest.
- **Google reviews / Twilio** — reviews are hand-entered. Awaiting a client
  decision.

---

## Migrations

All are applied except `0016`, which is **pending** — paste it into the Supabase
SQL editor. `supabase/migrations/`:

| | |
|---|---|
| `0001_admin.sql` | Tables, views, RLS, triggers, storage buckets |
| `0002_roles.sql` | Per-role RLS mirroring `lib/admin/access.ts` |
| `0003_settings.sql` | `settings` table |
| `0004_public_promos.sql` | Anonymous read of live promos |
| `0005_public_settings.sql` | Anonymous read of settings |
| `0006_opening_hours.sql` | Structured hours for JSON-LD |
| `0007_vehicles_view.sql` | `admin_vehicles` left join (was hiding all vehicles from technicians) |
| `0008_customers_readonly.sql` | Technicians read customers; `accessCode` withheld from non-office |
| `0009_owner_reassignment.sql` | Trigger blocking `customerId` changes by non-office roles |
| `0010_message_phone.sql` | `messages.phone` |
| `0011_customer_auth.sql` | `my_customer_id()`, customer-side RLS, `accessCode` write guard |
| `0012_customer_prefs.sql` | `customers.primaryVehicleId` + `notifications`, ownership guard |
| `0013_service_records.sql` | `service_records` (warranty folded in), `admin_service_records` view, seed |
| `0014_promo_claims.sql` | `promo_claims`, `appointments.createdAt` |
| `0015_promo_payment.sql` | `promo_claims.paid`/`paidAt`, spot-counter trigger, `admin_promo_claims` view |
| `0016_square_checkout.sql` | `promos.priceCents`, `promo_claims.squareOrderId` (unique), view widened |

There is no migration runner. They are pasted into the Supabase SQL editor by
hand, so **code and migration must ship together** — `0010` shipping late meant
every form submission on the site 500'd until it was applied.

## Access model

Four *staff* roles, plus customers. `lib/admin/access.ts` decides what the
sidebar offers; the RLS policies decide what the database hands over. **Only the
second is enforcement.**

```
Super Admin  →  everything, plus users / staff / settings
Manager      →  everything except those three
Technician   →  appointments, projects, vehicles, inventory, customers (read-only)
Front desk   →  appointments, projects, vehicles, customers, messages, reviews, invoices
```

Technician and Front desk are peers, not ranks. `canSee(access, slug)` gates
visibility; `canEdit(access, slug)` gates mutation (backed by the `READ_ONLY`
map). Column-level gating exists too — `Column.needs` hides e.g. Lifetime value
from anyone who can't read invoices.

Enforcement layers, outermost in: middleware (valid session only) → console
layout (active staff membership) → section page (`canSee`) → server actions
(**staff membership only, not section access**) → RLS.

Customers are the fifth identity and sit outside that table entirely. There is
**one** `auth.users` and one session cookie; what separates the two kinds of
login is which row owns it — `staff.userId` for the console, `customers.userId`
for the dashboard. Both sign-in actions check for their own row and sign out
anyone holding the other, so a staff cookie reaches `/account` and bounces, and
a customer cookie reaches `/admin` and bounces. Everything a customer can see
routes through `my_customer_id()` in `0011` — grep it to find the whole surface.

---

## Conventions and landmines

**zustand v5 reads `getInitialState` during SSR.** The store is created *per
request* in `createAdminStore` with the server's rows already in it. A module
singleton would share state across concurrent SSR requests and render whatever
it was born with. Never reintroduce one.

**Derived helpers are called, not passed as selectors.**
`dashboardStats(useAdmin())`, never `useAdmin(dashboardStats)` — they build a
fresh object each call, and `useSyncExternalStore` compares by reference, so the
second form is an infinite render loop.

**`lib/admin/data.ts` is types and `TODAY` only.** Its fixture arrays must never
become store state again; that was the original "console flashes invented
customers" bug.

**An RLS-filtered UPDATE or DELETE succeeds with zero rows.** It does not error.
The only way to prove a write was blocked is to read the row back with the
secret key. A probe that skips this reports every role as able to write
everything — mine did, briefly.

**RLS is row-level, not column-level.** Blocking one column (owner
reassignment) needed a `BEFORE UPDATE` trigger, not a policy.

**`create or replace view` can append columns but not reorder or rename them.**
Changing `admin_customers` failed with `42P16` until the new column list matched
the old order exactly.

**Views default to running as their owner, which bypasses RLS.** Every view here
sets `security_invoker = on`. Supabase's SQL editor warns that creating a view
"creates a table without RLS" — that is a false positive, but only because of
that setting.

**Never show a confident zero.** RLS returns empty rather than erroring, so an
ungated widget renders `$0` or "No vehicles yet" as fact. `seesMoney` and
`canSee` gate the tiles for this reason; the same class of bug produced the
false "New Customers 0" for technicians and the empty Vehicles tab.

**Postgres block comments NEST, unlike C.** A slash-star sequence inside a
comment opens a SECOND comment, so the closing marker only gets you back to
depth 1 and every statement after the header is silently swallowed. `0013`
shipped with a glob path in its header and died in the SQL editor with
"unterminated comment" pointing at line 1. Writing a comment that *explains*
this bug is another way to cause it. `npm test` now lints every migration for
balance — `lib/sql-comments.test.ts`, which is the only safety net there is,
since these files are pasted by hand with no runner.

**The SQL editor calls `0011` destructive. It isn't.** Every `drop` in it is a
`drop ... if exists` on a policy or trigger the same file creates one line
later, so the migration can be re-applied after a failed attempt — the pattern
`0008` established. Nothing from `0001`-`0010` is dropped and there is no
`drop table`, `delete` or `truncate` anywhere in it. Second documented false
positive from that editor, after the `security_invoker` one.

**A click that both writes and navigates must do it server-side.** The promo
claim was first written as an `onClick` beside a `<Link>` — and recorded
nothing, every time, because the navigation cancels the request in flight. It is
now a form posting to a server action that writes the claim and then redirects.
The destination is looked up from the `promos` table rather than posted by the
client, which also means the button can't be turned into an open redirect.

**`formatDate` takes a date OR a timestamptz.** `promo_claims.claimedAt` and
`appointments.createdAt` are timestamps; passing one to the old version rendered
"Invalid Date", because it appended `T00:00:00` to a string that already had a
time. It slices to 10 chars first now. The slice is also what keeps the day
right — parsing a bare `YYYY-MM-DD` is UTC, so west of Greenwich it would show
the day before.

**Null from the database is not `undefined`.** `promos.spotsLeft` is null for an
offer with no cap, and a `!== undefined` check let it through — the account page
printed "null spots left", and the public page would have computed
`spotsTotal - null`. Both use `!= null` now. Worth remembering wherever a
nullable column meets a check written against fixture data.

**The customer activity feed has no table, on purpose.** Every entry is derived
from the record of the thing itself — `customers.joined`, `service_records.date`,
`appointments.createdAt`, `promo_claims.claimedAt` (`lib/account/activity.ts`).
A table would need writing on every event and could then disagree with the
records it describes; deriving also meant Marcus's four existing services
appeared in his feed with no backfill. Do not "fix" this by adding one. The
shop-side `activity` table in 0001 is a different thing — a trigger-written
audit log for the console.

**A customer booking requires a preferred date.** `appointments.date` is not
null — it is the shop's own calendar — so the form cannot offer "any day". It is
still only a preference; `customer_books` pins the status to 'pending' and the
shop confirms the real slot.

**Warranties are columns on `service_records`, not their own table.** The four
`content/warranties/*.json` files were 1:1 with the four service records on
every field — same vehicle, same service, `startDate` always the service date,
`expires` always the record's own `warrantyExpires`. Splitting them meant the
shop keeping two rows in sync by hand for one real-world event. `0013` merged
them. Split it back out only if a warranty ever needs to span several visits or
be sold without a service; none does today.

**`warrantyStatus(expires, today)` returns null for "no cover sold".** That is
the point of it — the old `lib/passport` version could only say "expired", so
work that never carried a warranty rendered a red expired badge. Same family as
the confident-zero rule.

**The Billing page no longer mentions Stripe.** It used to promise a Stripe
billing portal with a "manage payment methods" button, and the shop has no
Stripe account, no portal and no stored cards — a customer following that copy
would go looking for a login that was never created. It now says how the shop
actually takes money: in person, or by a link they send. The `payments` export
in `lib/site.ts` went with it. (The Stripe logo on `/financing` is unrelated —
that's a financing partner listing, not a processor the site integrates with.)

**Signup's outcome depends on a Supabase project setting nobody can see from
the code.** With email confirmation OFF, `auth.signUp` returns a session and the
customer lands in the dashboard. With it ON, it returns no session, the form
says "check your email", and — with no SMTP — that email never arrives, so
signup dead-ends. Confirm the setting before handing the site to real
customers; it's the same missing SMTP that blocks password reset.

**A "skip the form if already signed in" redirect on `/account/login` loops.**
The console has one and it's fine there. Here it isn't: a staff session is a
valid session with no `customers` row, so login would bounce it to `/account`
and the layout would bounce it straight back. Left off deliberately —
`middleware.ts` says so.

**Secret key is server-only.** `SUPABASE_SECRET_KEY` bypasses RLS entirely.
Never in a `NEXT_PUBLIC_` var. `/api/lead` uses it deliberately — that route is
the trusted boundary turning an anonymous form post into an office-only row.

## Verification workflow

What worked, and worth repeating:

1. **Throwaway scripts in `scripts/`** run with
   `npx tsx --env-file=.env.local scripts/x.ts`, deleted after. Sign in as each
   role with the anon key, attempt the operation, read the result back with the
   secret key. `scripts/rls-matrix.ts` is the reusable one — it takes
   credentials from env vars, never hardcoded.
2. **Browser** for anything about rendering: sign in as the role, look at it.
   Screenshots occasionally lag the DOM — confirm via the accessibility tree
   before reporting something missing.
3. **Public-site changes**: change a value, rebuild, grep the prerendered HTML
   in `.next/server/app/*.html`, restore. `rm -rf .next` first — a stale build
   cache will happily serve the old value and look like a bug.

Ports: **3100 is another project of the user's** ("Matchmaking Portal"). Use
3111 or similar, and check `ss -ltnp` before killing anything.

## Test accounts

`scripts/link-customer.ts` mints a login for a customer row that already exists
(`npx tsx --env-file=.env.local scripts/link-customer.ts <email>`) — the seeded
customers all have `userId = null`, so this is the only way to sign in as one.
Signup deliberately never adopts an existing row by email: with no confirmation
mail there's nothing to prove the mailbox, so matching on it would hand Marcus's
invoices to anyone who typed his address.

`STAFF-LOGINS.md` (gitignored) holds five temporary passwords. Treat them as
compromised — they are in plaintext on disk and in session transcripts. Delete
the file once handed over.

The Manager account is a **placeholder identity** — "Nia Adeyemi /
nia@iqballazcustoms.com" — created after the original Manager's password was
changed outside the file and lost. Rename when the real manager is known.
Luis Bermudez is `invited` with no login, on purpose.

Staff emails are all `@iqballazcustoms.com` and **those mailboxes may not
exist**, which makes password reset undeliverable regardless of SMTP. The plan
is to point each staff record at an address the person actually reads.

---

## Next: the customer dashboard

The job, roughly:

1. ~~Move customer auth to Supabase Auth.~~ **Done.** `app/account/actions.ts`
   holds sign-in / sign-up / sign-out / profile / password as server actions,
   `lib/account/auth.ts` has `currentCustomer()`, and the gate is
   middleware → `app/account/(dashboard)/layout.tsx` → RLS. `DEMO_LOGIN`,
   `seedUser` and the plaintext store are deleted.
2. ~~Add customer-facing RLS.~~ **Done**, in `0011` — *which still has to be
   applied by hand.*
3. ~~Repoint `/account/*` at the database.~~ **Done.** Vehicles, invoices and
   service records (with warranties folded in) are live rows, read once in
   `(dashboard)/layout.tsx` and handed down through `lib/account/customer.tsx`.
   No page under `/account` imports `lib/passport` any more.
4. ~~Add the forgot-password link to the customer login.~~ **Done.** Delivery
   needs SMTP — the plan is **Resend**. Until it is wired, password reset sends
   nothing and signup dead-ends if the Supabase project requires email
   confirmation. Both are delivery problems, not code ones.
5. **The passport is what's left, and the access code STAYS.** An account is
   optional by design — you can book and browse without one — so customers with
   no login still need a way into their own vehicle record. That settles the
   open question: do not replace the code with a session.

   `/passport` still reads `content/*.json` and is now the only thing that does.
   The tables it needs all exist (`vehicles`, `invoices`, `service_records`), so
   the work is a server-side lookup that trades an access code for one
   customer's rows, with the code checked on the server and never trusted from
   the client. Two things to fix while in there: the console's "Passport code"
   column hands out codes that open nothing beyond `veh-002`, and photos are
   genuinely new — `passport-photos` is a private bucket nothing writes to, and
   it must stay private (a public bucket bypasses the SELECT policy and exposes
   every customer's vehicle photos).

Client-facing docs (private artifacts, links in the session transcript): DNS
record setup, team email addresses, a console status note listing what's done
and what's outstanding, and **"Promo Payment Links"** — the step-by-step for
creating a Square payment link and pasting it into Console → Promos.
