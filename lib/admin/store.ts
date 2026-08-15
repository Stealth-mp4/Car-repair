/**
 * lib/admin/store.ts — the admin console's single zustand store.
 *
 * Holds both the domain collections and the console's UI state (sidebar,
 * search, chart period, date range). One store, because every widget on the
 * dashboard reads across collections — splitting it would just mean five
 * `useX()` calls per component.
 *
 * The store is created per request by `createAdminStore`, holding the rows the
 * server just read. lib/admin/data.ts is only a source of types — importing its
 * arrays back into this file would put invented rows on screen whenever the
 * real fetch is slow, partial, or failing, which is the one thing a console
 * must never do.
 */

"use client";

import { createStore, useStore, type StoreApi } from "zustand";
import { createContext, useContext } from "react";
// TYPES AND `TODAY` ONLY. The fixture arrays in here must never become store
// state again — see the file comment above.
import * as seed from "@/lib/admin/data";
import { saveRow, deleteRow, loadAdminData } from "@/app/admin/(console)/actions";
import type { Promo } from "@/lib/site";
import type {
  Appointment,
  AppointmentStatus,
  Project,
  ProjectStatus,
  AdminInvoice,
  InvoiceStatus,
  Message,
  Review,
  ServiceItem,
  StaffMember,
  InventoryItem,
  RevenuePoint,
  AdminServiceRecord,
  AdminPromoClaim,
} from "@/lib/admin/data";

export type ChartPeriod = "week" | "month" | "year";

/**
 * Collections that are lists of editable rows — one table (or view) each, and
 * exactly what create/update/delete can address. Split out from `Collections`
 * so the table map in lib/admin/tables.ts can't be asked for the name of the
 * table behind a pre-aggregated chart series, which has none.
 */
export type RowCollections = {
  appointments: Appointment[];
  projects: Project[];
  customers: typeof seed.customers;
  vehicles: typeof seed.vehicles;
  invoices: AdminInvoice[];
  /**
   * What was done to a car, and what it's covered by. Warranty lives on the
   * same row rather than its own collection — see 0013 for why the two
   * hand-authored JSON sets collapsed into one table.
   */
  serviceRecords: AdminServiceRecord[];
  payments: typeof seed.payments;
  services: ServiceItem[];
  reviews: Review[];
  messages: Message[];
  staff: StaffMember[];
  inventory: InventoryItem[];
  /**
   * Public-site offers. Seeded straight from lib/site.ts — the console edits
   * this session's copy, the same way every other collection here does. Making
   * an edit outlive a refresh (and reach the live /promos page) needs the same
   * backend the rest of the console is waiting on; see README-admin.md.
   */
  promos: Promo[];
  /** Who went to a promo's checkout, and whether the shop confirmed they paid. */
  promoClaims: AdminPromoClaim[];
  finance: typeof seed.finance;
  activity: typeof seed.activity;
};

export type Collections = RowCollections & {
  /** Server-aggregated, never summed client-side. See the revenue_series view. */
  revenueSeries: Record<ChartPeriod, RevenuePoint[]>;
  revenueBreakdown: typeof seed.revenueBreakdown;
};

export type { RevenuePoint } from "@/lib/admin/data";

type UiState = {
  sidebarCollapsed: boolean;
  /** mobile drawer — separate from the desktop collapse, they behave differently */
  mobileNavOpen: boolean;
  search: string;
  chartPeriod: ChartPeriod;
  servicesPeriod: ChartPeriod;
  /** ISO date pair driving the header range picker */
  range: { from: string; to: string };
};

/**
 * How the last load went, per collection.
 *
 * `status` is deliberately global rather than per-collection: the server loads
 * all of them in one round trip, so they are always in the same phase. `errors`
 * IS per-collection, because one table failing while the rest succeed is the
 * normal partial-failure case and each tab has to answer for its own data.
 *
 * An absent key means "loaded fine" — including legitimately empty, and
 * including RLS quietly filtering every row, which is not an error.
 */
export type LoadErrors = Partial<Record<keyof Collections, string>>;

type LoadState = {
  status: "loading" | "ready";
  errors: LoadErrors;
  /**
   * The last write the server refused, or null. Separate from `errors`, which
   * is about reads: a rejected write means the row on screen just reverted, and
   * saying so is the difference between "the database said no" and the edit
   * appearing to vanish for no reason.
   */
  writeError: string | null;
};

type Actions = {
  /** Re-reads every collection from the server. Also the write-failure recovery. */
  reload: () => Promise<void>;

  dismissWriteError: () => void;

  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  setSearch: (q: string) => void;
  setChartPeriod: (p: ChartPeriod) => void;
  setServicesPeriod: (p: ChartPeriod) => void;
  setRange: (from: string, to: string) => void;

  setAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  setProjectProgress: (id: string, progress: number) => void;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  toggleService: (slug: string) => void;
  setReviewStatus: (id: string, status: Review["status"]) => void;
  markMessageRead: (id: string, read?: boolean) => void;
  /** create-or-update by row key — `key` is the collection name */
  upsertRow: (key: keyof RowCollections, row: Record<string, unknown>) => void;
  /** generic row removal — `key` is the collection name */
  removeRow: (key: keyof RowCollections, id: string) => void;
};

/**
 * Row identity. Every collection is keyed by `id` except the service
 * catalogue, which mirrors the public site and is keyed by `slug`. One helper
 * so create/update/delete don't each need to know about that exception.
 */
const rowKey = (r: Record<string, unknown>) => (r.id || r.slug) as string;

/**
 * Write-through. Every mutation below updates local state immediately and
 * sends the same change to the server; the UI never waits on the network.
 *
 * On failure the optimistic edit is a lie, so the store re-reads everything
 * rather than trying to invert the change — a targeted rollback would have to
 * remember the prior value of each of the eight status setters, and this is one
 * line that is always correct.
 *
 * ponytail: full reload on any write error. If a shop with thousands of rows
 * makes that jarring, narrow it to the one collection that failed.
 */
function writeThrough(
  p: Promise<{ error?: string }>,
  reload: () => Promise<void>,
  report: (message: string) => void,
) {
  void p.then((r) => {
    if (r?.error) {
      console.error("[admin] write failed, reloading:", r.error);
      // Reported as well as logged. Without this the optimistic row simply
      // disappears on reload and the console looks like it silently ate the
      // edit — which is what a foreign-key rejection looked like for every
      // "New appointment" ever attempted.
      report(r.error);
      void reload();
    }
  });
}

/**
 * The signed-in staff member. Drives which sections the sidebar offers — the
 * database decides what they can actually read, this only decides what they're
 * invited to click. Null until hydrated, which is why every consumer treats
 * "no role yet" as "show nothing" rather than "show everything".
 */
type Identity = { me: StaffMember | null };

export type AdminStore = Collections & Identity & LoadState & { ui: UiState } & Actions;

/**
 * The empty console. Spread on every hydrate as well as at creation, so a
 * reload that loses access to a collection clears it instead of leaving the
 * previous rows on screen looking current.
 */
const EMPTY: Collections = {
  appointments: [],
  projects: [],
  customers: [],
  vehicles: [],
  invoices: [],
  serviceRecords: [],
  payments: [],
  services: [],
  reviews: [],
  messages: [],
  staff: [],
  inventory: [],
  promos: [],
  promoClaims: [],
  finance: [],
  activity: [],
  revenueSeries: { week: [], month: [], year: [] },
  revenueBreakdown: { totalSales: 0, serviceRevenue: 0, productSales: 0, avgOrderValue: 0 },
};

const initialUi: UiState = {
  sidebarCollapsed: false,
  mobileNavOpen: false,
  search: "",
  chartPeriod: "week",
  servicesPeriod: "month",
  range: { from: "2026-07-28", to: seed.TODAY },
};

export type AdminStoreApi = StoreApi<AdminStore>;

/** What the server hands a freshly created store. */
export type InitialData = Partial<Collections> & {
  me: StaffMember | null;
  errors?: LoadErrors;
};

/**
 * One store per request, created with the server's data already in it.
 *
 * This is why it's a factory and not a module-level `create()`. A single shared
 * instance is wrong twice over: every concurrent SSR request on the server
 * would share it, and — because useSyncExternalStore reads `getInitialState`
 * during SSR — the server pass can only ever render whatever the store was born
 * with. Born empty means the HTML ships empty and the data arrives a paint
 * later; born seeded means the HTML ships fixtures, which is the bug this all
 * started with. Born with the request's own rows is the only version that's
 * both correct and fast.
 */
export function createAdminStore({ errors = {}, ...initial }: InitialData): AdminStoreApi {
  return createStore<AdminStore>((set, get) => {
  const reportWriteError = (message: string) => set({ writeError: message });

  /**
   * Patch one row, locally and on the server. Every status setter below is a
   * call to this — they differed only in which collection and which field, and
   * eight hand-written copies of the same optimistic-write dance is eight
   * places to forget the server half.
   */
  const edit = (collection: keyof RowCollections, id: string, changes: object) => {
    const list = get()[collection] as Record<string, unknown>[];
    const row = list.find((r) => rowKey(r) === id);
    if (!row) return;
    const next = { ...row, ...changes };
    set({ [collection]: list.map((r) => (rowKey(r) === id ? next : r)) } as Partial<AdminStore>);
    writeThrough(saveRow(collection, next), get().reload, reportWriteError);
  };

  return {
  ...EMPTY,
  ...initial,
  errors,
  writeError: null,
  // Born ready: the data is already here. "loading" now describes a reload in
  // flight, not the first paint.
  status: "ready",
  ui: initialUi,

  dismissWriteError: () => set({ writeError: null }),

  reload: async () => {
    set({ status: "loading" });
    const { errors = {}, ...data } = await loadAdminData();
    // Spread EMPTY first: a collection the server can no longer read is absent
    // from `data`, and must go back to empty rather than keep showing the rows
    // from before as though they were still current.
    set({ ...EMPTY, ...data, errors, status: "ready" } as Partial<AdminStore>);
  },

  toggleSidebar: () =>
    set((s) => ({ ui: { ...s.ui, sidebarCollapsed: !s.ui.sidebarCollapsed } })),
  setMobileNav: (open) => set((s) => ({ ui: { ...s.ui, mobileNavOpen: open } })),
  setSearch: (search) => set((s) => ({ ui: { ...s.ui, search } })),
  setChartPeriod: (chartPeriod) => set((s) => ({ ui: { ...s.ui, chartPeriod } })),
  setServicesPeriod: (servicesPeriod) =>
    set((s) => ({ ui: { ...s.ui, servicesPeriod } })),
  setRange: (from, to) => set((s) => ({ ui: { ...s.ui, range: { from, to } } })),

  setAppointmentStatus: (id, status) => edit("appointments", id, { status }),
  setProjectStatus: (id, status) =>
    // Completing a project pins progress to 100 — a "completed" row sitting at
    // 65% is the kind of thing nobody notices until a customer sees it.
    edit("projects", id, status === "completed" ? { status, progress: 100 } : { status }),
  setProjectProgress: (id, progress) =>
    edit("projects", id, { progress: Math.min(100, Math.max(0, progress)) }),
  setInvoiceStatus: (id, status) => edit("invoices", id, { status }),
  toggleService: (slug) => {
    const row = get().services.find((x) => x.slug === slug);
    if (row) edit("services", slug, { active: !row.active });
  },
  setReviewStatus: (id, status) => edit("reviews", id, { status }),
  markMessageRead: (id, read = true) => edit("messages", id, { read }),
  upsertRow: (key, row) => {
    const list = get()[key] as Record<string, unknown>[];
    const target = rowKey(row);
    const i = list.findIndex((r) => rowKey(r) === target);
    // New rows land on top; edits merge in place so the row doesn't jump.
    const merged = i === -1 ? row : { ...list[i], ...row };
    const next = i === -1 ? [row, ...list] : list.map((r, n) => (n === i ? merged : r));
    set({ [key]: next } as Partial<AdminStore>);
    writeThrough(saveRow(key, merged), get().reload, reportWriteError);
  },
  removeRow: (key, id) => {
    set({
      [key]: (get()[key] as Record<string, unknown>[]).filter((r) => rowKey(r) !== id),
    } as Partial<AdminStore>);
    writeThrough(deleteRow(key, id), get().reload, reportWriteError);
  },
  };
  });
}

/**
 * The store for the current tree. Null outside the provider, which `useAdmin`
 * treats as a bug rather than falling back to a shared instance — a fallback
 * would quietly restore exactly the singleton this refactor removes.
 */
export const AdminStoreContext = createContext<AdminStoreApi | null>(null);

/**
 * Unchanged signature: `useAdmin()` for the whole snapshot, `useAdmin(fn)` for
 * a slice. Every existing call site keeps working; only where the store LIVES
 * has changed.
 */
export function useAdmin(): AdminStore;
export function useAdmin<T>(selector: (s: AdminStore) => T): T;
export function useAdmin<T>(selector?: (s: AdminStore) => T) {
  const store = useContext(AdminStoreContext);
  if (!store) throw new Error("useAdmin must be used inside <AdminStoreProvider>.");
  return useStore(store, selector ?? ((s) => s as unknown as T));
}

/* ---- Derived selectors ---------------------------------------------------
 * Plain functions over a store snapshot, so they can never go stale.
 *
 * CALL THEM OUTSIDE THE SUBSCRIPTION:  dashboardStats(useAdmin())
 * NOT AS A SELECTOR:                   useAdmin(dashboardStats)   <-- loops
 *
 * Every one of these builds a fresh object or array. zustand v5 is backed by
 * useSyncExternalStore, which compares the selector's result by reference — a
 * new object each render means "changed every time", i.e. an infinite render
 * loop. Passing the identity selector and computing after is stable, and the
 * console reads across so many collections that subscribing to the whole store
 * costs nothing extra here.
 * ------------------------------------------------------------------------- */

/**
 * The four headline tiles, scoped to the header's date range.
 *
 * They used to ignore it entirely: the range picker wrote to the store and
 * nothing read it, revenue silently followed the CHART's period select instead,
 * and "new customers" counted against a date hard-coded in this file. Three
 * numbers that looked scoped and were not.
 *
 * ISO dates compare correctly as strings, which is why `date` columns are kept
 * as "YYYY-MM-DD" throughout.
 */
export const dashboardStats = (s: AdminStore) => {
  const { from, to } = s.ui.range;
  const within = (d: string) => d >= from && d <= to;

  // Not filtered by date: "active" is a status, and a job that started before
  // the window is still in the bay today.
  const activeProjects = s.projects.filter(
    (p) => p.status === "in-progress" || p.status === "pending"
  ).length;

  // Settled payments only — a pending charge is not money in. Summed from the
  // payments rows rather than revenueSeries because that view is bucketed by
  // week/month/year and can't answer an arbitrary range.
  const revenue = s.payments
    .filter((p) => p.status === "settled" && within(p.date))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    appointments: s.appointments.filter((a) => within(a.date)).length,
    activeProjects,
    revenue,
    newCustomers: s.customers.filter((c) => within(c.joined)).length,
  };
};

/** Donut segments — order fixed so the legend never reshuffles between renders. */
export const projectBreakdown = (s: AdminStore) => {
  const order: ProjectStatus[] = ["in-progress", "pending", "completed", "on-hold"];
  const total = s.projects.length;
  return {
    total,
    segments: order.map((status) => {
      const count = s.projects.filter((p) => p.status === status).length;
      return { status, count, pct: total ? Math.round((count / total) * 100) : 0 };
    }),
  };
};

export const topServices = (s: AdminStore) =>
  [...s.services]
    .filter((x) => x.active)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

export const unreadMessages = (s: AdminStore) => s.messages.filter((m) => !m.read).length;

export type Attention = {
  id: string;
  text: string;
  /** where the fix is */
  href: string;
  /** how loud: "now" is money or a customer waiting, "soon" is housekeeping */
  urgency: "now" | "soon";
};

/**
 * What needs a person, derived from the rows already on screen.
 *
 * NOT the activity log, and not a stored table. The activity feed records what
 * staff DID — "Appointment updated: Christopher Brown" — which is history, not
 * a task, and it never stops being true. The `notifications` table had the
 * opposite problem: nothing ever wrote to it, so the bell showed four seeded
 * rows from January and would have kept showing "Invoice 105 is 22 days
 * overdue" long after 105 was paid.
 *
 * Deriving means an item exists exactly as long as the condition does. Pay the
 * invoice and it disappears on the next load — no read flags, no dismissals, no
 * queue of stale alerts to tidy up.
 *
 * RLS does the access control for free: a technician's `invoices` array is
 * empty because the database filtered it, so no invoice item can be built.
 */
export const attention = (s: AdminStore): Attention[] => {
  const items: Attention[] = [];
  const today = seed.TODAY;

  const days = (from: string) =>
    Math.floor((Date.parse(today) - Date.parse(from)) / 86_400_000);

  // Money owed, oldest first — the one thing here that costs the shop directly.
  for (const inv of s.invoices) {
    if (inv.status === "paid") continue;
    const late = days(inv.dueDate);
    if (late > 0) {
      items.push({
        id: `inv-${inv.id}`,
        // Uppercased to match the Invoices table, which renders the id through
        // a `uppercase` class — the same row shouldn't read "inv-105" here and
        // "INV-105" one click later.
        text: `${inv.id.toUpperCase()} is ${late} day${late === 1 ? "" : "s"} overdue — ${inv.customerName}`,
        href: "/admin/invoices",
        urgency: "now",
      });
    }
  }

  // Someone is waiting for an answer.
  const unread = s.messages.filter((m) => !m.read).length;
  if (unread) {
    items.push({
      id: "messages",
      text: `${unread} enquir${unread === 1 ? "y" : "ies"} not answered yet`,
      href: "/admin/messages",
      urgency: "now",
    });
  }

  // Booked but never confirmed: the customer doesn't know if they're coming in.
  const unconfirmed = s.appointments.filter(
    (a) => a.status === "pending" && a.date >= today,
  ).length;
  if (unconfirmed) {
    items.push({
      id: "appointments",
      text: `${unconfirmed} upcoming appointment${unconfirmed === 1 ? "" : "s"} still unconfirmed`,
      href: "/admin/appointments",
      urgency: "now",
    });
  }

  // Can't do the job without the film.
  for (const item of s.inventory) {
    if (item.quantity <= item.reorderAt) {
      items.push({
        id: `inv-stock-${item.id}`,
        text: `${item.item} is down to ${item.quantity} — reorder at ${item.reorderAt}`,
        href: "/admin/inventory",
        urgency: "soon",
      });
    }
  }

  // Housekeeping: a login that was never taken up.
  for (const person of s.staff) {
    if (person.status === "invited") {
      items.push({
        id: `staff-${person.id}`,
        text: `${person.name} hasn't accepted their invite`,
        href: "/admin/users",
        urgency: "soon",
      });
    }
  }

  // Money first, then housekeeping. Stable order so the list doesn't reshuffle
  // between renders.
  return items.sort((a, b) => (a.urgency === b.urgency ? 0 : a.urgency === "now" ? -1 : 1));
};

/** Appointments on or after TODAY, soonest first. */
export const upcomingAppointments = (s: AdminStore) =>
  [...s.appointments]
    .filter((a) => a.date >= seed.TODAY && a.status !== "cancelled")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
