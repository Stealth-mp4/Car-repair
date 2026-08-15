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
    image: "/client/vehicle-wraps-card.webp",
    featured: true,
    filmBrand: "Avery Dennison",
  },
  {
    slug: "paint-protection-film",
    title: "Paint Protection Film",
    short: "Self-healing PPF against rock chips and swirl.",
    href: "/services/paint-protection-film",
    image: "/client/ppf-card.webp",
    featured: true,
    filmBrand: "XPEL",
  },
  {
    slug: "ceramic-tint",
    title: "Ceramic Tint",
    short: "Heat-rejecting film. Cooler cabin, protected interior.",
    href: "/services/ceramic-tint",
    image: "/client/ceramic-tint-card.webp",
    featured: true,
    filmBrand: "3M",
  },
  {
    slug: "starlight-headliners",
    title: "Starlight Headliners",
    /** Homepage FeaturedServices grid displays this card as "Accessories" — see homeTitle override in FeaturedServices.tsx. */
    short: "Fibre-optic headliner, mapped and dimmable.",
    href: "/services/starlight-headliners",
    image: "/client/accessories-card.webp",
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

/*
 * The `payments` export that sat here (a Stripe portal URL) is gone. There is
 * no Stripe account: invoices are raised in the console and settled in person
 * or by a link the shop sends. The one online payment path is a Square payment
 * link pasted onto a promo in the console — per-offer checkout, not a billing
 * portal — so there is nothing site-wide to configure.
 *
 * Note the Stripe logo on /financing is unrelated: that is a financing partner
 * listing, not a payment processor the site integrates with.
 */
export type Promo = {
  id: string;
  /** short line shown in the bar above the nav — keep it under ~60 chars */
  barText: string;
  label: string;
  headline: string;
  detail: string;
  image: string;
  /** ISO instant the offer closes. Drives the countdown; past offers self-hide. */
  endsAt: string;
  /** null when the offer isn't capped by headcount */
  spotsTotal?: number;
  spotsLeft?: number;
  cta: { label: string; href: string };
  /**
   * Hosted checkout link for this offer — a Square payment link
   * (square.link/...) or a Stripe payment link (buy.stripe.com/...). The amount
   * lives in the provider, not here, so a deposit and a full payment are the
   * same field and can't drift out of sync with what the customer is charged.
   *
   * PLACEHOLDER: empty until the client sends the link. While it's empty the
   * claim button falls back to the normal booking flow (`cta.href`), so the
   * page is never broken — it just doesn't take money yet.
   *
   * Claiming is account-gated either way: see components/ui/PromoClaim.tsx.
   */
  payUrl?: string;
  /**
   * Price in cents. Set it and claiming generates a Square checkout link for
   * that one customer, which confirms itself when they pay (0016). Leave it and
   * the offer uses `payUrl` above, which is the same link for everyone and is
   * confirmed by hand.
   *
   * Cents, not dollars: it's what Square's API takes, and float dollars are how
   * somebody ends up charged $19.989999999.
   */
  priceCents?: number;
};

/**
 * Can this offer actually take money online? Either a price (a link is generated
 * per customer) or a fixed `payUrl` will do; neither means claiming falls
 * through to the booking form, which is a real and supported state — it is how
 * every offer behaves until the shop fills one of them in.
 *
 * Exists so the buttons can't promise a checkout that isn't there. Labelling a
 * button "Pay" and landing someone on a quote form is the bug this prevents.
 */
export const isPayable = (p: Pick<Promo, "payUrl" | "priceCents">): boolean =>
  Boolean(p.payUrl || p.priceCents);

/**
 * Where this site is served from, with any trailing slash removed.
 *
 * The trim is not cosmetic. This origin is concatenated with paths in two
 * places, and one of them is the notification URL that Square's webhook
 * signature is computed over — so a trailing slash in the environment variable
 * produces `//api/square/webhook`, which hashes to something that does not match
 * the subscription, and every delivery is rejected as a forgery. It cost a full
 * deploy-and-test cycle to find, because the only symptom was a payment that
 * succeeded in Square and never arrived here.
 *
 * Normalising once here is cheaper than trusting whoever fills in the variable
 * next time, in an environment where nobody can see the failure.
 */
export const siteOrigin = (): string =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

/**
 * Live promotions (build.md section 4). Meta ads point at /promos, and the
 * first entry also drives the countdown bar above the nav. Edit here — nothing
 * else hard-codes an offer. An entry whose `endsAt` has passed drops out on its
 * own, so a stale promo can't outlive its deadline on the site.
 */
export const promos: Promo[] = [
  {
    id: "satin-black-wrap-1999",
    barText: "SATIN BLACK WRAP SPECIAL · $1,999 · 7 SPOTS LEFT",
    label: "LIMITED · FIRST 10 CUSTOMERS",
    headline: "$1,999 satin black wrap special",
    detail:
      "A full satin black colour change, booked as one build. Capped at ten cars so every one gets the same bench time.",
    image: "/VINYL_WRAP.webp",
    endsAt: "2026-08-14T23:59:59-05:00",
    spotsTotal: 10,
    spotsLeft: 7,
    cta: { label: "Claim this offer", href: "/quote?promo=satin-black-wrap-1999" },
    payUrl: "",
  },
  {
    id: "tesla-tint-ppf",
    barText: "TESLA TINT + FRONT PPF PACKAGE",
    label: "LIMITED · THROUGH AUG 31",
    headline: "Tesla tint + PPF front package",
    detail:
      "Ceramic tint all-around plus a full front PPF clip, booked as one build instead of two visits.",
    image: "/PPF.webp",
    endsAt: "2026-08-31T23:59:59-05:00",
    cta: { label: "Claim this offer", href: "/quote?promo=tesla-tint-ppf" },
    payUrl: "",
  },
];

/** Promotions that haven't expired yet, soonest deadline first. */
export const activePromos = (now: Date = new Date()): Promo[] =>
  promos
    .filter((p) => new Date(p.endsAt) > now)
    .sort((a, b) => a.endsAt.localeCompare(b.endsAt));

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
        { label: "Current Promos", href: "/promos" },
        { label: "Vehicle Passport", href: "/passport" },
        { label: "Financing", href: "/financing" },
        { label: "My Account", href: "/account" },
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
    { label: "Passport", href: "/passport" },
    { label: "About", href: "/about" },
  ],
  right: [
    { label: "Promos", href: "/promos" },
    { label: "Financing", href: "/financing" },
    { label: "Contact", href: "/contact" },
  ],
  /**
   * Customer account. Rendered as its own icon link rather than another word in
   * the right cluster — accounts are optional here (everything on the site works
   * without one), so it shouldn't compete with the page links for attention.
   */
  cta: { label: "Book Appointment", href: "/quote" },
  account: { label: "Account", href: "/account" },
  
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
