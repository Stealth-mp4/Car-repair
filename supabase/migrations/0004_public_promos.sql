/* ---------------------------------------------------------------------------
 * 0004_public_promos.sql — let the public site read live promos.
 *
 * Until now `promos` was staff-only, so the console edited a table nothing
 * outside the console read, while /promos, the nav bar and the account page all
 * rendered the hard-coded offers in lib/site.ts. The two could disagree, and
 * being time-boxed, eventually would.
 * ------------------------------------------------------------------------- */

-- Live offers only. An offer whose deadline has passed is already hidden in the
-- UI; keeping it out of the API too means a promo drafted for next month isn't
-- readable by anyone who opens the network tab before it launches.
--
-- `to anon, authenticated` covers both a signed-out visitor and a signed-in
-- customer. Staff keep their own policy from 0002 and still see every row,
-- expired ones included, which is what the console needs.
create policy public_read_live_promos on promos
  for select to anon, authenticated
  using ("endsAt" > now());
