/* ---------------------------------------------------------------------------
 * 0016_square_checkout.sql — the two columns tier-two checkout needs.
 *
 * 0015 made "paid" a tick a person performs. This makes the same tick possible
 * for a machine: the site builds a payment link per click carrying the claim's
 * id, Square hands that id back when the money lands, and the webhook sets the
 * same column against the same trigger. Nothing in 0015 changes — the manual
 * tick stays exactly where it is, and is still the only route for a counter
 * sale.
 * ------------------------------------------------------------------------- */

/* The amount to charge, in cents, because that is what Square's API takes and
 * float dollars are the classic way to charge somebody $19.989999999.
 *
 * Nullable on purpose, and that is the migration path: a promo with no price
 * keeps behaving exactly as it does today (redirect to the static `payUrl`, tick
 * by hand). Only a promo that has been given a price gets a generated link. So
 * this can ship before anyone has touched the Square dashboard and break
 * nothing.
 *
 * The price currently exists only as prose inside `headline` ("$1,999 satin
 * black wrap special"), which means it lives in two places — the page and the
 * Square product — kept in step by hand. Once this is set for a promo, the
 * amount charged comes from the same row the page renders. */
alter table promos
  add column if not exists "priceCents" integer
    check ("priceCents" is null or "priceCents" > 0);

/* Square rejects a $0 payment, so a free offer cannot be a checkout — it is a
 * booking. The check above says so in the one place that can enforce it, rather
 * than letting a 0 through to fail as an opaque API error at the moment a
 * customer clicks. */

/* Which Square order paid for this claim.
 *
 * Unique because it is what makes the webhook idempotent: Square retries
 * delivery on any non-2xx and will happily send `payment.created` and
 * `payment.updated` for the same money. Writing the order id in the same
 * statement as `paid` means a replay hits the constraint instead of ticking a
 * second time — and the 0015 trigger only moves the counter when `paid` changes,
 * so even a successful replay could not double-decrement. Two independent
 * reasons the counter cannot drift; the integration is worth both.
 *
 * It is also the audit trail: every automatic tick can be traced to an order in
 * Square, and a tick with no order id is a human one. */
alter table promo_claims
  add column if not exists "squareOrderId" text;

create unique index if not exists promo_claims_square_order
  on promo_claims ("squareOrderId")
  where "squareOrderId" is not null;

/* The guard from 0015 pins customerId/promoId/claimedAt. squareOrderId is
 * deliberately NOT pinned there: the webhook writes it with the secret key, and
 * a mis-ticked claim that gets un-ticked and later re-paid needs to be able to
 * carry the new order. */

/* The console's list, widened. Same view, same security_invoker — the order id
 * is shown so somebody chasing "did this actually go through" has the number to
 * paste into Square.
 *
 * `create or replace view` can only APPEND columns; inserting one in the middle
 * is rejected as renaming the ones after it. Hence squareOrderId last, after
 * customerName, rather than beside the other claim columns where it belongs. */
create or replace view admin_promo_claims with (security_invoker = on) as
  select
    c.id, c."customerId", c."promoId", c.headline, c."claimedAt", c.paid, c."paidAt",
    cu.name as "customerName",
    c."squareOrderId"
  from promo_claims c
  left join customers cu on cu.id = c."customerId";
