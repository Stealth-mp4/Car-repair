/* ---------------------------------------------------------------------------
 * 0005_public_settings.sql — let the public site read shop settings.
 *
 * Same move as 0004 did for promos. The settings page saves the shop's name,
 * phone, address, hours and social links; until now only the console could read
 * them back, so the public site kept rendering lib/site.ts and the two could
 * drift the moment anyone edited a phone number.
 *
 * There is nothing private in here — every value is already printed on the
 * contact page, the footer and the LocalBusiness schema. Read-only for everyone;
 * writes stay Super Admin via the policy in 0003.
 * ------------------------------------------------------------------------- */

create policy public_read_settings on settings
  for select to anon, authenticated
  using (true);
