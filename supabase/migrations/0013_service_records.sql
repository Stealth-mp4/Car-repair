/* ---------------------------------------------------------------------------
 * 0013_service_records.sql — the last of the customer dashboard's JSON.
 *
 * The JSON under content/service-records and content/warranties were the two
 * remaining hand-authored sources behind /account. This gives them a table so
 * the shop can maintain them from the console instead of a developer editing
 * files in the repo.
 *
 * NOTE the wording above avoids writing those paths with a glob, and this
 * paragraph avoids the character pair it is describing. Postgres block comments
 * NEST, unlike C: a slash-star sequence INSIDE a comment opens a second one,
 * and a single closing marker then leaves the outer one open. Writing a path
 * like content-slash-star-dot-json inside this header is what made the first
 * version of this file die with an unterminated-comment error at line 1.
 * `npm test` now lints every migration for it — see lib/sql-comments.test.ts.
 *
 * ONE TABLE, NOT TWO — and that is a decision, not a shortcut. The four
 * warranty files are 1:1 with the four service-record files on every axis:
 *
 *   sr-001 veh-001 PPF          2025-01-22  expires 2026-09-10
 *   wty-001 veh-001 PPF  starts 2025-01-22  expires 2026-09-10   (XPEL)
 *   ...and the same for the other three.
 *
 * Same vehicle, same service, warranty `startDate` always equal to the service
 * date, and `expires` always equal to the service record's own
 * `warrantyExpires`. A separate table would mean the shop keeping two rows in
 * sync by hand for one real-world event, and the fields that only the warranty
 * carried — `provider` and `terms` — are just two more columns here.
 *
 * If a warranty ever needs to outlive this shape (one covering work across
 * several visits, or sold without a service), split it out then. There is no
 * such record today.
 *
 * As with 0011 and 0012, every `drop` below is `if exists` on this file's own
 * objects so it can be re-applied after a failed run.
 * ------------------------------------------------------------------------- */

create table if not exists service_records (
  id                text primary key default gen_random_uuid()::text,
  "vehicleId"       text not null references vehicles (id) on delete cascade,
  -- Matches serviceFacets in lib/site.ts: "PPF", "Ceramic Tint", "Wraps", …
  service           text not null,
  date              date not null,
  notes             text,
  -- Links a private record to a public gallery build, so "we did this one" can
  -- point at the photos. Nullable and unconstrained: gallery slugs live in the
  -- content/builds JSON, not in this database, so a foreign key is impossible
  -- and a check constraint would rot the first time a build is renamed.
  "buildSlug"       text,

  /* ---- Warranty. All nullable: plenty of work carries none. ------------- */
  -- The cover ends here. Null means no warranty on this job, which is what
  -- `warrantyStatus` treats as "nothing to show" rather than "expired".
  "warrantyExpires" date,
  -- Film/coating brand standing behind it: XPEL, 3M, Avery Dennison. Null when
  -- the shop's own workmanship is the cover (wty-004 had no provider).
  "warrantyProvider" text,
  -- One short line, spec-sheet tone.
  "warrantyTerms"   text,

  -- Cover can't end before the work happened. The seed data has one row where
  -- the `terms` TEXT and the dates disagree ("10-year coverage" expiring in 20
  -- months) — that's a content error for the shop to fix, and deliberately not
  -- something a constraint can catch, since the prose is free text.
  constraint warranty_after_service
    check ("warrantyExpires" is null or "warrantyExpires" >= date)
);

create index if not exists service_records_vehicle_idx on service_records ("vehicleId");
create index if not exists service_records_date_idx on service_records (date desc);

alter table service_records enable row level security;

/* ---- Who may touch it -----------------------------------------------------
 * Shop-floor table, so it follows `vehicles` rather than `invoices`: every
 * active role reads and writes it, because recording what was done to a car is
 * the technician's job as much as the front desk's. That mirrors the "everyone
 * active keeps the shop-floor tables" note in 0002.
 * ------------------------------------------------------------------------- */
drop policy if exists staff_manages_service_records on service_records;
create policy staff_manages_service_records on service_records for all to authenticated
  using (is_staff())
  with check (is_staff());

-- The customer half: read-only, and reached through the vehicle rather than a
-- customerId of its own — a service record belongs to a car, and the car
-- belongs to a person. `exists` over a join keeps that one hop explicit.
drop policy if exists customer_reads_service_records on service_records;
create policy customer_reads_service_records on service_records for select to authenticated
  using (
    exists (
      select 1 from vehicles v
      where v.id = service_records."vehicleId"
        and v."customerId" = my_customer_id()
    )
  );

/* ---- Read view ------------------------------------------------------------
 * Same job `admin_vehicles` does for owner names: the console's table renders a
 * row at a time with no access to the rest of the store, so the vehicle label
 * has to arrive on the row. Derived here rather than denormalised into a column
 * so correcting a car's model doesn't leave stale labels on its history.
 *
 * security_invoker in the CREATE, not a follow-up ALTER — a view defaults to
 * running as its OWNER, which would bypass RLS on service_records entirely.
 * Supabase's editor warns this "creates a table without RLS"; it's a view, and
 * this setting is exactly what makes the underlying policies apply.
 *
 * Left join, so a record whose vehicle the viewer can't read still appears
 * with a null label rather than vanishing.
 */
create or replace view admin_service_records with (security_invoker = on) as
  select
    r.id, r."vehicleId", r.service, r.date, r.notes, r."buildSlug",
    r."warrantyExpires", r."warrantyProvider", r."warrantyTerms",
    case when v.id is not null
         then v.year || ' ' || v.make || ' ' || v.model end as "vehicleLabel"
  from service_records r
  left join vehicles v on v.id = r."vehicleId";

/* ---- Seed from the JSON ---------------------------------------------------
 * The four hand-authored records, merged with their four warranties. Written
 * as one insert rather than a script so applying this file is the whole
 * migration — and `on conflict do nothing` so re-running it is safe.
 *
 * Only inserts rows whose vehicle actually exists, so this is a no-op on a
 * database that was never seeded with veh-001/veh-002.
 * ------------------------------------------------------------------------- */
insert into service_records
  (id, "vehicleId", service, date, notes, "warrantyExpires", "warrantyProvider", "warrantyTerms")
select * from (values
  ('sr-001', 'veh-001', 'PPF',          date '2025-01-22', 'Full front clip, headlights, mirrors.',
   date '2026-09-10', 'XPEL',            '10-year coverage against yellowing, cracking, and edge lift.'),
  ('sr-002', 'veh-001', 'Ceramic Tint', date '2025-01-22', '20% all around, windshield strip.',
   date '2030-01-22', '3M',              'Lifetime coverage against bubbling, peeling, and delamination.'),
  ('sr-003', 'veh-002', 'Wraps',        date '2025-03-14', 'Full satin black colour change.',
   date '2027-03-14', 'Avery Dennison',  '2-year coverage against cracking, fading, and edge lift.'),
  ('sr-004', 'veh-002', 'Wheels',       date '2024-06-01', '35-inch wheels, satin black powder coat.',
   date '2025-06-01', null,              '1-year coverage against coating failure.')
) as seed(id, "vehicleId", service, date, notes, "warrantyExpires", "warrantyProvider", "warrantyTerms")
where exists (select 1 from vehicles v where v.id = seed."vehicleId")
on conflict (id) do nothing;
