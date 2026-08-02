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
  cue: "HOUSTON, TX · BY APPOINTMENT",
  /** Hero star-line (V5) — small, legible, sits above the "Built Different" headline. Stars rendered separately in Hero.tsx (styled yellow). */
  heroCue: "We Wrap Private Jets, Aircraft & Marine Vessels Too.",
  /** Hero subcopy (V5), sits under the "Built Different" headline. */
  heroSubcopy: "Premium vehicle customization for those who expect more.",
  /**
   * Concrete trust/credibility line (structural parity §1) — short, mono-styled,
   * understated. PLACEHOLDER figures: confirm exact founding year and lifetime
   * vehicle count with the client before shipping; do not invent numbers.
   */
  trust: "EST. 2015 · 500+ VEHICLES WRAPPED IN HOUSTON",
  url: "https://iqballazcustoms.com",
  phone: "(832) 208-1071",
  phoneHref: "tel:+18322081071",
  email: "info@iqballazcustoms.com",
  address: {
    street: "10950 Stancliff Rd",
    locality: "Houston",
    region: "TX",
    postalCode: "77099",
    country: "US",
  },
  priceRange: "$$",
  /**
   * "View All Reviews" destination. PLACEHOLDER — a generic Google search
   * link, not the confirmed Google Business Profile review URL. Swap for the
   * real g.page / maps review link once the client sends it.
   */
  googleReviewsUrl: "https://www.google.com/search?q=Iqballaz+Customs+reviews",
} as const;

/** Mon-Sat 12PM-8PM, Sun closed */
export const hours = [
  { day: "Mon-Sat", value: "12PM-8PM" },
  { day: "Sunday", value: "Closed" },
] as const;

/** Structured opening hours for JSON-LD (LocalBusiness schema). */
export const openingHours = [
  {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "12:00",
    closes: "20:00",
  },
];

export const social = {
  instagram: "https://www.instagram.com/iqballazcustoms",
  instagramHandle: "@iqballazcustoms",
  facebook: "https://www.facebook.com/people/Iqballaz-customs/61562782624220",
  tiktok: "https://www.tiktok.com/@_iqballazcustoms",
  tiktokHandle: "@_iqballazcustoms",
} as const;

/** Brand mark assets (V5) — see DESIGN.md "Centered-Logo Nav" + "Splash Screen". */
export const brand = {
  /** Tightly-cropped transparent mark — use wherever height is constrained (nav, splash, footer plate). */
  markTight: "/brand/iqballaz-mark-tight.png",
  /** Full-canvas transparent mark — use where natural padding is wanted. */
  mark: "/brand/iqballaz-mark.png",
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
    image: "/client/vehicle-wraps-card.jpg",
    featured: true,
    filmBrand: "Avery Dennison",
  },
  {
    slug: "paint-protection-film",
    title: "Paint Protection Film",
    short: "Self-healing PPF against rock chips and swirl.",
    href: "/services/paint-protection-film",
    image: "/client/ppf-card.jpg",
    featured: true,
    filmBrand: "XPEL",
  },
  {
    slug: "ceramic-tint",
    title: "Ceramic Tint",
    short: "Heat-rejecting film. Cooler cabin, protected interior.",
    href: "/services/ceramic-tint",
    image: "/client/ceramic-tint-card.jpg",
    featured: true,
    filmBrand: "3M",
  },
  {
    slug: "starlight-headliners",
    title: "Starlight Headliners",
    /** Homepage FeaturedServices grid displays this card as "Accessories" — see homeTitle override in FeaturedServices.tsx. */
    short: "Fibre-optic headliner, mapped and dimmable.",
    href: "/services/starlight-headliners",
    image: "/client/accessories-card.jpg",
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

export type ServiceNavItem = { label: string; href: string; short: string };

/**
 * Service index links — Tesla Hub plus every service
 * landing page, each with a one-line spec description. Single source so the
 * desktop dropdown and the mobile menu "Services" group never drift apart.
 */
/** Used by the /services index — every service page, Tesla Hub first. */
export const serviceNavItems: ServiceNavItem[] = [
  {
    label: "Tesla Hub",
    href: "/tesla",
    short: "Wraps, tint & PPF built for Tesla: 3, Y, S, X, Cybertruck.",
  },
  ...services.map((s) => ({ label: s.title, href: s.href, short: s.short })),
];

/**
 * Current promotion — one live offer at a time (build.md section 4).
 * Editable here without touching components. Set `active: false` to hide the band.
 */
export const promo = {
  active: true,
  label: "LIMITED · THROUGH AUG 31",
  headline: "Tesla tint + PPF front package",
  detail: "Ceramic tint all-around plus a full front PPF clip, booked as one build.",
  image: "/VINYL_WRAP.webp",
  cta: { label: "Claim this offer", href: "/quote" },
} as const;

/**
 * Mobile menu overlay (<1024px only — desktop nav shows every link directly,
 * see `nav` below). `top` is the flat, ungrouped link list; `groups` are the
 * labelled sections underneath it.
 */
export const menu = {
  top: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  groups: [
    {
      label: "Get started",
      items: [
        { label: "Vehicle Passport", href: "/passport" },
        { label: "Financing", href: "/financing" },
      ],
    },
  ],
} as const;

/**
 * Primary nav (V5 — Mansory reference): split link clusters flank the centered
 * logo mark on desktop (>=1024px). "Services" links straight to /services,
 * which carries every service page. Below 1024px, a menu button opens the
 * full-screen overlay (see `menu` above) instead.
 */
export const nav = {
  left: [
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
  ],
  right: [
    { label: "Financing", href: "/financing" },
    { label: "Passport", href: "/passport" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { label: "Book Appointment", href: "/quote" },
} as const;

/** Service filter facets used by the gallery filter bar. */
export const makes = [
  "Tesla",
  "Rolls-Royce",
  "BMW",
  "Lamborghini",
  "Mercedes-Benz",
  "Porsche",
  "Ferrari",
  "Cadillac",
  "RAM",
  "Land Rover",
] as const;
export const serviceFacets = ["Wraps", "Tint", "PPF", "Starlights", "Wheels"] as const;
