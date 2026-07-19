/**
 * lib/site.ts — all static copy + business data (NAP, hours, nav, services).
 * Single source of truth: components read from here, never hard-code copy.
 * See build.md STRUCTURE + CONTEXT.
 */

export const business = {
  name: "Iqballaz Customs",
  wordmark: "IQBALLAZ",
  wordmarkSub: "CUSTOMS",
  tagline: "Wrapped in Houston. Built for Tesla.",
  cue: "HOUSTON, TX — BY APPOINTMENT",
  /**
   * Concrete trust/credibility line (structural parity §1) — short, mono-styled,
   * understated. PLACEHOLDER figures: confirm exact founding year and lifetime
   * vehicle count with the client before shipping; do not invent numbers.
   */
  trust: "EST. 2015 — 500+ VEHICLES WRAPPED IN HOUSTON",
  url: "https://iqballazcustoms.com",
  phone: "(832) 208-1071",
  phoneHref: "tel:+18322081071",
  email: "info@iqballazcustoms.com",
  address: {
    street: "5819 Richmond Ave",
    locality: "Houston",
    region: "TX",
    postalCode: "77057",
    country: "US",
  },
  priceRange: "$$",
} as const;

/** Mon–Fri 10–6, Sat by appt, Sun closed */
export const hours = [
  { day: "Mon–Fri", value: "10:00 — 6:00" },
  { day: "Saturday", value: "By appointment" },
  { day: "Sunday", value: "Closed" },
] as const;

/** Structured opening hours for JSON-LD (LocalBusiness schema). */
export const openingHours = [
  {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "10:00",
    closes: "18:00",
  },
];

export const social = {
  instagram: "https://www.instagram.com/iqballazcustoms",
  instagramHandle: "@iqballazcustoms",
  facebook: "https://www.facebook.com/iqballazcustoms",
} as const;

export type ServiceLink = {
  slug: string;
  title: string;
  /** short, spec-sheet copy — no marketing fluff */
  short: string;
  href: string;
  /** real shop image for cards */
  image: string;
  /** shown in the homepage featured strip */
  featured?: boolean;
  /**
   * Film/product brand actually carried for this service, shown as a spec-sheet
   * mono tag (structural parity §2). PLACEHOLDER: confirm exact brand(s) carried
   * with the client before shipping — do not guess in the final build.
   */
  filmBrand?: string;
};

/** The core services that get full SEO landing routes. */
export const services: ServiceLink[] = [
  {
    slug: "vehicle-wraps",
    title: "Vehicle Wraps",
    short: "Full colour-change vinyl, precise, no lifted edges.",
    href: "/services/vehicle-wraps",
    image: "/VINYL_WRAP.webp",
    featured: true,
    filmBrand: "Avery Dennison",
  },
  {
    slug: "paint-protection-film",
    title: "Paint Protection Film",
    short: "Self-healing PPF against rock chips and swirl.",
    href: "/services/paint-protection-film",
    image: "/PPF.webp",
    featured: true,
    filmBrand: "XPEL",
  },
  {
    slug: "ceramic-tint",
    title: "Ceramic Tint",
    short: "Heat-rejecting film. Cooler cabin, protected interior.",
    href: "/services/ceramic-tint",
    image: "/WINDOW_TINT.webp",
    featured: true,
    filmBrand: "3M",
  },
  {
    slug: "starlight-headliners",
    title: "Starlight Headliners",
    short: "Fibre-optic headliner, mapped and dimmable.",
    href: "/services/starlight-headliners",
    image: "/SS1.webp",
  },
  {
    slug: "wheels-tires",
    title: "Wheels & Tires",
    short: "Powder coat, refinish, fitment.",
    href: "/services/wheels-tires",
    image: "/wheel_powder_coat.webp",
  },
];

export const featuredServices = (): ServiceLink[] =>
  services.filter((s) => s.featured);

/**
 * Current promotion — one live offer at a time (build.md section 4).
 * Editable here without touching components. Set `active: false` to hide the band.
 */
export const promo = {
  active: true,
  label: "LIMITED — THROUGH AUG 31",
  headline: "Tesla tint + PPF front package",
  detail: "Ceramic tint all-around plus a full front PPF clip, booked as one build.",
  image: "/VINYL_WRAP.webp",
  cta: { label: "Claim this offer", href: "/quote" },
} as const;

/**
 * Full-screen overlay menu (build.md V4 nav — bugatti.com reference).
 * Groups map to the same routes as `services` + core pages; edited here only.
 */
export const menu = {
  groups: [
    {
      label: "What we do",
      items: [
        { label: "Tesla Hub", href: "/tesla", pinned: true },
        { label: "Vehicle Wraps", href: "/services/vehicle-wraps" },
        { label: "Paint Protection Film", href: "/services/paint-protection-film" },
        { label: "Ceramic Tint", href: "/services/ceramic-tint" },
        { label: "Starlight Headliners", href: "/services/starlight-headliners" },
        { label: "Wheels & Tires", href: "/services/wheels-tires" },
      ],
    },
    {
      label: "The shop",
      items: [
        { label: "About", href: "/about" },
        { label: "Gallery", href: "/gallery" },
      ],
    },
    {
      label: "Get started",
      items: [
        { label: "Get a Quote", href: "/quote" },
        { label: "Financing", href: "/financing" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ],
  /** two stacked visual cards shown beside the menu on wide screens */
  visuals: [
    { label: "Tesla Hub", href: "/tesla", image: "/DSC_4434.webp", alt: "Tesla Cybertruck in satin black wrap" },
    { label: "The work", href: "/gallery", image: "/DSC_4458.webp", alt: "Tesla Model 3 with stealth satin PPF" },
    
  ],
} as const;

/** Primary nav — Services opens a mega-panel; Tesla Hub pinned. */
export const nav = {
  primary: [
    { label: "Gallery", href: "/gallery" },
    { label: "Tesla", href: "/tesla" },
    { label: "Financing", href: "/financing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { label: "Get a Quote", href: "/quote" },
} as const;

/** Service filter facets used by the gallery filter bar. */
export const makes = ["Tesla", "BMW", "Mercedes", "Audi", "Ford", "Other"] as const;
export const serviceFacets = ["Wraps", "Tint", "PPF", "Starlights", "Wheels"] as const;
