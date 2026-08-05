# Admin console (`/admin`)

Built to the client's reference board, in the site's own V5 system (near-black
stage, burgundy/maroon surfaces, cream text, caliper red as the single accent,
hairlines instead of shadows — see `DESIGN.md`).

## Run it

```bash
npm run dev        # http://localhost:3000/admin
```

Sign in with the seeded development login, which the login screen also shows:

```
admin / iqballaz
```

That seed lives in `lib/admin/auth.ts` and applies **only when
`NODE_ENV !== "production"`**. It is a placeholder until real per-user auth
lands (item 1 below), not a credential to keep.

**Before deploying**, set all three in the host's environment — a production
build has no seeded login and refuses to open the console without them:

```
ADMIN_USER=...
ADMIN_PASSWORD=...
SESSION_SECRET=...     # openssl rand -base64 32
```

Env vars override the seed in every environment. Next reads `.env.local` at
startup only, so restart the dev server after editing it.

## What's there

| Route | What it does |
|---|---|
| `/admin` | Dashboard: 4 stat tiles, revenue chart, projects donut, top services, recent appointments / customers / activity, upcoming appointments |
| `/admin/appointments` | Calendar (month / week / day) **or** list — toggle in the header. Click a day to book, click an appointment to edit |
| `/admin/customers` …`/activity` | 13 list views (customers, vehicles, projects, services, invoices, payments, finance, reviews, messages, users, staff, inventory, activity log) — each with search, sorting, status filters, pagination, and create/edit/delete |
| `/admin/settings` | Business details, hours, public-site config, integration status |
| `/admin/login` | Sign-in screen. Everything else redirects here, preserving the requested path |

Everything works today against seed data: create, edit, and delete rows in every
section; sort any column; paginate; search across all sections from the topbar
or within one section; filter by status; book and reschedule from the calendar;
collapse the sidebar; switch chart periods and the date range.

## How it's wired

- **State** — one zustand store, `lib/admin/store.ts`. Collections + UI state
  together, because most widgets read across collections.
  Derived values (`dashboardStats`, `projectBreakdown`, …) are called as
  `dashboardStats(useAdmin())`, **never** `useAdmin(dashboardStats)` — they
  build fresh objects, and zustand v5 compares selector results by reference,
  so passing them as selectors is an infinite render loop. There's a comment on
  the block saying so.
- **Sections** — `lib/admin/sections.tsx` is the single config driving both the
  sidebar and every list page. Adding a section = one entry there, no new route
  file. `app/admin/[section]/page.tsx` renders whatever it describes.
- **Data** — `lib/admin/data.ts`. Customers, vehicles, and invoices extend the
  real records in `content/`; the rest is seed. All dates are hard-coded ISO
  strings (never `new Date()`) so server and client renders agree.
- **Tables** — TanStack Table v8, headless. It owns sorting / filtering /
  pagination row models; we own every element, so rows stay in the site's design
  system rather than a grid library's theme. Chosen over MUI DataGrid (drags in
  Emotion and a second theming system that fights the Tailwind v4 tokens, and
  puts several grid features behind MUI X Pro) and AG Grid (heaviest, most
  useful features are Enterprise).
- **Forms** — `components/admin/RowForm.tsx`, one dialog for every section,
  built from that section's `fields`. Uses the native `<dialog showModal()>`:
  focus trap, Esc-to-close, inert background, and `::backdrop` come from the
  platform, so no headless-UI dependency. `key` supports dotted paths
  (`ppf.coverage`) for the few nested fields.
- **Charts + calendar** — hand-rolled SVG and a CSS grid. No charting dependency
  for one polyline and one donut; no FullCalendar (~200KB plus its own theme to
  override) for a month grid. Calendar date maths runs in UTC on `YYYY-MM-DD`
  strings — local-time `Date` maths shifts a day either side of a DST boundary,
  and appointments carry no timezone.
- **Auth** — `lib/admin/auth.ts` + `middleware.ts` + `app/admin/login/`. A
  signed, httpOnly, 8-hour JWT session cookie (HS256 via `jose`, which works in
  the Edge runtime where middleware runs). Unauthenticated requests redirect to
  the login screen with `?next=` so sign-in returns you where you were. Sign-out
  is a POST server action that deletes the cookie — a GET sign-out can be
  triggered by any page that embeds the URL.
  Credential comparison is constant-time, the failure message never reveals
  which half was wrong, and there's a per-username attempt throttle (in-process,
  so it's friction rather than a real rate limiter).
- **Layout** — the marketing pages moved into `app/(site)/` (URLs unchanged) so
  the console doesn't inherit the site nav, footer, splash screen, smooth
  scroll, or chat widget. Inside `app/admin`, the console routes live in
  `(console)/` so they get the sidebar+topbar shell while `login/` doesn't.

## What the dashboard still needs to be real

Roughly in the order they matter.

**1. Per-user accounts — the login screen is real, the trust model isn't.**
There is a proper login page, a signed session cookie, and a working sign-out.
But it is still ONE shared credential from env vars: no per-user accounts, no
roles, no password reset, no record of who did what. The Users/Staff pages
already model `access` levels with nothing enforcing them.
→ Auth.js (free, self-hosted), Clerk, or Supabase Auth, backed by the user table
from item 2. Then enforce `access` per route and log actions to the activity
feed. The session/cookie plumbing in `lib/admin/auth.ts` is small enough to
throw away when that lands.

**2. A database.** Everything resets on reload — the store is in-memory.
→ Postgres (Supabase / Neon / Vercel Postgres) + Prisma or Drizzle. The types in
`lib/admin/data.ts` are the schema; port them directly. Then replace the seed
with `hydrate(payload)` from a server component — no component changes needed.
Migrate `content/*.json` in the same pass so the passport and the console share
one source.

**3. Write endpoints.** Confirming an appointment or marking a message read
currently only updates local state. Each store action needs a matching
`PATCH /api/admin/...` and server-side authorization.

**4. Payments — Stripe.** `/admin/payments` and `/admin/invoices` display
records; nothing charges a card or reconciles. Needs Stripe Checkout or Payment
Links plus a webhook to flip invoice status on `payment_intent.succeeded`.
Financing (Acima / Snap, already on the public site) stays a separate manual
flow unless they have an API.

**5. Email + SMS.** Appointment confirmations and reminders.
→ Resend or Postmark for email, Twilio for SMS. The shop books by appointment
with same-week slots, so SMS reminders will matter more than email.

**6. Lead intake into the console.** `/api/lead` already accepts quote-form and
chat submissions but only forwards to `LEAD_WEBHOOK_URL` or logs them. Point it
at the database and `/admin/messages` becomes the live inbox it looks like.

**7. Reviews sync.** Google Business Profile via the Places API, so
`/admin/reviews` reflects reality instead of hand-entered rows.

**8. File storage.** Invoice PDFs (`fileUrl`) and build photos point at static
paths. → S3, R2, or Vercel Blob with signed URLs.

**9. Settings persistence.** `/admin/settings` is deliberately read-only: every
value is currently sourced from `lib/site.ts` or an env var, so editable inputs
would fake a save with nowhere to go. Once there's a settings table, make the
panels editable and drop the "edited in lib/site.ts" footers.

**10. Analytics for the deltas.** The "+12% from last week" figures and the
revenue series in `lib/admin/data.ts` are seeded constants. They need real
period-over-period aggregation server-side (a `GROUP BY`, returned in the shape
`revenueSeries` already uses).

### Smaller things worth knowing

- Pagination is client-side: every row is in memory and TanStack slices it. Past
  a few thousand rows, move `pageIndex`/`pageSize`/`sorting` into the query
  (`manualPagination: true`) and page on the server.
- The calendar has no drag-to-reschedule. It needs a write endpoint to mean
  anything, so it lands with item 3 above, not before it.
- `TODAY` in `lib/admin/data.ts` is pinned to `2026-08-03`. Swap it for the
  request clock when data goes live; `lib/admin/format.ts` derives everything
  from it and stays correct.
- Staff names, inventory suppliers, service pricing, and the finance ledger are
  invented placeholders. Confirm all of them with the client before launch —
  same rule `DESIGN.md` sets for the public site's numbers.
- `--color-ok` / `--color-warn` in `globals.css` are admin-only status colors.
  Keep them off the marketing pages.
