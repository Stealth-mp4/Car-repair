/* ---------------------------------------------------------------------------
 * 0008_customers_readonly.sql — technicians can read customers, not change them.
 *
 * Vehicles sit on the shop floor but their owner lives in an office table, so a
 * technician saw every car with a blank owner and an owner picker they could
 * never populate. Read access fixes both. Writes stay office-only: intake is
 * front desk's job, and a technician reassigning a car to another owner is not
 * a thing that should be possible.
 *
 * Two permissive policies OR together, so SELECT passes for all four roles
 * while INSERT/UPDATE/DELETE still has to satisfy the office policy.
 * ------------------------------------------------------------------------- */

-- `if exists` on all three so the file can be re-run after a failed attempt:
-- the first run died on the view below, and whether the policy changes above it
-- committed depends on whether the editor wrapped the script in a transaction.
drop policy if exists role_access on customers;
drop policy if exists office_manages_customers on customers;
drop policy if exists staff_read_customers on customers;

create policy office_manages_customers on customers for all to authenticated
  using (has_access(array['Super Admin','Manager','Front desk']))
  with check (has_access(array['Super Admin','Manager','Front desk']));

create policy staff_read_customers on customers for select to authenticated
  using (has_access(array['Super Admin','Manager','Front desk','Technician']));

/* ---- accessCode -----------------------------------------------------------
 * The passport code is a customer's credential for viewing their own vehicle
 * record — not a contact detail, and not something a read grant should hand to
 * the whole shop. Column privileges can't help here: every signed-in user is
 * the same database role, so `revoke select (col)` would take it from front
 * desk too. The view withholds it per-viewer instead.
 *
 * `select c.*` is replaced by an explicit column list: a later `alter table
 * customers add column` would otherwise walk straight back into this view.
 * ------------------------------------------------------------------------- */

-- security_invoker set in the CREATE itself, not a follow-up ALTER: a view
-- defaults to running as its OWNER, which bypasses RLS on `customers`
-- altogether. Declaring it here means the view never exists without it.
--
-- Supabase's SQL editor warns that this "creates a table without enabling Row
-- Level Security". It's a view, not a table, and views carry no policies of
-- their own — this line is what makes the underlying table's policies apply.
create or replace view admin_customers with (security_invoker = on) as
  select
    -- Column ORDER matters and must match the view being replaced: `create or
    -- replace view` can append columns but not rename or reorder the existing
    -- ones, and the old view was `select c.*`, i.e. the table's own order —
    -- accessCode before joined. Swapping them fails with 42P16.
    c.id, c."userId", c.name, c.phone, c.email,
    case when has_access(array['Super Admin','Manager','Front desk'])
         then c."accessCode" end as "accessCode",
    c.joined,
    (select count(*) from vehicles v where v."customerId" = c.id) as "vehicleCount",
    coalesce((select sum(i.amount) from invoices i
              where i."customerId" = c.id and i.status = 'paid'), 0) as "lifetimeValue"
  from customers c;

-- Belt and braces: harmless if the CREATE above already set it, and the thing
-- worth being certain about.
alter view admin_customers set (security_invoker = on);
