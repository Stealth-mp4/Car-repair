/* ---------------------------------------------------------------------------
 * 0011_customer_auth.sql — the customer half of the access model.
 *
 * Everything before this file was written for the office: `is_staff()` and
 * `has_access()` both return false for someone who merely has an account, so a
 * signed-in customer currently reads nothing at all. That was correct while
 * /account was a localStorage simulation. It stops being correct the moment
 * signup writes a real `auth.users` row.
 *
 * The shape mirrors the staff half — one security-definer lookup function that
 * every policy routes through — rather than repeating a join to `customers` in
 * each policy. Grep for `my_customer_id` to find everything a customer can see.
 *
 * The SQL editor warns that this file "includes destructive operations". It
 * doesn't. Every `drop` here is a `drop ... if exists` on a policy or trigger
 * THIS FILE creates, one line before recreating it — the re-runnability pattern
 * 0008 uses, so a failed attempt can be re-applied. No drop table, no drop
 * column, no delete, no truncate, and nothing from 0001-0010 is touched. Same
 * class of false positive as the security_invoker warning.
 *
 * WHAT A CUSTOMER GETS: their own customers row (read + limited write), and
 * read on the vehicles, invoices and appointments hanging off it, plus the
 * ability to request an appointment. Nothing else. Notably NOT projects,
 * payments, or another customer's anything.
 * ------------------------------------------------------------------------- */

/* ---- Lookup --------------------------------------------------------------- */

-- Security definer for the same reason staff_access() is: it reads `customers`,
-- whose own policy below would otherwise recurse into this function.
--
-- Returns null for staff and for a customer who signed up but hasn't been
-- linked to a record. `null = anything` is null, which a policy treats as
-- false, so every policy here is null-safe by construction.
create or replace function my_customer_id() returns text
  language sql stable security definer set search_path = public as $$
  select id from customers where "userId" = auth.uid();
$$;

/* ---- customers ------------------------------------------------------------ */

-- Additive: the office policies from 0008 stay exactly as they are. Permissive
-- policies OR together, so this widens SELECT to the row's owner without
-- touching who else can reach it.
drop policy if exists customer_reads_self on customers;
create policy customer_reads_self on customers for select to authenticated
  using ("userId" = auth.uid());

-- `using` picks the row, `with check` validates the row as it will be AFTER the
-- write. Repeating the condition in both is what stops a customer updating
-- their own row to point `userId` at somebody else's login.
drop policy if exists customer_updates_self on customers;
create policy customer_updates_self on customers for update to authenticated
  using ("userId" = auth.uid())
  with check ("userId" = auth.uid());

-- No insert or delete policy on purpose. Signup creates the row server-side
-- with the secret key (app/account/actions.ts), because the row has to exist
-- before `my_customer_id()` can return anything to authorise it with — and
-- self-serve deletion of a record the shop bills against is not a feature.

/* ---- The columns a customer may not rewrite -------------------------------
 * Same lesson as 0009: RLS is row-level. The update policy above lets the
 * profile form change name/phone/email, which is the whole point, but the same
 * grant reaches `accessCode` — a customer's passport credential, and the thing
 * the /passport gate checks. Rotating your own is harmless; setting it to a
 * value you saw elsewhere is not.
 *
 * Staff are exempt: rotating a code is an office action, and the console does
 * it from the customers table.
 * ------------------------------------------------------------------------- */
create or replace function guard_customer_self_edit() returns trigger
  language plpgsql as $$
begin
  if new."accessCode" is distinct from old."accessCode" and not is_staff() then
    raise exception 'Only the shop can change a passport code'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_self_edit on customers;
create trigger guard_self_edit before update on customers
  for each row execute function guard_customer_self_edit();

/* ---- The records hanging off that row ------------------------------------- */

-- Read-only, all three. A customer looking at their own history is the entire
-- feature; a customer editing an invoice is not.
drop policy if exists customer_reads_vehicles on vehicles;
create policy customer_reads_vehicles on vehicles for select to authenticated
  using ("customerId" = my_customer_id());

drop policy if exists customer_reads_invoices on invoices;
create policy customer_reads_invoices on invoices for select to authenticated
  using ("customerId" = my_customer_id());

drop policy if exists customer_reads_appointments on appointments;
create policy customer_reads_appointments on appointments for select to authenticated
  using ("customerId" = my_customer_id());

-- Booking. `status` is not constrained here because the column already defaults
-- to 'pending' and its check constraint bounds it — but note that a customer
-- CAN post one as 'confirmed'. Confirming is the shop's call, so the insert
-- path forces the default rather than trusting the client.
drop policy if exists customer_books on appointments;
create policy customer_books on appointments for insert to authenticated
  with check ("customerId" = my_customer_id() and status = 'pending');

-- No update policy on appointments: "cancel my booking" is a real feature and
-- a sensible next one, but it needs to be a status transition the shop can see
-- coming, not a blanket update grant. Left for when the flow is designed.
