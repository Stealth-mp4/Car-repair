-- 0002_roles.sql — per-role access, replacing the blanket "any active staff
-- member sees everything" policies from 0001.
--
-- Mirrors the matrix in lib/admin/access.ts. Change one, change the other:
-- that file decides what a sidebar shows, this file decides what the database
-- will actually hand over. Only the second one is enforcement.
--
--                    Super  Manager  Technician  Front desk
--   appointments       x       x         x           x
--   projects           x       x         x           x
--   vehicles           x       x         x           x
--   notifications      x       x         x           x
--   customers          x       x         -           x
--   messages           x       x         -           x
--   reviews            x       x         -           x
--   invoices           x       x         -           x
--   inventory          x       x         x           -
--   services           x       x         -           -
--   promos             x       x         -           -
--   payments           x       x         -           -
--   finance            x       x         -           -
--   activity           x       x         -           -
--   staff              x       -         -           -

/* ---- Role lookup ---------------------------------------------------------- */

-- Security definer for the same reason is_staff() is: it reads `staff`, whose
-- own policy would otherwise recurse.
create function staff_access() returns text
  language sql stable security definer set search_path = public as $$
  select access from staff
  where "userId" = auth.uid() and status = 'active';
$$;

-- Null-safe by construction: staff_access() returns null for a non-staff user,
-- and `null = any(...)` is null, which a policy treats as false.
create function has_access(roles text[]) returns boolean
  language sql stable as $$
  select staff_access() = any(roles);
$$;

/* ---- Policies ------------------------------------------------------------ */
-- Written out per table rather than looped, same as 0001: "who can read
-- payments?" has to be answerable by grep.

-- Everyone active keeps the shop-floor tables. These policies are unchanged
-- from 0001 and are left in place: appointments, projects, vehicles,
-- notifications.

drop policy staff_all on customers;
create policy role_access on customers for all to authenticated
  using (has_access(array['Super Admin','Manager','Front desk']))
  with check (has_access(array['Super Admin','Manager','Front desk']));

drop policy staff_all on messages;
create policy role_access on messages for all to authenticated
  using (has_access(array['Super Admin','Manager','Front desk']))
  with check (has_access(array['Super Admin','Manager','Front desk']));

drop policy staff_all on reviews;
create policy role_access on reviews for all to authenticated
  using (has_access(array['Super Admin','Manager','Front desk']))
  with check (has_access(array['Super Admin','Manager','Front desk']));

drop policy staff_all on invoices;
create policy role_access on invoices for all to authenticated
  using (has_access(array['Super Admin','Manager','Front desk']))
  with check (has_access(array['Super Admin','Manager','Front desk']));

drop policy staff_all on inventory;
create policy role_access on inventory for all to authenticated
  using (has_access(array['Super Admin','Manager','Technician']))
  with check (has_access(array['Super Admin','Manager','Technician']));

drop policy staff_all on services;
create policy role_access on services for all to authenticated
  using (has_access(array['Super Admin','Manager']))
  with check (has_access(array['Super Admin','Manager']));

drop policy staff_all on promos;
create policy role_access on promos for all to authenticated
  using (has_access(array['Super Admin','Manager']))
  with check (has_access(array['Super Admin','Manager']));

drop policy staff_all on payments;
create policy role_access on payments for all to authenticated
  using (has_access(array['Super Admin','Manager']))
  with check (has_access(array['Super Admin','Manager']));

drop policy staff_all on finance;
create policy role_access on finance for all to authenticated
  using (has_access(array['Super Admin','Manager']))
  with check (has_access(array['Super Admin','Manager']));

drop policy staff_all on activity;
create policy role_access on activity for all to authenticated
  using (has_access(array['Super Admin','Manager']))
  with check (has_access(array['Super Admin','Manager']));

/* ---- staff ----------------------------------------------------------------
 * Owner-only to manage, but EVERY signed-in staff member must be able to read
 * their OWN row — currentStaff() does exactly that on every console page load,
 * and is_staff() is defined over this table. A blanket owner-only policy here
 * would lock everyone else out of the console entirely.
 * ------------------------------------------------------------------------- */

drop policy staff_all on staff;

create policy read_own_staff_row on staff for select to authenticated
  using ("userId" = auth.uid() or has_access(array['Super Admin']));

create policy owner_manages_staff on staff for all to authenticated
  using (has_access(array['Super Admin']))
  with check (has_access(array['Super Admin']));

/* ---- Activity trigger -----------------------------------------------------
 * log_activity() inserts into `activity`, which is now Manager-and-up. The
 * trigger runs as the CALLER, so a technician updating a project would hit the
 * activity policy and have the whole update rejected. Security definer makes
 * the log write run as the function owner instead — the technician still can't
 * READ the activity feed, they just no longer break on writing to it.
 * ------------------------------------------------------------------------- */

-- Already `security definer` in 0001; restated here so the reason is recorded
-- next to the policy that makes it load-bearing.
alter function log_activity() security definer;
