/* ---------------------------------------------------------------------------
 * 0009_owner_reassignment.sql — only the office may move a record to a
 * different customer.
 *
 * 0008 stopped technicians writing to `customers`, and the vehicle form greys
 * out the owner picker on an existing row. That lock was cosmetic: signed in as
 * a technician, setting the disabled select's value the way devtools would and
 * pressing save changed `customerId` in the database. Tested, and it went
 * through.
 *
 * RLS can't express this. Its policies are per-row, not per-column, and
 * `vehicles` has to stay updatable by technicians — recording the finish on a
 * car is their job. A BEFORE UPDATE trigger is the only place that can compare
 * old and new and refuse just this one column.
 *
 * Applies to the three tables carrying a customerId that shop-floor roles can
 * write: vehicles, appointments, projects.
 * ------------------------------------------------------------------------- */

create or replace function guard_owner_change() returns trigger
  language plpgsql as $$
begin
  -- `is distinct from` rather than `<>`: either side can be null, and null <>
  -- null is null, which would let the change through unchecked.
  if new."customerId" is distinct from old."customerId"
     and not has_access(array['Super Admin','Manager','Front desk']) then
    raise exception 'Only the office can change which customer a record belongs to'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Not `security definer`: it needs to see the CALLER's role, and has_access()
-- already reaches the staff table through its own definer function.

create trigger guard_owner before update on vehicles
  for each row execute function guard_owner_change();

create trigger guard_owner before update on appointments
  for each row execute function guard_owner_change();

create trigger guard_owner before update on projects
  for each row execute function guard_owner_change();
