# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Houston-area owners of Tesla and other premium/performance vehicles (BMW, Mercedes, and similar) evaluating or booking vehicle customization work — vinyl wrap, ceramic tint, PPF, wheels/tires, chrome delete, caliper paint, starlight headliners. Secondary: returning customers who received an access code and want to check their vehicle's build history, warranties, and invoices.

## Product Purpose

A lead-generation and booking platform for Iqballaz Customs, a by-appointment vehicle customization shop in Houston. It replaces a generic single-page template with a multi-page site built to convert visitors into quote requests, and is being extended into a private per-vehicle "Vehicle Passport" system for returning customers.

## Positioning

Tesla-forward premium customization shop, not a generic tint/wrap/tuner shop — restrained, spec-sheet-confident presentation (deliberately anti-"tuner cliché") paired with real completed-build evidence. The Vehicle Passport, once live, would be a differentiator competitors don't offer: a private, per-vehicle service history (builds, warranties, invoices) tied to the same data model as the public gallery.

## Operating Context

- By appointment only: Mon–Fri 10–6, Sat by appointment, Sun closed.
- Core conversion path: browse services/gallery → multi-step Quote Builder (or AI chat assistant) → shared lead handoff.
- Gallery of completed builds, filterable by make and service, URL-synced.
- Dedicated Tesla Hub landing page carrying its own SEO weight.
- Instagram (@iqballazcustoms) and Facebook feed into homepage social proof.
- Vehicle Passport: access-code entry point for returning customers (see Capabilities).

## Capabilities and Constraints

- Services offered: vehicle wraps, ceramic tint, paint protection film (PPF), wheels/tires, starlight headliners, chrome delete, caliper paint, wheel powder coat.
- Quote Builder (multi-step) and the AI chat assistant share one lead schema — do not treat them as separate pipelines.
- Gallery data model doubles as the seed for per-vehicle Service Records (build/customer/vehicle/warranty/invoice), so the public and private (Passport) views stay architecturally one system.
- **Vehicle Passport is an internal prototype/demo only** — not yet a live, customer-facing capability. Seeded records under `content/` (e.g. the Marcus Delgado customer, Model 3 / Cybertruck vehicles, service records, warranties, invoices) are development fixtures, not real customer data. Treat any copy or flow implying this is production-ready as aspirational, not shipped.
- Homepage trust line ("EST. 2015 — 500+ VEHICLES WRAPPED IN HOUSTON") is an **unconfirmed placeholder** — left undecided. Do not present these figures as verified facts in new work; do not invent a replacement number either.
- Film/product brands referenced per service (Avery Dennison for wraps, XPEL for PPF, 3M for tint) are **unconfirmed placeholders** pending client sign-off. Do not rely on them as verified facts.
- `prefers-reduced-motion` must fully disable smooth-scroll, pin, and parallax effects site-wide — this is a hard technical constraint already implemented, not a nice-to-have.
- Every `/services/*` page and `/gallery/[slug]` page must remain an independently indexable SEO landing page with distinct content — no shared boilerplate copy across services.

## Brand Commitments

- Name: Iqballaz Customs. Wordmark: "IQBALLAZ" with mono "CUSTOMS" subscript.
- Tagline: "Wrapped in Houston. Built for Tesla."
- Address: 10950 Stancliff Rd, Houston, TX 77099. Phone: (832) 208-1071. Email: info@iqballazcustoms.com.
- Instagram: @iqballazcustoms. Facebook: facebook.com/iqballazcustoms.

## Evidence on Hand

- `build.md` at project root: a detailed historical build spec (visual laws, page-by-page plan, anti-AI checklist) used to build the current implementation. Treat it as a record of prior direction, not automatically as still-current product truth — visual-world decisions belong in DESIGN.md (see `/impeccable document`), not here.
- Real shop imagery under `public/` for services and gallery builds.
- Seeded Vehicle Passport fixtures under `content/{customers,vehicles,warranties,invoices,service-records,builds}` — development/demo data only (see Capabilities above), must not be presented as real customer records.
- No confirmed testimonials, press, or case studies beyond what's already coded into `app/data/testimonials.json`; do not fabricate additional proof.

## Product Principles

1. Restraint and specificity over tuner-shop hype — copy and visuals must read as evidence-backed and understated, never generic marketing fluff.
2. Tesla-forward, not Tesla-exclusive — the Tesla Hub earns its own dedicated page, but services and gallery must keep serving BMW/Mercedes/other premium vehicles.
3. Public marketing data and private customer data are one architecture — the gallery/build schema and the Vehicle Passport schema must stay a strict subset/superset pair, never fork into separate models.
4. Every service and build page functions as its own independent, fully indexable SEO landing page.
5. Motion serves credibility, not decoration, and is never allowed to override `prefers-reduced-motion`.

## Accessibility & Inclusion

`prefers-reduced-motion` is fully respected (disables smooth scroll, pin, and parallax). No other product-specific accessibility requirement has been established yet.
