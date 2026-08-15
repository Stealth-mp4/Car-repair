/* ---------------------------------------------------------------------------
 * 0015_promo_payment.sql — confirming a promo was paid, and moving the counter.
 *
 * A claim (0014) means "this customer went to checkout". Payment happens on
 * Square's hosted page and nothing reports the outcome back here, because a
 * payment link made in the Square Dashboard cannot carry a reference id — so
 * even an account-level webhook would tell us a payment arrived without telling
 * us WHOSE it was. Automatic matching needs API-generated links per customer,
 * which is a bigger integration than this shop wants.
 *
 * So confirmation is a human act: someone sees the payment in Square, finds the
 * claim in the console, ticks Paid. This file gives that tick somewhere to live
 * and makes it move the spot counter, so the two can't disagree.
 *
 * Why `spotsLeft` keeps being a plain editable number rather than becoming
 * `spotsTotal - count(paid claims)`: spots also sell in person, with no claim
 * row behind them — the seeded offer is 7 of 10 left precisely because three
 * went over the counter. Deriving the number would silently resurrect those
 * three. The trigger below moves the counter for the online half; staff keep
 * editing it directly for the rest.
 * ------------------------------------------------------------------------- */

alter table promo_claims
  add column if not exists paid boolean not null default false,
  -- Stamped by the trigger, never typed. Worth its own column because "it sold"
  -- and "it sold in July" are different questions and the second one cannot be
  -- answered retroactively — claimedAt is when they left for Square, which may
  -- be weeks before someone got round to confirming it.
  add column if not exists "paidAt" timestamptz;

/* ---- The tick, and what it moves ------------------------------------------
 * BEFORE UPDATE so paidAt can be set on the row on its way through, and
 * security definer because Front desk may confirm a payment (they take the call
 * from the customer) but may not write `promos` — under RLS that inner update
 * would match zero rows and fail silently, leaving the counter untouched with
 * no error anywhere. Same class of bug as every other silent-zero in this
 * schema.
 *
 * Symmetric: un-ticking gives the spot back. A mis-tick is otherwise only
 * fixable by hand-editing the promo, and someone would forget.
 * ------------------------------------------------------------------------- */
create or replace function sync_promo_spots()
  returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  -- Fires on insert too, because a claim can be born paid: someone who bought
  -- the offer at the counter gets a claim recorded against them so it shows in
  -- their account, and that sale has to move the counter like any other.
  if tg_op = 'UPDATE' and new.paid is not distinct from old.paid then
    return new;
  end if;
  if tg_op = 'INSERT' and not new.paid then
    return new;
  end if;

  if new.paid then
    new."paidAt" := now();
    -- greatest(...,0) because the counter is hand-editable: staff may already
    -- have wound it down for the same sale. Better to stall at nought than show
    -- a negative number of spots on the public page.
    update promos set "spotsLeft" = greatest("spotsLeft" - 1, 0)
      where id = new."promoId" and "spotsLeft" is not null;
  else
    new."paidAt" := null;
    -- Capped at spotsTotal so undoing a tick can't invent an eleventh spot.
    update promos set "spotsLeft" = least("spotsLeft" + 1, coalesce("spotsTotal", "spotsLeft" + 1))
      where id = new."promoId" and "spotsLeft" is not null;
  end if;

  return new;
end $$;

drop trigger if exists promo_claims_sync_spots on promo_claims;
create trigger promo_claims_sync_spots
  before insert or update on promo_claims
  for each row execute function sync_promo_spots();

/* ---- Who may tick ---------------------------------------------------------
 * The same office roles that can already read claims. RLS is row-level, so this
 * policy technically permits rewriting any column; the guard below is what
 * keeps it to the tick. A claim is a record of something that happened —
 * nobody should be editing whose it is or which offer it was.
 * ------------------------------------------------------------------------- */
drop policy if exists staff_confirms_payment on promo_claims;
create policy staff_confirms_payment on promo_claims for update to authenticated
  using (has_access(array['Super Admin','Manager','Front desk']))
  with check (has_access(array['Super Admin','Manager','Front desk']));

-- The console writes with upsert (insert ... on conflict), so ticking Paid goes
-- through an INSERT statement even though it only ever updates. Without this it
-- would hit `customer_claims_own`, whose check is "customerId = my_customer_id()"
-- — never true for staff — and fail on a row that already exists. It also lets
-- the shop record a counter sale against a customer, which is the one legitimate
-- reason to create a claim by hand.
drop policy if exists staff_records_claim on promo_claims;
create policy staff_records_claim on promo_claims for insert to authenticated
  with check (has_access(array['Super Admin','Manager','Front desk']));

create or replace function guard_claim_edit()
  returns trigger
  language plpgsql as $$
begin
  if new."customerId" is distinct from old."customerId"
     or new."promoId" is distinct from old."promoId"
     or new."claimedAt" is distinct from old."claimedAt" then
    raise exception 'A claim records what happened; only its paid state can change'
      using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists promo_claims_guard on promo_claims;
create trigger promo_claims_guard
  before update on promo_claims
  for each row execute function guard_claim_edit();

/* ---- The console's list ---------------------------------------------------
 * headline is already copied onto the claim (0014), so the only thing needing a
 * join is the customer's name. security_invoker so a role that can't read
 * `customers` doesn't get names through the back door.
 * ------------------------------------------------------------------------- */
create or replace view admin_promo_claims with (security_invoker = on) as
  select
    c.id, c."customerId", c."promoId", c.headline, c."claimedAt", c.paid, c."paidAt",
    cu.name as "customerName"
  from promo_claims c
  left join customers cu on cu.id = c."customerId";
