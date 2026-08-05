/**
 * lib/admin/data.ts — admin domain types + seed records.
 *
 * Seed only. Every collection here is the shape the real API is expected to
 * return, so swapping `seed` for a fetch is a one-line change in the store
 * (see lib/admin/store.ts and the "Going live" notes in README).
 *
 * Dates are hard-coded ISO strings, never `new Date()` — the store is created
 * on both server and client, and a moving clock would desync the two renders.
 */

import type { Customer, Vehicle, Invoice } from "@/lib/builds";
import { customers as seedCustomers, vehicles as seedVehicles, invoices as seedInvoices } from "@/lib/passport";
import { services as catalog } from "@/lib/site";

/** The dashboard's "today". Replace with the server clock once data is live. */
export const TODAY = "2026-08-03";

/* ---- Types --------------------------------------------------------------- */

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";
export type ProjectStatus = "in-progress" | "pending" | "completed" | "on-hold";
export type InvoiceStatus = "paid" | "due" | "overdue";

export type Appointment = {
  id: string;
  customerId: string;
  customerName: string;
  vehicle: string;
  service: string;
  /** ISO date */
  date: string;
  /** 24h "HH:MM" — formatted for display at the edge */
  time: string;
  status: AppointmentStatus;
  image?: string;
};

export type Project = {
  id: string;
  customerId: string;
  customerName: string;
  vehicle: string;
  service: string;
  status: ProjectStatus;
  value: number;
  startDate: string;
  dueDate: string;
  /** 0-100 */
  progress: number;
  assignedTo: string;
};

export type AdminCustomer = Customer & {
  /** ISO date the customer record was created */
  joined: string;
  vehicleCount: number;
  lifetimeValue: number;
};

export type AdminInvoice = Invoice & {
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  dueDate: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  method: "Card" | "Cash" | "Financing" | "Bank transfer";
  date: string;
  status: "settled" | "pending" | "refunded";
};

export type ServiceItem = {
  slug: string;
  title: string;
  /** base price in USD; real pricing is per-vehicle, this is the starting point */
  price: number;
  /** typical shop hours */
  duration: number;
  active: boolean;
  bookings: number;
};

export type Review = {
  id: string;
  customerName: string;
  rating: number;
  body: string;
  source: "Google" | "Facebook" | "Instagram" | "Direct";
  date: string;
  status: "published" | "pending" | "hidden";
};

export type Message = {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  channel: "Web form" | "Chat" | "Email" | "SMS";
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  /** admin console role — drives what the sidebar exposes once auth is wired */
  access: "Super Admin" | "Manager" | "Technician" | "Front desk";
  status: "active" | "invited" | "suspended";
  joined: string;
};

export type InventoryItem = {
  id: string;
  item: string;
  sku: string;
  supplier: string;
  quantity: number;
  reorderAt: number;
  unitCost: number;
};

export type ActivityEntry = {
  id: string;
  kind: "appointment" | "payment" | "project" | "customer" | "review" | "message";
  text: string;
  at: string;
};

export type FinanceEntry = {
  id: string;
  label: string;
  category: "Revenue" | "Materials" | "Payroll" | "Overhead" | "Marketing";
  amount: number;
  date: string;
};

/* ---- Vehicle photos reused from the public gallery ------------------------ */
const shots = [
  "/gallery/lamborghini-aventador-black-1.webp",
  "/gallery/rolls-royce-ghost-white-1.webp",
  "/gallery/porsche-911-black-1.webp",
  "/gallery/mercedes-amg-gt-silver-1.webp",
  "/gallery/bmw-m4-black-1.webp",
  "/gallery/tesla-cybertruck-grey-ppf-1.webp",
  "/gallery/ram-trx-tan-1.webp",
  "/gallery/ferrari-488-white-1.webp",
];

/* ---- Customers ----------------------------------------------------------- */
/** content/customers/* is the real record; the rest are seed rows for the console. */
export const customers: AdminCustomer[] = [
  ...seedCustomers.map((c) => ({
    ...c,
    joined: "2025-01-14",
    vehicleCount: seedVehicles.filter((v) => v.customerId === c.id).length,
    lifetimeValue: seedInvoices.reduce((sum, i) => sum + i.amount, 0),
  })),
  { id: "cust-002", name: "James Carter", phone: "(713) 555-0188", email: "james.carter@example.com", accessCode: "JC-4410", joined: "2026-08-01", vehicleCount: 1, lifetimeValue: 8600 },
  { id: "cust-003", name: "Michael Thompson", phone: "(281) 555-0113", email: "m.thompson@example.com", accessCode: "MT-2087", joined: "2026-08-01", vehicleCount: 2, lifetimeValue: 21400 },
  { id: "cust-004", name: "David Anderson", phone: "(832) 555-0164", email: "david.anderson@example.com", accessCode: "DA-9931", joined: "2026-07-31", vehicleCount: 1, lifetimeValue: 4750 },
  { id: "cust-005", name: "Robert Williams", phone: "(713) 555-0175", email: "r.williams@example.com", accessCode: "RW-6620", joined: "2026-07-31", vehicleCount: 1, lifetimeValue: 12300 },
  { id: "cust-006", name: "Christopher Brown", phone: "(346) 555-0120", email: "chris.brown@example.com", accessCode: "CB-3345", joined: "2026-07-30", vehicleCount: 1, lifetimeValue: 3200 },
  { id: "cust-007", name: "Andrea Nunez", phone: "(281) 555-0198", email: "a.nunez@example.com", accessCode: "AN-7712", joined: "2026-07-28", vehicleCount: 1, lifetimeValue: 6900 },
  { id: "cust-008", name: "Tobias Reyes", phone: "(832) 555-0147", email: "t.reyes@example.com", accessCode: "TR-5508", joined: "2026-07-26", vehicleCount: 1, lifetimeValue: 15750 },
];

/* ---- Vehicles ------------------------------------------------------------ */
export const vehicles: (Vehicle & { customerName: string; lastService: string })[] = [
  ...seedVehicles.map((v) => ({
    ...v,
    customerName: customers.find((c) => c.id === v.customerId)?.name ?? "—",
    lastService: "2025-03-04",
  })),
  { id: "veh-003", customerId: "cust-002", make: "Lamborghini", model: "Revuelto", year: 2024, vin: "ZHWUF6ZF3RL A12043", wrapColor: "Factory / PPF only", ppf: { coverage: "Full body", brand: "XPEL" }, media: [{ type: "image", src: shots[0], alt: "Lamborghini Revuelto" }], customerName: "James Carter", lastService: "2026-08-02" },
  { id: "veh-004", customerId: "cust-003", make: "Rolls-Royce", model: "Cullinan", year: 2023, vin: "SLA1234RRC556012", wrapColor: "Gloss Black", media: [{ type: "image", src: shots[1], alt: "Rolls-Royce Cullinan" }], customerName: "Michael Thompson", lastService: "2026-08-02" },
  { id: "veh-005", customerId: "cust-004", make: "Porsche", model: "911 Turbo S", year: 2024, vin: "WP0AD2A99RS255431", wrapColor: "Satin Black", media: [{ type: "image", src: shots[2], alt: "Porsche 911 Turbo S" }], customerName: "David Anderson", lastService: "2026-07-30" },
  { id: "veh-006", customerId: "cust-005", make: "Mercedes-Benz", model: "G63 AMG", year: 2022, vin: "W1NYC7HJ5NX441002", wrapColor: "Matte Grey", media: [{ type: "image", src: shots[3], alt: "Mercedes G63 AMG" }], customerName: "Robert Williams", lastService: "2026-07-29" },
  { id: "veh-007", customerId: "cust-006", make: "BMW", model: "M4 Competition", year: 2024, vin: "WBS33AZ07RCP12388", wrapColor: "Satin Grey", media: [{ type: "image", src: shots[4], alt: "BMW M4 Competition" }], customerName: "Christopher Brown", lastService: "2026-07-28" },
  { id: "veh-008", customerId: "cust-008", make: "RAM", model: "TRX", year: 2023, vin: "1C6SRFU90PN512004", wrapColor: "Desert Tan", media: [{ type: "image", src: shots[6], alt: "RAM TRX" }], customerName: "Tobias Reyes", lastService: "2026-07-22" },
];

/* ---- Appointments -------------------------------------------------------- */
export const appointments: Appointment[] = [
  { id: "apt-001", customerId: "cust-002", customerName: "James Carter", vehicle: "2024 Lamborghini Revuelto", service: "Paint Protection Film (Full)", date: "2026-08-03", time: "10:00", status: "confirmed", image: shots[0] },
  { id: "apt-002", customerId: "cust-003", customerName: "Michael Thompson", vehicle: "2023 Rolls Royce Cullinan", service: "Custom Wheels & Tint", date: "2026-08-03", time: "13:00", status: "confirmed", image: shots[1] },
  { id: "apt-003", customerId: "cust-004", customerName: "David Anderson", vehicle: "2024 Porsche 911 Turbo S", service: "Full Wrap + Ceramic", date: "2026-08-03", time: "15:00", status: "pending", image: shots[2] },
  { id: "apt-004", customerId: "cust-005", customerName: "Robert Williams", vehicle: "2022 Mercedes G63 AMG", service: "PPF + Window Tint", date: "2026-08-04", time: "14:00", status: "confirmed", image: shots[3] },
  { id: "apt-005", customerId: "cust-006", customerName: "Christopher Brown", vehicle: "2024 BMW M4 Competition", service: "Detailing + Ceramic", date: "2026-08-05", time: "10:30", status: "pending", image: shots[4] },
  { id: "apt-006", customerId: "cust-001", customerName: "Marcus Delgado", vehicle: "2024 Tesla Cybertruck", service: "Wheel Powder Coat", date: "2026-08-05", time: "12:00", status: "confirmed", image: shots[5] },
  { id: "apt-007", customerId: "cust-008", customerName: "Tobias Reyes", vehicle: "2023 RAM TRX", service: "Colour Change Wrap", date: "2026-08-06", time: "09:00", status: "confirmed", image: shots[6] },
  { id: "apt-008", customerId: "cust-007", customerName: "Andrea Nunez", vehicle: "2023 Ferrari 488", service: "Starlight Headliner", date: "2026-08-07", time: "11:00", status: "pending", image: shots[7] },
  { id: "apt-009", customerId: "cust-003", customerName: "Michael Thompson", vehicle: "2023 Rolls Royce Cullinan", service: "Ceramic Coating", date: "2026-07-30", time: "10:00", status: "completed", image: shots[1] },
  { id: "apt-010", customerId: "cust-004", customerName: "David Anderson", vehicle: "2024 Porsche 911 Turbo S", service: "Paint Correction", date: "2026-07-28", time: "16:00", status: "cancelled", image: shots[2] },
];

/* ---- Projects ------------------------------------------------------------ */
export const projects: Project[] = [
  { id: "prj-001", customerId: "cust-002", customerName: "James Carter", vehicle: "2024 Lamborghini Revuelto", service: "Paint Protection Film", status: "in-progress", value: 8600, startDate: "2026-07-30", dueDate: "2026-08-06", progress: 65, assignedTo: "Deshawn Price" },
  { id: "prj-002", customerId: "cust-003", customerName: "Michael Thompson", vehicle: "2023 Rolls Royce Cullinan", service: "Wheels & Tint", status: "in-progress", value: 5400, startDate: "2026-07-31", dueDate: "2026-08-05", progress: 40, assignedTo: "Marisol Vega" },
  { id: "prj-003", customerId: "cust-004", customerName: "David Anderson", vehicle: "2024 Porsche 911 Turbo S", service: "Full Wrap + Ceramic", status: "pending", value: 7250, startDate: "2026-08-04", dueDate: "2026-08-12", progress: 0, assignedTo: "Deshawn Price" },
  { id: "prj-004", customerId: "cust-005", customerName: "Robert Williams", vehicle: "2022 Mercedes G63 AMG", service: "PPF + Ceramic Tint", status: "in-progress", value: 12300, startDate: "2026-07-27", dueDate: "2026-08-08", progress: 78, assignedTo: "Ify Okonkwo" },
  { id: "prj-005", customerId: "cust-006", customerName: "Christopher Brown", vehicle: "2024 BMW M4 Competition", service: "Ceramic Coating", status: "completed", value: 3200, startDate: "2026-07-20", dueDate: "2026-07-28", progress: 100, assignedTo: "Marisol Vega" },
  { id: "prj-006", customerId: "cust-001", customerName: "Marcus Delgado", vehicle: "2024 Tesla Cybertruck", service: "Wheel Powder Coat", status: "on-hold", value: 2100, startDate: "2026-07-18", dueDate: "2026-08-14", progress: 25, assignedTo: "Ify Okonkwo" },
  { id: "prj-007", customerId: "cust-008", customerName: "Tobias Reyes", vehicle: "2023 RAM TRX", service: "Colour Change Wrap", status: "in-progress", value: 6800, startDate: "2026-08-01", dueDate: "2026-08-11", progress: 15, assignedTo: "Deshawn Price" },
  { id: "prj-008", customerId: "cust-007", customerName: "Andrea Nunez", vehicle: "2023 Ferrari 488", service: "Starlight Headliner", status: "pending", value: 4400, startDate: "2026-08-07", dueDate: "2026-08-15", progress: 0, assignedTo: "Marisol Vega" },
  { id: "prj-009", customerId: "cust-002", customerName: "James Carter", vehicle: "2024 Lamborghini Revuelto", service: "Windshield Protection", status: "completed", value: 1900, startDate: "2026-07-14", dueDate: "2026-07-21", progress: 100, assignedTo: "Ify Okonkwo" },
];

/* ---- Invoices ------------------------------------------------------------ */
export const invoices: AdminInvoice[] = [
  ...seedInvoices.map((i) => ({
    ...i,
    customerId: "cust-001",
    customerName: "Marcus Delgado",
    status: "paid" as InvoiceStatus,
    dueDate: i.date,
  })),
  { id: "inv-101", vehicleId: "veh-003", customerId: "cust-002", customerName: "James Carter", date: "2026-07-30", dueDate: "2026-08-13", description: "PPF full body — XPEL Ultimate Plus", amount: 8600, fileUrl: "/invoices/inv-101.pdf", status: "due" },
  { id: "inv-102", vehicleId: "veh-004", customerId: "cust-003", customerName: "Michael Thompson", date: "2026-07-31", dueDate: "2026-08-14", description: "Custom wheels + ceramic tint all-around", amount: 5400, fileUrl: "/invoices/inv-102.pdf", status: "due" },
  { id: "inv-103", vehicleId: "veh-006", customerId: "cust-005", customerName: "Robert Williams", date: "2026-07-27", dueDate: "2026-08-10", description: "PPF front clip + ceramic tint", amount: 12300, fileUrl: "/invoices/inv-103.pdf", status: "paid" },
  { id: "inv-104", vehicleId: "veh-007", customerId: "cust-006", customerName: "Christopher Brown", date: "2026-07-20", dueDate: "2026-08-03", description: "Ceramic coating, 5-year", amount: 3200, fileUrl: "/invoices/inv-104.pdf", status: "paid" },
  { id: "inv-105", vehicleId: "veh-008", customerId: "cust-008", customerName: "Tobias Reyes", date: "2026-06-28", dueDate: "2026-07-12", description: "Colour change wrap — Desert Tan", amount: 6800, fileUrl: "/invoices/inv-105.pdf", status: "overdue" },
  { id: "inv-106", vehicleId: "veh-005", customerId: "cust-004", customerName: "David Anderson", date: "2026-07-15", dueDate: "2026-07-29", description: "Paint correction, two-stage", amount: 1550, fileUrl: "/invoices/inv-106.pdf", status: "paid" },
];

/* ---- Payments ------------------------------------------------------------ */
export const payments: Payment[] = [
  { id: "pay-001", invoiceId: "inv-103", customerName: "Robert Williams", amount: 12300, method: "Financing", date: "2026-07-28", status: "settled" },
  { id: "pay-002", invoiceId: "inv-104", customerName: "Christopher Brown", amount: 3200, method: "Card", date: "2026-07-21", status: "settled" },
  { id: "pay-003", invoiceId: "inv-106", customerName: "David Anderson", amount: 1550, method: "Card", date: "2026-07-16", status: "settled" },
  { id: "pay-004", invoiceId: "inv-101", customerName: "James Carter", amount: 4300, method: "Bank transfer", date: "2026-08-01", status: "pending" },
  { id: "pay-005", invoiceId: "inv-001", customerName: "Marcus Delgado", amount: 1450, method: "Card", date: "2025-01-22", status: "settled" },
  { id: "pay-006", invoiceId: "inv-105", customerName: "Tobias Reyes", amount: 2000, method: "Cash", date: "2026-07-02", status: "settled" },
  { id: "pay-007", invoiceId: "inv-102", customerName: "Michael Thompson", amount: 5400, method: "Card", date: "2026-08-02", status: "pending" },
];

/* ---- Service catalogue --------------------------------------------------- */
/** Titles + slugs come from the public site so the two never drift. */
export const serviceItems: ServiceItem[] = [
  { slug: "paint-protection-film", title: "Paint Protection Film", price: 2400, duration: 24, active: true, bookings: 12 },
  { slug: "ceramic-tint", title: "Window Tint", price: 650, duration: 4, active: true, bookings: 9 },
  { slug: "ceramic-coating", title: "Ceramic Coating", price: 1800, duration: 16, active: true, bookings: 7 },
  { slug: "vehicle-wraps", title: "Vinyl Wrap", price: 4200, duration: 40, active: true, bookings: 6 },
  { slug: "wheels-tires", title: "Wheels & Tires", price: 1200, duration: 8, active: true, bookings: 5 },
  { slug: "starlight-headliners", title: "Starlight Headliners", price: 2600, duration: 20, active: true, bookings: 3 },
  ...catalog
    .filter((s) => !["paint-protection-film", "ceramic-tint", "vehicle-wraps", "wheels-tires", "starlight-headliners"].includes(s.slug))
    .map((s) => ({ slug: s.slug, title: s.title, price: 0, duration: 0, active: false, bookings: 0 })),
];

/* ---- Reviews ------------------------------------------------------------- */
export const reviews: Review[] = [
  { id: "rev-001", customerName: "Robert Williams", rating: 5, body: "Front clip PPF on the G63 is flawless — no lifted edges, and they walked me through the warranty before I paid.", source: "Google", date: "2026-08-01", status: "published" },
  { id: "rev-002", customerName: "Christopher Brown", rating: 5, body: "Booked the ceramic coating and got the car back a day early. Finish still beads six months on.", source: "Google", date: "2026-07-29", status: "published" },
  { id: "rev-003", customerName: "Andrea Nunez", rating: 4, body: "Great work on the headliner. Scheduling took a couple of calls to lock in.", source: "Facebook", date: "2026-07-25", status: "published" },
  { id: "rev-004", customerName: "Tobias Reyes", rating: 5, body: "Desert tan wrap on the TRX turned out exactly like the render they showed me.", source: "Instagram", date: "2026-07-22", status: "pending" },
  { id: "rev-005", customerName: "Marcus Delgado", rating: 5, body: "Second Tesla I've brought here. The passport with all my warranties in one place is genuinely useful.", source: "Direct", date: "2026-07-18", status: "published" },
];

/* ---- Messages ------------------------------------------------------------ */
export const messages: Message[] = [
  { id: "msg-001", from: "James Carter", email: "james.carter@example.com", subject: "Revuelto PPF — timeline", preview: "Any chance the full-body clip is done before the 8th? Have an event that weekend.", date: "2026-08-03", read: false, channel: "Web form" },
  { id: "msg-002", from: "Andrea Nunez", email: "a.nunez@example.com", subject: "Starlight headliner quote", preview: "Wanted to confirm the fibre count and whether the dimmer is app-controlled.", date: "2026-08-02", read: false, channel: "Chat" },
  { id: "msg-003", from: "Priya Raman", email: "priya.raman@example.com", subject: "Tesla Model Y tint", preview: "Do you carry a 70% ceramic for the windshield? Looking to book this month.", date: "2026-08-02", read: false, channel: "Web form" },
  { id: "msg-004", from: "Michael Thompson", email: "m.thompson@example.com", subject: "Invoice 102 — split payment", preview: "Can I put half on card and finance the rest through Acima?", date: "2026-08-01", read: true, channel: "Email" },
  { id: "msg-005", from: "Dane Whitfield", email: "d.whitfield@example.com", subject: "Fleet wrap — 6 vans", preview: "Looking for a quote on six Sprinter vans, matte black with cut vinyl logos.", date: "2026-07-31", read: false, channel: "Web form" },
  { id: "msg-006", from: "Tobias Reyes", email: "t.reyes@example.com", subject: "Balance on the TRX wrap", preview: "Sorry for the delay — settling the rest this week.", date: "2026-07-30", read: true, channel: "SMS" },
];

/* ---- Staff / users ------------------------------------------------------- */
export const staff: StaffMember[] = [
  { id: "stf-001", name: "Iqbal Hassan", email: "iqbal@iqballazcustoms.com", role: "Owner", access: "Super Admin", status: "active", joined: "2015-03-02" },
  { id: "stf-002", name: "Marisol Vega", email: "marisol@iqballazcustoms.com", role: "Shop Manager", access: "Manager", status: "active", joined: "2019-06-11" },
  { id: "stf-003", name: "Deshawn Price", email: "deshawn@iqballazcustoms.com", role: "Lead Installer", access: "Technician", status: "active", joined: "2020-09-01" },
  { id: "stf-004", name: "Ify Okonkwo", email: "ify@iqballazcustoms.com", role: "PPF Technician", access: "Technician", status: "active", joined: "2022-02-14" },
  { id: "stf-005", name: "Camila Ortiz", email: "camila@iqballazcustoms.com", role: "Front Desk", access: "Front desk", status: "active", joined: "2023-08-07" },
  { id: "stf-006", name: "Luis Bermudez", email: "luis@iqballazcustoms.com", role: "Detailer", access: "Technician", status: "invited", joined: "2026-07-28" },
];

/* ---- Inventory ----------------------------------------------------------- */
export const inventory: InventoryItem[] = [
  { id: "inv-mat-001", item: "XPEL Ultimate Plus 60in", sku: "XPL-UP-60", supplier: "XPEL", quantity: 8, reorderAt: 6, unitCost: 890 },
  { id: "inv-mat-002", item: "3M Crystalline 70% 40in", sku: "3M-CR70-40", supplier: "3M", quantity: 4, reorderAt: 6, unitCost: 420 },
  { id: "inv-mat-003", item: "Avery SW900 Satin Black", sku: "AV-SW900-SB", supplier: "Avery Dennison", quantity: 11, reorderAt: 5, unitCost: 610 },
  { id: "inv-mat-004", item: "Gtechniq Crystal Serum Ultra", sku: "GT-CSU-50", supplier: "Gtechniq", quantity: 3, reorderAt: 4, unitCost: 240 },
  { id: "inv-mat-005", item: "Inozetek Super Gloss Midnight", sku: "INZ-SG-MN", supplier: "Inozetek", quantity: 6, reorderAt: 4, unitCost: 705 },
  { id: "inv-mat-006", item: "Powder coat — Gloss Anthracite", sku: "PC-GA-25", supplier: "Prismatic", quantity: 2, reorderAt: 3, unitCost: 180 },
  { id: "inv-mat-007", item: "Fibre-optic headliner kit (600pt)", sku: "SL-FO-600", supplier: "Tinybot", quantity: 5, reorderAt: 2, unitCost: 320 },
];

/* ---- Finance ledger ------------------------------------------------------ */
export const finance: FinanceEntry[] = [
  { id: "fin-001", label: "Service revenue — July", category: "Revenue", amount: 72340, date: "2026-07-31" },
  { id: "fin-002", label: "Product sales — July", category: "Revenue", amount: 26200, date: "2026-07-31" },
  { id: "fin-003", label: "Film + vinyl restock", category: "Materials", amount: -18400, date: "2026-07-29" },
  { id: "fin-004", label: "Payroll — July", category: "Payroll", amount: -31500, date: "2026-07-31" },
  { id: "fin-005", label: "Shop lease", category: "Overhead", amount: -6800, date: "2026-08-01" },
  { id: "fin-006", label: "Utilities + insurance", category: "Overhead", amount: -2450, date: "2026-08-01" },
  { id: "fin-007", label: "Paid social + Google", category: "Marketing", amount: -3100, date: "2026-07-28" },
];

/* ---- Activity feed ------------------------------------------------------- */
export const activity: ActivityEntry[] = [
  { id: "act-001", kind: "appointment", text: "New appointment created for 2024 Lamborghini Revuelto", at: "2026-08-03T10:24:00" },
  { id: "act-002", kind: "payment", text: "Payment received from Michael Thompson", at: "2026-08-03T09:15:00" },
  { id: "act-003", kind: "project", text: "Project completed: 2024 Porsche 911 Turbo S", at: "2026-08-02T17:40:00" },
  { id: "act-004", kind: "customer", text: "New customer registered: James Carter", at: "2026-08-02T14:02:00" },
  { id: "act-005", kind: "review", text: "New 5-star Google review from Robert Williams", at: "2026-08-01T19:20:00" },
  { id: "act-006", kind: "message", text: "Fleet wrap enquiry received from Dane Whitfield", at: "2026-07-31T11:05:00" },
];

/* ---- Revenue series (chart) ---------------------------------------------- */
export type RevenuePoint = { label: string; value: number };

/**
 * Pre-aggregated revenue per period. A real backend returns exactly this shape
 * from a `GROUP BY` — the chart never aggregates raw invoices client-side.
 */
export const revenueSeries: Record<"week" | "month" | "year", RevenuePoint[]> = {
  week: [
    { label: "Mon", value: 9800 },
    { label: "Tue", value: 12400 },
    { label: "Wed", value: 14100 },
    { label: "Thu", value: 22600 },
    { label: "Fri", value: 17300 },
    { label: "Sat", value: 12900 },
    { label: "Sun", value: 9440 },
  ],
  month: [
    { label: "W1", value: 71200 },
    { label: "W2", value: 84600 },
    { label: "W3", value: 68900 },
    { label: "W4", value: 98540 },
  ],
  year: [
    { label: "Jan", value: 214000 },
    { label: "Feb", value: 198500 },
    { label: "Mar", value: 246300 },
    { label: "Apr", value: 271400 },
    { label: "May", value: 259800 },
    { label: "Jun", value: 288100 },
    { label: "Jul", value: 323200 },
    { label: "Aug", value: 98540 },
  ],
};

/** Headline revenue split shown under the chart. */
export const revenueBreakdown = {
  totalSales: 98540,
  serviceRevenue: 72340,
  productSales: 26200,
  avgOrderValue: 2450,
};

/** Week-over-week deltas for the stat row. Server-computed in production. */
export const deltas = {
  appointments: 12,
  projects: 8,
  revenue: 15,
  customers: 20,
  revenueVsPrior: 15.3,
};

export const notifications = [
  { id: "ntf-001", text: "Invoice 105 is 22 days overdue", at: "2026-08-03T08:00:00", read: false },
  { id: "ntf-002", text: "3M Crystalline 70% is below reorder level", at: "2026-08-02T18:30:00", read: false },
  { id: "ntf-003", text: "Andrea Nunez replied in chat", at: "2026-08-02T15:12:00", read: false },
  { id: "ntf-004", text: "Luis Bermudez has not accepted his invite", at: "2026-08-01T09:00:00", read: false },
];
