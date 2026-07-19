# BUILD SPEC — "IQBALLAZ V2" — Houston's premium vehicle customization platform
Cinematic, high-performance product site for a Tesla-heavy wrap/tint/PPF shop. Build
in one pass, section by section. Read every LAW; the site must PASS the anti-AI
checklist at the end, not merely render.

## CONTEXT (from current site + brief)
Shop: Iqballaz Customs, 5819 Richmond Ave, Houston, TX 77057. (832) 208-1071.
By appointment only, Mon–Fri 10–6, Sat by appt, Sun closed. Services today: vinyl
wrap, window tint, PPF, wheel powder coat, chrome delete, caliper paint. Current site
is a generic single-page template — V2 replaces it entirely with a multi-page,
lead-gen-driven platform, Tesla-forward, built to scale into a customer vehicle
"passport" system in Phase 2.

## NON-NEGOTIABLE DESIGN LAWS (this is what stops it looking AI-generated)

### Colour — the #1 tell (V3 — black/red supercar-tier, supersedes V2 graphite/ember)
- NO pure black (#000) or white (#fff). NO gold-on-black. NO purple/indigo. NO
  default Tailwind blue. NO neon, glow, or gradient-filled text. NO racing
  stripes, red glow, red-to-black gradients, checkered-flag motifs, or diagonal
  "speed line" backgrounds.
- Use these EXACT values (Mansory/Gintani/Ferrari-tier, not "detailing-shop
  cliché"): black #0A0A0B (near-black stage, a hair of warmth) · black-raised
  #141416 (cards/surfaces) · paper (light sections only) #F2F0EC · ink #F5F3EF ·
  muted #8A8A8D · line #2B2B2E · ACCENT red #C81E2C (brake-calliper red, not
  neon) · red-deep #7A1119 (pressed/hover states).
- RESTRAINT is the signal, tightened from V2: red covers <4% of any screen — one
  CTA fill, one active nav state, one hairline rule, one detail per hero (a
  calliper, a stitch line, a single word). Never a red background band, never
  red body text, never a red gradient. Black does the heavy lifting; red is
  punctuation. Metal, matte paint, and real vehicle photography carry the page —
  not colour blocks.

### Type — the #2 tell
- Load Fontshare via a `<link>` in `<head>`.
- display = "General Sans" (weight 600, tracking -0.02em) · text = "Satoshi" ·
  mono labels (specs, VIN-style tags) = "JetBrains Mono".
- BANNED as display: Inter, Poppins, Montserrat, Roboto, any default system stack.
- Display: clamp(2.25rem→6.5rem), line-height 0.98. Text 1.0625rem / lh 1.6. Mono
  label 0.7rem, uppercase, tracking 0.08em.
- Headlines are short, declarative, spec-sheet confident ("Wrapped in Houston.
  Built for Tesla.") — never marketing fluff.

### Layout — the "max-width mx-auto" tell
- FORBIDDEN: one global `max-w-7xl mx-auto` wrapping every section; symmetric
  3-up everything as the default. EXCEPTION (V4 — bugatti.com reference,
  explicit client direction): the hero and the Tesla Hub cinematic band are
  intentionally centered, matching the reference site's own hero/section
  treatment — this is a deliberate quote of a real premium-automotive UI, not
  a generic centered-hero default. Every other section keeps its own
  asymmetric width.
- Define `--gutter: clamp(1.25rem,4vw,4rem)`. 12-col grid; sections pick their
  own width — some FULL-BLEED edge-to-edge (hero, gallery, sur-mesure image),
  some inset (7/5, 8/4, col-start-9). Uneven vertical rhythm. Generous space on
  one side, never both, outside the two centered exceptions above.

### Hover & micro-interaction — the "scale-105" tell
- FORBIDDEN: hover:scale-105, hover:opacity-80, generic shadow-lift.
- Links: underline draws left→right (::after scaleX 0→1), 0.4s.
- Buttons: fill sweeps up from the bottom on hover, no scale. Primary CTA
  ("Get a Quote") is magnetic (gsap.quickTo, leans toward cursor).
- Gallery cards: overflow-hidden, inner image scales to 1.06 only (never the card
  itself), a mono spec tag (wrap colour / service / vehicle) clip-reveals from the
  bottom edge on hover.
- Easing everywhere: cubic-bezier(0.22,1,0.36,1).

### Corners & surfaces
- ONE radius system: media/cards 12px · inputs 8px · buttons full pill. Never
  random radii. NO glassmorphism / backdrop-blur cards — use a 1px `line` hairline
  instead, or a subtle inset shadow on `surface`.

### Imagery — the "mismatched stock" tell
- Every build photo shares ONE grade so shop photos + any stock cohere. V3
  retunes this against the near-black stage (higher contrast, cooler warmth):
  `filter: contrast(1.09) brightness(0.96) saturate(1.02)` + a 4% black overlay
  + fine film grain. Consistent aspect system (4:5 portrait for gallery cards, 16:9
  for video/hero, 4:3 for detail shots). Hero and section-break imagery crop
  tighter and bleed further off frame (Mansory/Gintani framing) rather than
  sitting centered inside a padded container. Real garage / studio lighting, not
  daylight-lifestyle stock — this is a shop, not a coffee brand.
- Every completed-build image gets a small mono caption: vehicle, wrap colour /
  service, year — treated like a spec tag, not a text overlay.

### Forbidden AI clichés (auto-fail if any appear)
emoji icons · lucide icon soup · "AI-Powered" badges/pills · glass cards ·
dot-grid backgrounds · fake 5-logo trust row · bento-for-bento's-sake · purple ·
gold-on-black · stock photos of random smiling people. "Centered everything" is
still forbidden as a default — the hero and Tesla Hub band are the sole,
deliberate exceptions (see Layout law above).

## STACK
Next.js 15 App Router · React 19 · TypeScript strict · Tailwind CSS v4 (@theme
tokens in globals.css) · Lenis (smooth scroll) · GSAP + ScrollTrigger · Fontshare
via `<link>`. No Framer Motion. Sanity or a simple JSON/MDX content layer for the
gallery (build entries need to be addable without a redeploy — flag this decision
to the client). Runs with `npm i && npm run dev`.

## STRUCTURE (clean + downloadable)
`app/` — one route per core page (see below) · `app/globals.css` = tokens + media
primitives + grain · `components/` one file per section · `components/ui`
(SmoothScroll, MagneticButton, RevealLines, Reveal, FilterBar, QuoteWizard,
ChatWidget) · `lib/gsap.ts` · `lib/site.ts` = all static copy · `lib/builds.ts` =
gallery data shape (see Gallery section) · `content/builds/*.json` = per-vehicle
entries (Phase 1 seed data + easy Phase 2 migration to a DB).

## MOTION ENGINE
- SmoothScroll: `new Lenis({lerp:0.09})`, bridged to `lenis.on('scroll',
  ScrollTrigger.update)`; fully disabled under `prefers-reduced-motion`.
- RevealLines: authored lines, each in an overflow-hidden mask, yPercent 112→0,
  stagger 0.09 (hero on load, sections on scroll-in).
- Gate every GSAP/Lenis call behind `prefers-reduced-motion`: fallback = no smooth
  scroll, no pin, no parallax, images render ungraded-but-fine, no horizontal track.

## CORE PAGES
`/` Home · `/about` · `/contact` · `/services/vehicle-wraps` · `/services/ceramic-
tint` · `/services/paint-protection-film` · `/services/starlight-headliners` ·
`/services/wheels-tires` · `/gallery` (+ `/gallery/[slug]` per build) ·
`/financing` · `/tesla` (Tesla Hub) · `/quote` (Quote Builder, can also open as an
overlay from any page's CTA).

Each `/services/*` page is a full SEO landing page (see SEO section) — not a tab,
a real indexable route with its own hero, process, before/after, FAQ, and CTA.

## HOMEPAGE SECTIONS (V4 — bugatti.com reference; each: layout · scroll · hover · image)
1. **Nav** — thin, transparent over the hero, solidifies (bg-black/95 + hairline)
   past 40px scroll. Left: hamburger + "Menu" opens a full-screen overlay (not a
   hover mega-panel). Center: wordmark "IQBALLAZ" (mono "CUSTOMS" subscript).
   Right: plain "Get a Quote" text link. Overlay: paper panel sliding in from
   the left with grouped links ("What we do" pinning Tesla Hub bold+red, "The
   shop", "Get started"), plus two stacked visual cards on wide screens
   (`lib/site.ts` → `menu`).
2. **Hero** — full-bleed graded image, slow parallax. Centered content stack:
   mono cue → RevealLines headline ("Wrapped in Houston." / "Built for
   Tesla.") → mono trust line → red-outline pill CTA ("Get a Quote") → ghost
   underline link ("See the work"). Thin hairline rule closes the section.
3. **Tesla Hub band** — full-bleed cinematic section (72svh), centered: mono
   eyebrow, large italic display headline, short caption, underline link into
   `/tesla`. Same treatment as the hero, shorter.
4. **Iqballaz Customs trio** — three equal columns (About / The work /
   Financing), caption sits BELOW each image (not overlaid), plain "Learn
   more" link underneath. No hover-scale text reveal here.
5. **Reviews** — centered italic pull-quote band, one review at a time, thin
   progress rules (not dots) that fill on the active review, star rating in
   mono type.
6. **Our Services** — boxed dark (`black-raised`) 2-col poster grid: mono
   tagline top, big italic display service name bottom, film-brand mono tag
   top-right, "Learn more" clip-reveals on hover. Odd item spans full width.
7. **Gallery preview** — horizontal-scroll strip (pinned track, scrubbed
   sideways) of recent builds; each card: image, mono spec tag, hover reveals
   a "View build" underline-draw link. Falls back to a vertical stack under
   768px (matchMedia, no pin).
8. **Current Promotions** — sur-mesure-style split: large image left, dark
   copy panel right (mono red eyebrow, headline, CTA fill), thin decorative
   red-on-line progress rule under the block. This is the one place red gets
   real weight, and only here.
9. **On Instagram** — live grid pulled from @iqballazcustoms via the Graph API
   (fixed 3-col squares, not masonry), decorative dot row per 3-tile block,
   "Load more posts" reveal. Graded to match the site's photo treatment.
10. **Footer** — address, phone, hours, service links, company links,
    Instagram/Facebook, credits row, hairline top. Oversized wordmark bleeds
    off the bottom edge.

Dropped from the homepage in V4 (component files kept, just unused here — see
`components/sections/CtaBand.tsx` and `FinancingTeaser.tsx`): the standalone
financing teaser and closing CTA band. Bugatti's reference has no closing CTA
band on the homepage — the floating chat launcher (bottom-right) plus the
repeated CTAs in the hero, Tesla band, services grid, and promo panel cover
that job; `/financing` and `/quote` are still linked from the trio, footer, and
overlay menu.

## GALLERY / COMPLETED BUILDS (flagship feature — build this properly)
- `/gallery` — filter bar (mono pill buttons, not colourful chips) by make
  (Tesla, BMW, Mercedes...), by service (Wraps, Tint, PPF, Starlights, Wheels),
  combinable filters, URL-synced (`?make=tesla&service=wraps`) so filtered views
  are shareable and indexable.
- Grid: masonry 4:5 / 4:3 mixed, NOT a uniform bento. Hover per the interaction
  law. Lazy-load with a graded low-res placeholder (no generic skeleton shimmer).
- `/gallery/[slug]` per-vehicle page: photo/video gallery, services performed
  (mono spec list), wrap colour + finish, vehicle year/make/model, before/after
  slider if available, related builds strip, CTA to request the same build.
- Data shape (drives both the grid and the detail page):
  ```
  { slug, make, model, year, services: string[], wrapColor?, finish?,
    media: {type:'image'|'video', src, alt}[], summary, featured: boolean,
    date }
  ```
- Architected so Phase 2 (Customer Vehicle Passport) can attach a `customerId`
  and pull the same build record into a private profile view — don't build a
  throwaway gallery schema, build the passport schema now and only expose the
  public fields today.

## QUOTE BUILDER (replaces the basic contact form)
Multi-step, one thing at a time, progress rule at top (mono step counter, not
dots): (1) Vehicle — year/make/model, VIN optional (2) Service(s) — multi-select
cards, not checkboxes, images per service (3) Details — colour/finish
preference, timeline (4) Photos — drag-drop upload, optional (5) Contact — name,
phone, email, preferred contact method (6) Review + submit. Autosaves to
localStorage-equivalent state so a refresh doesn't lose progress. Submits to a
lead endpoint that also feeds the AI Chat Assistant's handoff data (shared lead
schema — don't build two separate contact pipelines).

## AI CHAT ASSISTANT
Persistent, unobtrusive launcher (mono label, not a bubble-with-emoji). Scoped
system prompt covering: services offered, pricing ranges (not exact quotes),
financing basics, hours/location/booking link, wrap/tint/PPF FAQ. Collects name +
phone + interest before handoff; hands off to a real human via the same lead
schema as the Quote Builder — do not build a separate lead table. Clearly states
it's an assistant, not a team member, on first message.

## TESLA HUB (`/tesla`)
Dedicated landing page, not just a gallery filter: hero with Tesla-specific
headline, "Why Tesla owners choose us" (PPF for panel gaps, tint for battery
range/heat, wrap options specific to Model 3/Y/S/X), filtered gallery embed
(make=tesla), Tesla-specific FAQ, CTA into the Quote Builder pre-filled with
Tesla as the vehicle make. This page carries real SEO weight — target "Tesla
Wrap Houston" specifically (see SEO).

## CUSTOMER VEHICLE PASSPORT (Phase 2 — architecture only, don't build the UI)
Data model to reserve now: `Customer {id, name, phone, email}`,
`Vehicle {id, customerId, make, model, year, vin?}`,
`ServiceRecord {id, vehicleId, service, date, warrantyExpires?, invoiceUrl?,
buildSlug?}`. The public gallery's per-build data should be a strict subset of
`ServiceRecord` so Phase 2 is additive, not a rebuild. Flag this to the client
explicitly in the report — it's the one place under-building now costs the most
later.

## SEO
Every `/services/*` page independently optimized: unique title/meta, H1 targeting
the Houston + service pair ("Ceramic Tint Houston", "Tesla Wrap Houston", "PPF
Houston", "Vehicle Wraps Houston"), local business schema (JSON-LD:
LocalBusiness + AutoRepair, address/hours/phone from the current site), FAQ
schema on each service page, `/gallery/[slug]` pages get Vehicle/Product-style
schema where applicable. Sitemap + robots configured. No shared boilerplate copy
across service pages — each needs genuinely distinct content, not a template
with the service name swapped in.

## RESPONSIVE (mobile-first — build 360 first)
Breakpoints 480/768/1024/1280. Asymmetric grids collapse to one column but keep
the offset feel. Gallery masonry becomes single-column. Horizontal-scroll
sections (Gallery preview) become vertical stacks under 768px via matchMedia —
no pin. Quote Builder steps are already single-column by design. `overflow-x:
clip` on root; no horizontal scrollbar at any breakpoint.

## ACCEPTANCE — report each + the ANTI-AI CHECKLIST
1. `npm run build` + `tsc --noEmit` clean; zero runtime errors.
2. All core pages present and route correctly; gallery filters URL-sync.
3. Quote Builder and Chat Assistant write to a shared lead schema.
4. `prefers-reduced-motion` → fully static and legible, no pin/parallax/horizontal
   scroll tracks.
5. No horizontal scroll at 360/768/1024/1280.

ANTI-AI CHECKLIST (all must be TRUE):
☐ no pure #000/#fff ☐ accent (red) <4% of any screen ☐ no red gradients, glow,
neon, racing stripes, or checkered-flag motifs ☐ General Sans + Satoshi +
JetBrains Mono loaded, no Inter/Poppins/Montserrat ☐ no global max-width
wrapper; layout asymmetric ☐ hovers are draw/sweep/mask, never scale-105 ☐ one
consistent radius system ☐ all gallery/build images share one grade + grain
(retuned for the black stage) ☐ no emoji / lucide icon soup ☐ no fake
trust-logo row ☐ Instagram and Reviews are live-pulled, not static mockups ☐
copy is specific and understated, no hype language, no "unleash"/"dominate"/
"beast mode" tuner-shop cliché copy.

Build section by section, keep typecheck green, finish with the file tree, the
Vehicle Passport data model, and the filled anti-AI checklist.