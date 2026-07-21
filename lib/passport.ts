/**
 * lib/passport.ts — Customer Vehicle Passport loaders + queries.
 *
 * Sibling to lib/builds.ts (which owns the Customer / Vehicle / Warranty /
 * Invoice / ServiceRecord types — see the PHASE 2 block there). This file
 * only loads the seed content and exposes the same kind of small, typed
 * helpers lib/builds.ts already uses (getBuild, filterBuilds, relatedBuilds).
 *
 * Seed data is hand-authored JSON under content/{customers,vehicles,
 * warranties,invoices,service-records}/*.json — same pattern as
 * content/builds/*.json today. Phase 2 migrates this to a DB; flag to the
 * client that a real login replaces the access-code gate once passport
 * volume grows past a handful of hand-edited files.
 */

import type { Customer, Vehicle, Warranty, Invoice, ServiceRecord } from "@/lib/builds";

import marcusDelgado from "@/content/customers/marcus-delgado.json";

import model3Delgado from "@/content/vehicles/model3-delgado.json";
import cybertruckDelgado from "@/content/vehicles/cybertruck-delgado.json";

import wtyPpfModel3 from "@/content/warranties/wty-001-ppf-model3.json";
import wtyTintModel3 from "@/content/warranties/wty-002-tint-model3.json";
import wtyWrapCybertruck from "@/content/warranties/wty-003-wrap-cybertruck.json";
import wtyWheelsCybertruck from "@/content/warranties/wty-004-wheels-cybertruck.json";

import invPpfModel3 from "@/content/invoices/inv-001-ppf-model3.json";
import invTintModel3 from "@/content/invoices/inv-002-tint-model3.json";
import invWrapCybertruck from "@/content/invoices/inv-003-wrap-cybertruck.json";
import invWheelsCybertruck from "@/content/invoices/inv-004-wheels-cybertruck.json";

import srPpfModel3 from "@/content/service-records/sr-001-ppf-model3.json";
import srTintModel3 from "@/content/service-records/sr-002-tint-model3.json";
import srWrapCybertruck from "@/content/service-records/sr-003-wrap-cybertruck.json";
import srWheelsCybertruck from "@/content/service-records/sr-004-wheels-cybertruck.json";

export const customers: Customer[] = [marcusDelgado as Customer];

export const vehicles: Vehicle[] = [
  model3Delgado as Vehicle,
  cybertruckDelgado as Vehicle,
];

export const warranties: Warranty[] = [
  wtyPpfModel3 as Warranty,
  wtyTintModel3 as Warranty,
  wtyWrapCybertruck as Warranty,
  wtyWheelsCybertruck as Warranty,
];

export const invoices: Invoice[] = [
  invPpfModel3 as Invoice,
  invTintModel3 as Invoice,
  invWrapCybertruck as Invoice,
  invWheelsCybertruck as Invoice,
];

export const serviceRecords: ServiceRecord[] = [
  srPpfModel3 as ServiceRecord,
  srTintModel3 as ServiceRecord,
  srWrapCybertruck as ServiceRecord,
  srWheelsCybertruck as ServiceRecord,
];

/* ---- Query helpers ------------------------------------------------------ */

export function getCustomerByAccessCode(code: string): Customer | undefined {
  const normalized = code.trim().toUpperCase();
  return customers.find((c) => c.accessCode.toUpperCase() === normalized);
}

export function getVehicle(vehicleId: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === vehicleId);
}

export function getVehiclesForCustomer(customerId: string): Vehicle[] {
  return vehicles.filter((v) => v.customerId === customerId);
}

export function getServiceHistory(vehicleId: string): ServiceRecord[] {
  return serviceRecords
    .filter((s) => s.vehicleId === vehicleId)
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // most recent first
}

export function getWarranties(vehicleId: string): Warranty[] {
  return warranties.filter((w) => w.vehicleId === vehicleId);
}

export function getInvoices(vehicleId: string): Invoice[] {
  return invoices
    .filter((i) => i.vehicleId === vehicleId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export function warrantyStatus(w: Warranty): "active" | "expiring" | "expired" {
  const expires = new Date(w.expires).getTime();
  const now = Date.now();
  if (expires < now) return "expired";
  if (expires - now <= SIXTY_DAYS_MS) return "expiring";
  return "active";
}
