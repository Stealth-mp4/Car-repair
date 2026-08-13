/* ---------------------------------------------------------------------------
 * 0007_vehicles_view.sql — admin_vehicles was empty for technicians.
 *
 * The view inner-joined customers to pick up the owner's name. It's
 * security_invoker, so a technician — who may read vehicles but not customers —
 * had every customer row filtered away by RLS, and the join then dropped every
 * vehicle with it. Eight vehicles in the table, zero on their Vehicles tab.
 *
 * A left join keeps the vehicle and leaves customerName null, which is the
 * honest answer: they can see the car, not who owns it.
 * ------------------------------------------------------------------------- */

create or replace view admin_vehicles as
  select v.*, c.name as "customerName"
  from vehicles v left join customers c on c.id = v."customerId";

-- create or replace keeps existing settings, but restate it so the property is
-- visible in this file rather than only in 0001.
alter view admin_vehicles set (security_invoker = on);
