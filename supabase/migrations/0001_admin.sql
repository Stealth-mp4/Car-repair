-- 0001_admin.sql — admin console schema.
--
-- Columns are named in camelCase to match the TypeScript field names in
-- lib/admin/data.ts exactly. That is deliberate: the store's write path is ONE
-- generic `upsertRow(collection, row)` that forwards whatever keys the form
-- produced. snake_case columns would need a per-collection field map on both
-- read and write — real code, in two directions, for cosmetics. Quoted
-- identifiers in SQL are the cheaper half of that trade.
--
-- ponytail: camelCase columns to avoid a field-mapping layer. If the DB ever
-- gets consumers outside this app, add snake_case views rather than renaming.

create extension if not exists pgcrypto;

-- Text primary keys, not uuid: the seed rows carry meaningful ids ("cust-002",
-- "apt-001") that appear in every cross-reference below and in content/*.json.
-- New rows get a uuid string; both live in the same column, and the store's
-- `rowKey` helper keeps working untouched.

/* ---- Staff + auth -------------------------------------------------------- */

create table staff (
  id          text primary key default gen_random_uuid()::text,
  -- Links a console login to a staff record. Null until the person accepts
  -- their invite, which is exactly the "invited" status.
  "userId"    uuid unique references auth.users (id) on delete set null,
  name        text not null,
  email       text not null unique,
  role        text not null,
  access      text not null check (access in ('Super Admin','Manager','Technician','Front desk')),
  status      text not null default 'invited' check (status in ('active','invited','suspended')),
  joined      date not null default current_date
);

-- Every policy below routes through this. Marked stable + security definer so
-- it can read `staff` without recursing into staff's own RLS policy.
create function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from staff
    where "userId" = auth.uid() and status = 'active'
  );
$$;

/* ---- Core records -------------------------------------------------------- */

create table customers (
  id           text primary key default gen_random_uuid()::text,
  -- Nullable: the shop creates walk-in customers who have never signed up.
  -- Phase 2 (customer dashboard) fills this in on signup and adds the
  -- self-serve RLS policies; nothing here changes when it does.
  "userId"     uuid unique references auth.users (id) on delete set null,
  name         text not null,
  phone        text not null,
  email        text not null,
  "accessCode" text not null,
  joined       date not null default current_date
);

create table vehicles (
  id            text primary key default gen_random_uuid()::text,
  "customerId"  text not null references customers (id) on delete cascade,
  make          text not null,
  model         text not null,
  year          int  not null,
  vin           text,
  "wrapColor"   text,
  tint          jsonb,
  ppf           jsonb,
  -- [{type,src,alt}] — same MediaItem shape as the public gallery.
  --
  -- `src` holds a passport-photos STORAGE KEY ("cust-002/revuelto-1.webp"), not
  -- a URL: that bucket is private, so every render needs a fresh signed URL and
  -- a stored one would be dead within the hour. Seeded rows still carry static
  -- "/gallery/..." paths — anything starting with "/" or "http" is served
  -- as-is, anything else gets signed.
  media         jsonb not null default '[]'::jsonb,
  "lastService" date
);
create index on vehicles ("customerId");

create table appointments (
  id             text primary key default gen_random_uuid()::text,
  "customerId"   text not null references customers (id) on delete cascade,
  "customerName" text not null,
  vehicle        text not null,
  service        text not null,
  date           date not null,
  time           text not null,          -- "HH:MM", formatted at the edge
  status         text not null default 'pending'
                 check (status in ('confirmed','pending','completed','cancelled')),
  image          text
);
create index on appointments (date);

create table projects (
  id             text primary key default gen_random_uuid()::text,
  "customerId"   text not null references customers (id) on delete cascade,
  "customerName" text not null,
  vehicle        text not null,
  service        text not null,
  status         text not null default 'pending'
                 check (status in ('in-progress','pending','completed','on-hold')),
  value          numeric not null default 0,
  "startDate"    date not null,
  "dueDate"      date not null,
  progress       int not null default 0 check (progress between 0 and 100),
  "assignedTo"   text
);

-- No fileUrl: the payment processors hold the actual invoice documents. This
-- table is the shop's own ledger of what was billed, not a copy of the PDF.
create table invoices (
  id             text primary key default gen_random_uuid()::text,
  "vehicleId"    text references vehicles (id) on delete set null,
  "customerId"   text not null references customers (id) on delete cascade,
  "customerName" text not null,
  date           date not null,
  "dueDate"      date not null,
  description    text not null,
  amount         numeric not null,
  status         text not null default 'due' check (status in ('paid','due','overdue'))
);
create index on invoices ("customerId");

create table payments (
  id             text primary key default gen_random_uuid()::text,
  "invoiceId"    text references invoices (id) on delete set null,
  "customerName" text not null,
  amount         numeric not null,
  method         text not null check (method in ('Card','Cash','Financing','Bank transfer')),
  date           date not null,
  status         text not null default 'pending' check (status in ('settled','pending','refunded'))
);
create index on payments (date);

-- Keyed by slug, mirroring the public site catalogue in lib/site.ts.
create table services (
  slug     text primary key,
  title    text not null,
  price    numeric not null default 0,
  duration numeric not null default 0,
  active   boolean not null default false,
  bookings int not null default 0
);

create table reviews (
  id             text primary key default gen_random_uuid()::text,
  "customerName" text not null,
  rating         int not null check (rating between 1 and 5),
  body           text not null,
  source         text not null check (source in ('Google','Facebook','Instagram','Direct')),
  date           date not null,
  status         text not null default 'pending' check (status in ('published','pending','hidden'))
);

create table messages (
  id       text primary key default gen_random_uuid()::text,
  "from"   text not null,
  email    text not null,
  subject  text not null,
  preview  text not null,
  date     date not null,
  read     boolean not null default false,
  channel  text not null check (channel in ('Web form','Chat','Email','SMS'))
);

create table inventory (
  id          text primary key default gen_random_uuid()::text,
  item        text not null,
  sku         text not null,
  supplier    text not null,
  quantity    int not null default 0,
  "reorderAt" int not null default 0,
  "unitCost"  numeric not null default 0
);

create table promos (
  id           text primary key,
  "barText"    text not null,
  label        text not null,
  headline     text not null,
  detail       text not null,
  image        text not null,
  "endsAt"     timestamptz not null,
  "spotsTotal" int,
  "spotsLeft"  int,
  cta          jsonb not null,
  "payUrl"     text default ''
);

create table finance (
  id       text primary key default gen_random_uuid()::text,
  label    text not null,
  category text not null check (category in ('Revenue','Materials','Payroll','Overhead','Marketing')),
  amount   numeric not null,
  date     date not null
);

/* ---- Activity + notifications -------------------------------------------- */

create table activity (
  id   text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('appointment','payment','project','customer','review','message')),
  text text not null,
  at   timestamptz not null default now()
);
create index on activity (at desc);

-- ponytail: notifications are written by whatever notices something worth
-- saying — today that is nothing, so the table starts empty and the feed is
-- quiet. The three in the old seed ("invoice overdue", "below reorder level",
-- "invite not accepted") are all time-or-threshold based, i.e. a scheduled job,
-- not a trigger. Add a pg_cron job inserting them when the shop wants them.
create table notifications (
  id   text primary key default gen_random_uuid()::text,
  text text not null,
  at   timestamptz not null default now(),
  read boolean not null default false
);

-- One trigger function for all six logged tables. Reads the new row as jsonb
-- and picks the first name-ish column present, so adding a table means adding a
-- trigger, not writing another function.
create function log_activity() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  -- not named `row`: ROW is a plpgsql keyword and the block won't parse.
  rec jsonb := to_jsonb(new);
  who text := coalesce(
    rec ->> 'customerName', rec ->> 'name', rec ->> 'from',
    rec ->> 'item', rec ->> 'label', rec ->> 'id'
  );
  verb text := case when TG_OP = 'INSERT' then 'created' else 'updated' end;
begin
  insert into activity (kind, text)
  values (TG_ARGV[0], initcap(TG_ARGV[0]) || ' ' || verb || ': ' || who);
  return new;
end;
$$;

create trigger log after insert or update on appointments
  for each row execute function log_activity('appointment');
create trigger log after insert or update on payments
  for each row execute function log_activity('payment');
create trigger log after insert or update on projects
  for each row execute function log_activity('project');
create trigger log after insert or update on customers
  for each row execute function log_activity('customer');
create trigger log after insert or update on reviews
  for each row execute function log_activity('review');
create trigger log after insert or update on messages
  for each row execute function log_activity('message');

/* ---- Derived views -------------------------------------------------------
 * Replacing the pre-aggregated constants in lib/admin/data.ts. These cannot
 * drift from the underlying rows, which the hand-written numbers could and did.
 * ------------------------------------------------------------------------- */

-- customers + the two counts the console shows next to them.
create view admin_customers as
  select c.*,
    (select count(*) from vehicles v where v."customerId" = c.id) as "vehicleCount",
    coalesce((select sum(i.amount) from invoices i
              where i."customerId" = c.id and i.status = 'paid'), 0) as "lifetimeValue"
  from customers c;

-- vehicles + the owner's name, which every console list shows next to them.
create view admin_vehicles as
  select v.*, c.name as "customerName"
  from vehicles v join customers c on c.id = v."customerId";

-- Revenue per period, one row per point, matching the chart's {label,value}.
-- Settled payments only — a "due" invoice is not revenue.
create view revenue_series as
  select 'week' as period, to_char(date, 'Dy') as label,
         extract(isodow from date)::int as sort, sum(amount)::numeric as value
    from payments where status = 'settled' and date >= current_date - 6
   group by 1,2,3
  union all
  select 'month', 'W' || (ceil(extract(day from date) / 7))::int,
         ceil(extract(day from date) / 7)::int, sum(amount)
    from payments where status = 'settled' and date_trunc('month', date) = date_trunc('month', current_date)
   group by 1,2,3
  union all
  select 'year', to_char(date, 'Mon'), extract(month from date)::int, sum(amount)
    from payments where status = 'settled' and date_trunc('year', date) = date_trunc('year', current_date)
   group by 1,2,3;

-- The four headline numbers under the revenue chart.
create view revenue_breakdown as
  select
    coalesce(sum(amount) filter (where status = 'settled'), 0) as "totalSales",
    coalesce(sum(amount) filter (where status = 'settled'), 0) as "serviceRevenue",
    0::numeric as "productSales",
    coalesce(round(avg(amount) filter (where status = 'settled')), 0) as "avgOrderValue"
  from payments
  where date_trunc('month', date) = date_trunc('month', current_date);

/* ---- Row level security --------------------------------------------------
 * Deny by default; active staff see everything. Customer-facing policies land
 * with the customer dashboard — this file is the admin half only.
 * ------------------------------------------------------------------------- */

-- Written out one table at a time rather than looped. A loop with dynamic SQL
-- is shorter, but "does this table have RLS on?" then can't be answered by
-- reading or grepping the file — and Supabase's own linter can't see it either.
-- Security config earns the repetition.

alter table staff         enable row level security;
alter table customers     enable row level security;
alter table vehicles      enable row level security;
alter table appointments  enable row level security;
alter table projects      enable row level security;
alter table invoices      enable row level security;
alter table payments      enable row level security;
alter table services      enable row level security;
alter table reviews       enable row level security;
alter table messages      enable row level security;
alter table inventory     enable row level security;
alter table promos        enable row level security;
alter table finance       enable row level security;
alter table activity      enable row level security;
alter table notifications enable row level security;

create policy staff_all on staff         for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on customers     for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on vehicles      for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on appointments  for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on projects      for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on invoices      for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on payments      for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on services      for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on reviews       for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on messages      for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on inventory     for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on promos        for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on finance       for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on activity      for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on notifications for all to authenticated using (is_staff()) with check (is_staff());

-- Views run as their owner, so they need the check restated.
alter view admin_customers set (security_invoker = on);
alter view admin_vehicles set (security_invoker = on);
alter view revenue_series set (security_invoker = on);
alter view revenue_breakdown set (security_invoker = on);

/* ---- Storage --------------------------------------------------------------
 * Two buckets, opposite read rules. Create both in the dashboard first
 * (Storage > New bucket):
 *
 *   promo-images      Public bucket ON   — the /promos page and the countdown
 *                                          bar render these to logged-out
 *                                          visitors, so read must be anonymous.
 *   passport-photos   Public bucket OFF  — customer vehicle records. Readable
 *                                          only by the customer they belong to,
 *                                          and by staff.
 *
 * Staff are the only writer in both. Customers never upload.
 *
 * PATH CONVENTION for passport-photos, load-bearing:  {customerId}/{file}
 * The read policy below authorises on the first path segment, so a file saved
 * anywhere else is readable by staff and by nobody else. Uploads must build the
 * key from the vehicle's customerId.
 * ------------------------------------------------------------------------- */

-- The customer half of phase 2, arriving early because the storage policy needs
-- it. Security definer for the same reason is_staff() is: it reads a table the
-- caller's own policy would otherwise gate.
create function current_customer_id() returns text
  language sql stable security definer set search_path = public as $$
  select id from customers where "userId" = auth.uid();
$$;

-- promo-images: public read comes from the bucket toggle, not a policy.
create policy "staff write promo images" on storage.objects
  for all to authenticated
  using (bucket_id = 'promo-images' and is_staff())
  with check (bucket_id = 'promo-images' and is_staff());

-- passport-photos: read is the whole point of this bucket being private.
create policy "read own passport photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'passport-photos'
    and (
      is_staff()
      or (storage.foldername(name))[1] = current_customer_id()
    )
  );

create policy "staff write passport photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'passport-photos' and is_staff())
  with check (bucket_id = 'passport-photos' and is_staff());
