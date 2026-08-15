/* ---------------------------------------------------------------------------
 * 0014_promo_claims.sql — the last of the in-memory dashboard state.
 *
 * Three things lived in lib/account/store.ts with no table behind them:
 * claimed promos, the activity feed, and appointment requests. This file
 * handles them, and only ONE of the three needs storage:
 *
 *   claimed promos       -> promo_claims, below. Nothing else records that a
 *                           customer went to checkout.
 *   appointment requests -> `appointments` ALREADY has the table and the
 *                           customer_books policy (0011). The only thing
 *                           blocking it was the form treating `date` as
 *                           optional against a not-null column; that is a form
 *                           fix, not a schema one. All this adds is createdAt,
 *                           so "requested on" can be told apart from the slot
 *                           being requested.
 *   activity feed        -> NO TABLE. Every row it shows is derivable from
 *                           records that already exist: account created is
 *                           customers.joined, promo claimed is
 *                           promo_claims.claimedAt, appointment requested is
 *                           appointments.createdAt, service completed is
 *                           service_records.date. An activity table would have
 *                           to be written on every event and could then
 *                           disagree with the records it describes. See
 *                           lib/account/activity.ts.
 *
 * As with 0011-0013, every drop here is `if exists` on this file's own objects.
 * ------------------------------------------------------------------------- */

/* ---- When a request was made, vs. the slot it asks for --------------------
 * `date`/`time` are the slot the customer WANTS. Ordering the activity feed by
 * them would put a request for next month above one made this morning for
 * tomorrow. Defaulted so every existing row gets a value and the console's
 * round-trip writes keep working untouched.
 * ------------------------------------------------------------------------- */
alter table appointments
  add column if not exists "createdAt" timestamptz not null default now();

/* ---- promo_claims ---------------------------------------------------------
 * A claim means "this customer went to the offer's checkout". It does NOT mean
 * they paid — payment happens on Square/Stripe's hosted page and nothing
 * reports the outcome back here. Inventing a paid state would be a claim the
 * dashboard can't back up; a webhook is what would upgrade this to a payment
 * record.
 * ------------------------------------------------------------------------- */
create table if not exists promo_claims (
  id           text primary key default gen_random_uuid()::text,
  "customerId" text not null references customers (id) on delete cascade,

  -- No foreign key to `promos`, deliberately. Offers are rotated and deleted by
  -- the shop; a claim is a historical fact that must outlive the offer it
  -- points at. A cascade would erase the customer's record of claiming, and a
  -- restrict would stop the shop tidying up old promos.
  "promoId"    text not null,

  -- Copied, not looked up, for the same reason: an expired or deleted offer
  -- would otherwise turn a past claim into a blank row six weeks later.
  headline     text not null,

  "claimedAt"  timestamptz not null default now(),

  -- Claiming twice is a re-visit to checkout, not a second offer. This is what
  -- makes the insert idempotent, so the UI doesn't need to check first.
  unique ("customerId", "promoId")
);

create index if not exists promo_claims_customer_idx on promo_claims ("customerId");

alter table promo_claims enable row level security;

-- Customers may create and read their own. No update or delete: a claim is a
-- record of something that happened, not a preference.
drop policy if exists customer_claims_own on promo_claims;
create policy customer_claims_own on promo_claims for insert to authenticated
  with check ("customerId" = my_customer_id());

drop policy if exists customer_reads_own_claims on promo_claims;
create policy customer_reads_own_claims on promo_claims for select to authenticated
  using ("customerId" = my_customer_id());

-- Staff read only. There is no console section for this yet; the grant exists
-- so the rows aren't invisible to the shop when someone asks "who claimed the
-- wrap special?", and so a section can be added without another migration.
-- Office roles only, matching who can see invoices — this is commercial data.
drop policy if exists staff_reads_claims on promo_claims;
create policy staff_reads_claims on promo_claims for select to authenticated
  using (has_access(array['Super Admin','Manager','Front desk']));
