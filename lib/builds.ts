/**
 * lib/builds.ts — gallery data shape + loader.
 *
 * IMPORTANT (build.md GALLERY + CUSTOMER VEHICLE PASSPORT):
 * `Build` is the PUBLIC gallery view. It is a strict subset of the Phase-2
 * `ServiceRecord`, so Phase 2 (Customer Vehicle Passport) is ADDITIVE — attach a
 * customerId + private fields, expose the same record. Do not fork the schema.
 */

export type MediaItem = {
  type: "image" | "video";
  src: string;
  alt: string;
};

/** Optional before/after pair for the detail-page slider. */
export type BeforeAfter = { before: string; after: string; alt?: string };

/** Public, indexable gallery build record. */
export type Build = {
  slug: string;
  make: string;
  model: string;
  year: number;
  /** service facets performed, e.g. ["Wraps","PPF"] */
  services: string[];
  wrapColor?: string;
  finish?: string;
  media: MediaItem[];
  /** optional before/after — renders a slider on the detail page when present */
  beforeAfter?: BeforeAfter;
  summary: string;
  featured: boolean;
  /** ISO date */
  date: string;
};

/* ---------------------------------------------------------------------------
 * PHASE 2 — Customer Vehicle Passport (data model reserved, UI not built).
 * A public `Build` is a strict subset of `ServiceRecord`'s public fields.
 * ------------------------------------------------------------------------- */
export type Customer = { id: string; name: string; phone: string; email: string };
export type Vehicle = {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
};
export type ServiceRecord = {
  id: string;
  vehicleId: string;
  service: string;
  date: string;
  warrantyExpires?: string;
  invoiceUrl?: string;
  /** links this private record to a public gallery Build */
  buildSlug?: string;
};

/* ---- Seed data (Phase 1). Phase 2 migrates this to a DB. ---------------- */
import cybertruck from "@/content/builds/tesla-cybertruck-satin-black.json";
import model3ppf from "@/content/builds/tesla-model3-stealth-ppf.json";
import modelYTint from "@/content/builds/tesla-modely-ceramic-tint.json";

export const builds: Build[] = [
  cybertruck as Build,
  model3ppf as Build,
  modelYTint as Build,
];

/* ---- Query helpers (drive grid + detail + tesla hub) ------------------- */
export function getBuild(slug: string): Build | undefined {
  return builds.find((b) => b.slug === slug);
}

export function filterBuilds(opts: { make?: string; service?: string }): Build[] {
  return builds.filter((b) => {
    const makeOk = !opts.make || b.make.toLowerCase() === opts.make.toLowerCase();
    const serviceOk =
      !opts.service ||
      b.services.some((s) => s.toLowerCase() === opts.service!.toLowerCase());
    return makeOk && serviceOk;
  });
}

export const featuredBuilds = (): Build[] => builds.filter((b) => b.featured);

/** Related builds for a detail page: same make first, then fill with others. */
export function relatedBuilds(slug: string, limit = 3): Build[] {
  const current = getBuild(slug);
  const others = builds.filter((b) => b.slug !== slug);
  if (!current) return others.slice(0, limit);
  const sameMake = others.filter((b) => b.make === current.make);
  const rest = others.filter((b) => b.make !== current.make);
  return [...sameMake, ...rest].slice(0, limit);
}
