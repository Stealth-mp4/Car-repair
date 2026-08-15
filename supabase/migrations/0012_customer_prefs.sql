/* ---------------------------------------------------------------------------
 * 0012_customer_prefs.sql — the two profile panels that had nowhere to write.
 *
 * "Primary vehicle" was two free-text boxes saving to a client-side store, and
 * the notification toggles flipped without storing anything. Both rendered as
 * if they worked. This gives them columns.
 *
 * BOTH LIVE ON `customers`, deliberately, and that is the whole design: they
 * are preferences ABOUT the customer, so they ride the `customer_updates_self`
 * policy from 0011 and need no new grant. In particular this does NOT let a
 * customer write to `vehicles` — intake stays the shop's job, same reasoning as
 * 0009's owner-reassignment guard. Choosing which of YOUR cars is the default
 * is a preference; adding a car to your record is not.
 *
 * Like 0011, the `drop`s below are `if exists` on this file's own objects so it
 * can be re-applied after a failed run. Nothing from 0001-0011 is removed.
 * ------------------------------------------------------------------------- */

/* ---- Columns -------------------------------------------------------------- */

-- `on delete set null`, not cascade: the shop removing a car from a record
-- should clear the pointer, not delete the customer.
alter table customers
  add column if not exists "primaryVehicleId" text references vehicles (id) on delete set null;

-- One jsonb rather than three boolean columns. The set of things worth
-- notifying about will change (the shop has no SMS yet, and reviews and
-- promos may split), and that shouldn't be a migration each time. The app
-- writes a fixed shape; the default is what every account already had in code.
alter table customers
  add column if not exists notifications jsonb not null
  default '{"billing": true, "service": true, "promos": false}'::jsonb;

/* ---- Guarding the pointer -------------------------------------------------
 * A foreign key proves the vehicle EXISTS. It says nothing about whose it is,
 * and `customer_updates_self` happily lets someone set their own row's
 * `primaryVehicleId` to a car belonging to somebody else. That leaks nothing on
 * its own — reading the vehicle still goes through customer_reads_vehicles —
 * but it plants another customer's id in a record the shop reads, and the fix
 * is one line in a trigger that already exists.
 *
 * This is the same shape of problem as 0009: a constraint ACROSS rows, which a
 * row-level policy cannot express.
 *
 * `create or replace` on the function is enough — `guard_self_edit` from 0011
 * already points at it, so the trigger itself is left alone.
 * ------------------------------------------------------------------------- */
create or replace function guard_customer_self_edit() returns trigger
  language plpgsql as $$
begin
  if new."accessCode" is distinct from old."accessCode" and not is_staff() then
    raise exception 'Only the shop can change a passport code'
      using errcode = '42501';
  end if;

  -- Not security definer, on purpose: reading `vehicles` as the CALLER is what
  -- makes this correct for both sides. A customer can only see their own cars,
  -- so a foreign id fails the check; staff can see every car, so the console
  -- can still set this on anyone's behalf.
  if new."primaryVehicleId" is distinct from old."primaryVehicleId"
     and new."primaryVehicleId" is not null
     and not exists (
       select 1 from vehicles
       where id = new."primaryVehicleId" and "customerId" = new.id
     ) then
    raise exception 'A primary vehicle must be one of that customer''s own vehicles'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

/* ---- Backfill -------------------------------------------------------------
 * Customers with exactly one car get it as their primary — for them there is no
 * choice to make, and leaving it null would show "none selected" next to a
 * single radio button. Anyone with two or more picks for themselves.
 * ------------------------------------------------------------------------- */
update customers c
set "primaryVehicleId" = (
  select v.id from vehicles v where v."customerId" = c.id
)
where c."primaryVehicleId" is null
  and (select count(*) from vehicles v where v."customerId" = c.id) = 1;
