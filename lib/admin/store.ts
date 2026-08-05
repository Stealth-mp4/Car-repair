/**
 * lib/admin/store.ts — the admin console's single zustand store.
 *
 * Holds both the domain collections and the console's UI state (sidebar,
 * search, chart period, date range). One store, because every widget on the
 * dashboard reads across collections — splitting it would just mean five
 * `useX()` calls per component.
 *
 * Data is seeded synchronously from lib/admin/data.ts. To go live, keep the
 * seed as the empty-state default and call `hydrate(payload)` once from a
 * server component or fetch — no other signature below changes.
 */

"use client";

import { create } from "zustand";
import * as seed from "@/lib/admin/data";
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
} from "@/lib/admin/data";

export type ChartPeriod = "week" | "month" | "year";

export type Collections = {
  appointments: Appointment[];
  projects: Project[];
  customers: typeof seed.customers;
  vehicles: typeof seed.vehicles;
  invoices: AdminInvoice[];
  payments: typeof seed.payments;
  services: ServiceItem[];
  reviews: Review[];
  messages: Message[];
  staff: StaffMember[];
  inventory: InventoryItem[];
  finance: typeof seed.finance;
  activity: typeof seed.activity;
  notifications: typeof seed.notifications;
};

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

type Actions = {
  hydrate: (data: Partial<Collections>) => void;

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
  markAllNotificationsRead: () => void;
  /** create-or-update by row key — `key` is the collection name */
  upsertRow: (key: keyof Collections, row: Record<string, unknown>) => void;
  /** generic row removal — `key` is the collection name */
  removeRow: (key: keyof Collections, id: string) => void;
};

/**
 * Row identity. Every collection is keyed by `id` except the service
 * catalogue, which mirrors the public site and is keyed by `slug`. One helper
 * so create/update/delete don't each need to know about that exception.
 */
const rowKey = (r: Record<string, unknown>) => (r.id || r.slug) as string;

export type AdminStore = Collections & { ui: UiState } & Actions;

const initialUi: UiState = {
  sidebarCollapsed: false,
  mobileNavOpen: false,
  search: "",
  chartPeriod: "week",
  servicesPeriod: "month",
  range: { from: "2026-07-28", to: seed.TODAY },
};

export const useAdmin = create<AdminStore>((set) => ({
  appointments: seed.appointments,
  projects: seed.projects,
  customers: seed.customers,
  vehicles: seed.vehicles,
  invoices: seed.invoices,
  payments: seed.payments,
  services: seed.serviceItems,
  reviews: seed.reviews,
  messages: seed.messages,
  staff: seed.staff,
  inventory: seed.inventory,
  finance: seed.finance,
  activity: seed.activity,
  notifications: seed.notifications,
  ui: initialUi,

  hydrate: (data) => set(data),

  toggleSidebar: () =>
    set((s) => ({ ui: { ...s.ui, sidebarCollapsed: !s.ui.sidebarCollapsed } })),
  setMobileNav: (open) => set((s) => ({ ui: { ...s.ui, mobileNavOpen: open } })),
  setSearch: (search) => set((s) => ({ ui: { ...s.ui, search } })),
  setChartPeriod: (chartPeriod) => set((s) => ({ ui: { ...s.ui, chartPeriod } })),
  setServicesPeriod: (servicesPeriod) =>
    set((s) => ({ ui: { ...s.ui, servicesPeriod } })),
  setRange: (from, to) => set((s) => ({ ui: { ...s.ui, range: { from, to } } })),

  setAppointmentStatus: (id, status) =>
    set((s) => ({
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    })),
  setProjectStatus: (id, status) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, status, progress: status === "completed" ? 100 : p.progress } : p
      ),
    })),
  setProjectProgress: (id, progress) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, progress: Math.min(100, Math.max(0, progress)) } : p
      ),
    })),
  setInvoiceStatus: (id, status) =>
    set((s) => ({
      invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
    })),
  toggleService: (slug) =>
    set((s) => ({
      services: s.services.map((x) => (x.slug === slug ? { ...x, active: !x.active } : x)),
    })),
  setReviewStatus: (id, status) =>
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })),
  markMessageRead: (id, read = true) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, read } : m)) })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  upsertRow: (key, row) =>
    set((s) => {
      const list = s[key] as Record<string, unknown>[];
      const target = rowKey(row);
      const i = list.findIndex((r) => rowKey(r) === target);
      // New rows land on top; edits merge in place so the row doesn't jump.
      const next = i === -1 ? [row, ...list] : list.map((r, n) => (n === i ? { ...r, ...row } : r));
      return { [key]: next } as Partial<AdminStore>;
    }),
  removeRow: (key, id) =>
    set((s) => ({
      [key]: (s[key] as Record<string, unknown>[]).filter((r) => rowKey(r) !== id),
    }) as Partial<AdminStore>),
}));

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

export const dashboardStats = (s: AdminStore) => {
  const activeProjects = s.projects.filter(
    (p) => p.status === "in-progress" || p.status === "pending"
  ).length;
  // Same source as the Revenue Overview chart, and follows its period select —
  // summing paid invoices instead gave the tile and the chart directly beneath
  // it two different "total revenue" numbers on the same screen.
  const revenue = seed.revenueSeries[s.ui.chartPeriod].reduce((sum, p) => sum + p.value, 0);
  const newCustomers = s.customers.filter((c) => c.joined >= "2026-07-01").length;
  return {
    appointments: s.appointments.length,
    activeProjects,
    revenue,
    newCustomers,
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
export const unreadNotifications = (s: AdminStore) =>
  s.notifications.filter((n) => !n.read).length;

/** Appointments on or after TODAY, soonest first. */
export const upcomingAppointments = (s: AdminStore) =>
  [...s.appointments]
    .filter((a) => a.date >= seed.TODAY && a.status !== "cancelled")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
