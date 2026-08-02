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
 * PHASE 2 — Customer Vehicle Passport. A public `Build` is a strict subset of
 * `ServiceRecord`'s public fields — these types are additive extensions of the
 * Phase-1 reservation above, not a fork. See lib/passport.ts for loaders and
 * content/{customers,vehicles,warranties,invoices,service-records}/*.json for
 * seed data (hand-authored for now, same pattern as content/builds).
 * ------------------------------------------------------------------------- */
export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** short code the customer uses to open their passport — no full auth system yet */
  accessCode: string;
};

export type Vehicle = {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  wrapColor?: string;
  tint?: { shade: string; brand?: string; areas: string[] };
  /** coverage e.g. "Full front", "Track pack", "Full body" */
  ppf?: { coverage: string; brand?: string };
  /** build photos — reuses the public gallery's MediaItem shape */
  media: MediaItem[];
};

export type Warranty = {
  id: string;
  vehicleId: string;
  /** matches serviceFacets in lib/site.ts, e.g. "PPF", "Ceramic Tint", "Wraps" */
  service: string;
  /** film brand, e.g. "XPEL" */
  provider?: string;
  startDate: string;
  expires: string;
  /** one short line, spec-sheet tone, no marketing fluff */
  terms?: string;
};

export type Invoice = {
  id: string;
  vehicleId: string;
  date: string;
  description: string;
  amount: number;
  fileUrl: string;
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
  notes?: string;
};

/* ---- Seed data (Phase 1). Phase 2 migrates this to a DB. ---------------- */
import cybertruckGreyPpf from "@/content/builds/tesla-cybertruck-grey-ppf.json";
import lamborghiniAventadorBlack from "@/content/builds/lamborghini-aventador-black.json";
import lamborghiniAventadorBlue from "@/content/builds/lamborghini-aventador-blue.json";
import lamborghiniHuracanRed from "@/content/builds/lamborghini-huracan-red.json";
import lamborghiniUrusMatteBlack from "@/content/builds/lamborghini-urus-matte-black.json";
import ferrari488White from "@/content/builds/ferrari-488-white.json";
import porsche911MatteBlack from "@/content/builds/porsche-911-matte-black.json";
import mercedesAmgGtSilver from "@/content/builds/mercedes-amg-gt-silver.json";
import cadillacEscaladeMatteBlack from "@/content/builds/cadillac-escalade-matte-black.json";
import ramTrxDesertTan from "@/content/builds/ram-trx-desert-tan.json";
import rangeRoverMatteGrey from "@/content/builds/range-rover-matte-grey.json";
import rollsRoyceWraithPearlWhite from "@/content/builds/rolls-royce-wraith-pearl-white.json";
import rollsRoyceWraithGlossBlack from "@/content/builds/rolls-royce-wraith-gloss-black.json";
import rollsRoyceWraithCobaltBlue from "@/content/builds/rolls-royce-wraith-cobalt-blue.json";
import rollsRoyceGhostPearlWhite from "@/content/builds/rolls-royce-ghost-pearl-white.json";
import rollsRoyceGhostGraphiteSatin from "@/content/builds/rolls-royce-ghost-graphite-satin.json";
import rollsRoyceGhostRoseSatin from "@/content/builds/rolls-royce-ghost-rose-satin.json";
import bmwM4SatinGrey from "@/content/builds/bmw-m4-satin-grey.json";
import bmwM4MatteBlack from "@/content/builds/bmw-m4-matte-black.json";
import bmwM4AlpineWhite from "@/content/builds/bmw-m4-alpine-white.json";
import bmwM4GranCoupeGraphite from "@/content/builds/bmw-m4-gran-coupe-graphite.json";
import bmwM3Magenta from "@/content/builds/bmw-m3-magenta.json";
import bmwM3RoseGoldSatin from "@/content/builds/bmw-m3-rose-gold-satin.json";
import bmwM3MaroonSatin from "@/content/builds/bmw-m3-maroon-satin.json";
import bmwX5mMatteBlack from "@/content/builds/bmw-x5m-matte-black.json";

export const builds: Build[] = [
  lamborghiniAventadorBlack as Build,
  cybertruckGreyPpf as Build,
  bmwM4GranCoupeGraphite as Build,
  lamborghiniHuracanRed as Build,
  bmwM3Magenta as Build,
  ramTrxDesertTan as Build,
  ferrari488White as Build,
  rollsRoyceGhostRoseSatin as Build,
  bmwM3MaroonSatin as Build,
  bmwM4AlpineWhite as Build,
  bmwM3RoseGoldSatin as Build,
  rollsRoyceGhostPearlWhite as Build,
  mercedesAmgGtSilver as Build,
  rollsRoyceGhostGraphiteSatin as Build,
  bmwM4MatteBlack as Build,
  porsche911MatteBlack as Build,
  bmwM4SatinGrey as Build,
  lamborghiniUrusMatteBlack as Build,
  bmwX5mMatteBlack as Build,
  rollsRoyceWraithCobaltBlue as Build,
  lamborghiniAventadorBlue as Build,
  rangeRoverMatteGrey as Build,
  rollsRoyceWraithPearlWhite as Build,
  cadillacEscaladeMatteBlack as Build,
  rollsRoyceWraithGlossBlack as Build,
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
