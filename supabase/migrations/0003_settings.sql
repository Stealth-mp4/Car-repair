/* ---------------------------------------------------------------------------
 * 0003_settings.sql — editable shop settings.
 *
 * One row per settings group, value as jsonb. Not a wide table with a column
 * per field: the groups are small, read whole, written whole, and a column per
 * setting means a migration every time the shop wants one more line on the
 * contact page.
 *
 * lib/site.ts stays the default. A group that has never been saved simply has
 * no row here, and the app falls back — so this migration cannot blank the
 * public site, and deleting a row is a working "reset to default".
 * ------------------------------------------------------------------------- */

create table settings (
  key         text primary key check (key in ('business', 'hours', 'social')),
  value       jsonb not null,
  "updatedAt" timestamptz not null default now(),
  "updatedBy" text
);

alter table settings enable row level security;

-- Read: any active staff member. The settings page shows the shop's own phone
-- number and hours, which every role needs and none of which is sensitive.
create policy read_settings on settings
  for select to authenticated
  using (is_staff());

-- Write: owner only, matching SECTION_ACCESS.settings in lib/admin/access.ts.
-- has_access() comes from 0002_roles.sql; this migration depends on it.
create policy write_settings on settings
  for all to authenticated
  using (has_access(array['Super Admin']))
  with check (has_access(array['Super Admin']));

-- Public read comes later, with the site pages that would consume it. Adding
-- an anon policy now would publish a table nothing reads.
