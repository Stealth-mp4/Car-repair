---
name: Iqballaz Customs — V5 (Mansory redesign)
description: Black, burgundy, and maroon automotive-atelier system with cream/white text, built for a Mansory-style centered-logo nav.
colors:
  black: "#0B0B0B"
  black-raised: "#171012"
  burgundy: "#38080E"
  maroon: "#5C0F16"
  red: "#E10600"
  cream: "#F5EFE5"
  white: "#FFFFFF"
  ash: "#8A8A8D"
  line: "#2B2320"
typography:
  display:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 7.5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  input: "8px"
  media: "12px"
  button: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.maroon}"
    textColor: "{colors.white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.black-raised}"
    textColor: "{colors.white}"
---

# Design System: Iqballaz Customs — V5 (Mansory Redesign)

## Overview

**Creative North Star: "The Atelier, Not the Tuner Shop"**

Iqballaz Customs V5 replaces the black/graphite-and-single-red-accent system (V3/V4, see `build.md`) with a warmer, richer black-burgundy-maroon world modeled on Mansory's own site: a centered wordmark commanding the nav, generous black stage, and a restrained but deliberate red used the way a calliper or a stitch line is used — as one detail, never a wash. The client's own color-scheme board names the register directly: black reads *power, elegance, authority*; maroon reads *strength, ambition, boldness*; burgundy reads *luxury, depth, sophistication*; red reads *passion, energy, confidence*; cream and white read *balance, warmth, refinement* and *purity, simplicity, clarity*. Every surface should earn at least one of those words.

This is a redesign, not a new product: the site's structure, motion engine (Lenis + GSAP + RevealLines + MagneticButton), type family (General Sans / Satoshi / JetBrains Mono), and mono-label "spec tag" device all carry forward from the incumbent system. What changes is the palette (burgundy/maroon now do real surface work, not just red), the nav (Mansory's split-links-center-logo layout, real logo mark instead of a text wordmark), and the addition of a splash/loading screen.

**Key Characteristics:**
- Near-black stage (#0B0B0B) with warm burgundy-tinted raised surfaces, never neutral gray-black.
- Red is still the rarest color on the page (calliper red, <4% of any screen) — burgundy and maroon absorb the "more color" mandate instead of red inflating.
- Cream and white are the only body/display text colors; no gray body text on dark surfaces.
- Nav: links split left/right, real logo mark dead center — Mansory's layout, Iqballaz's mark.
- A 2–3s black splash screen with the centered logo mark precedes first paint, once per session.

## Colors

Black does the heavy lifting; burgundy and maroon give it depth and warmth; red stays a single, deliberate flourish.

### Primary
- **Near-Black Stage** (`#0B0B0B`): the site's background on every dark section. A hair of warmth, never a pure `#000`.

### Secondary
- **Deep Burgundy** (`#38080E`): the system's new "weight" color — raised panels that need real presence (the promo/CTA split-panel, the footer's oversized wordmark plate, the Contact CTA band background). Replaces black-raised in any surface that should read as a deliberate accent, not a neutral card.
- **Maroon** (`#5C0F16`): secondary accent and the red button's pressed/hover state (`--color-red-deep` now resolves to maroon, not a darker red — one fewer near-duplicate token). Used for hover fills, active nav underlines, and small tag/pill borders that want warmth without spending the red.

### Tertiary
- **Caliper Red** (`#E10600`): the one saturated accent. Reserved for: the word "DIFFERENT" in the hero headline, the primary CTA fill, one active nav state, one hairline rule. Never a background wash, never body text, never a gradient.

### Neutral
- **Cream** (`#F5EFE5`): primary body-copy color on dark surfaces and the background of any light section. Warmer and more legible than the old flat off-white; this is the "make things stand out" text color the client asked for.
- **White** (`#FFFFFF`): display/headline text color and the brightest highlight (star-rating glyphs, the "BUILT" half of the hero headline, logo-adjacent chrome).
- **Ash** (`#8A8A8D`): tertiary/de-emphasized text only — captions, timestamps, footer copyright line. Never body copy.
- **Warm Line** (`#2B2320`): hairline dividers and borders. A burgundy-tinted near-black, not neutral gray, so hairlines read as part of the same warm world as the surfaces they divide.
- **Raised Stage** (`#171012`): the default card/media-placeholder surface — black warmed slightly toward burgundy, used where Deep Burgundy would be too heavy (service cards, gallery placeholders, nav overlay visual-card rail).

### Named Rules
**The Red Rarity Rule.** Red's screen coverage does not grow in V5 — burgundy and maroon absorb the client's "use more color" direction. If a section feels like it needs more red, reach for burgundy or maroon first.

**The No-Gray-Body Rule.** Body text on any dark surface is cream, not ash and not a mid-gray. Ash is reserved for genuinely tertiary information the reader can skip.

## Typography

**Display Font:** General Sans (weight 600, tracking -0.02em)
**Body Font:** Satoshi
**Label/Mono Font:** JetBrains Mono (spec-tag labels, uppercase, tracked)

**Character:** A confident, spec-sheet-literate sans pairing — General Sans carries oversized declarative headlines, Satoshi carries readable body copy, JetBrains Mono carries every "eyebrow"/tag/caption as a deliberate, singular device (not a decorative accident). Unchanged from the incumbent system; V5 does not touch type.

### Hierarchy
- **Display** (600, `clamp(2.5rem, 7vw, 7.5rem)`, line-height 0.98): hero and section headlines, always short and declarative.
- **Body** (400, 1.0625rem, line-height 1.6): all paragraph copy, cream on dark, ink-black on light.
- **Label** (400, 0.7rem, tracked 0.08em, uppercase): the mono "spec tag" — section eyebrows, image captions, nav sub-label, stat callouts.

### Named Rules
**The One Eyebrow Rule.** The mono-label device is the site's single recurring kicker. It is a system because it appears everywhere in the same voice — do not introduce a second, differently-styled label type.

## Layout

12-column grid, `--gutter: clamp(1.25rem, 4vw, 4rem)`. No global `max-w-* mx-auto` wrapper — each section picks its own width (full-bleed hero/cinematic bands, inset 7/5 or 8/4 splits elsewhere). The homepage reads as a sequence of distinct, single-purpose sections (Hero → Tesla Hub → About → Services → Featured Builds → Reviews → Social → Financing → Process → Contact CTA → Footer), each acting as a short teaser into its own dedicated page — never a repeated card-grid template back to back. Breakpoints: 480/768/1024/1280, mobile-first; asymmetric splits collapse to single column, never losing the offset feel entirely (stack order preserves visual hierarchy).

## Elevation & Depth

Flat by design — no drop shadows anywhere. Depth comes from tonal layering (Near-Black Stage vs. Raised Stage vs. Deep Burgundy) and from a single 1px Warm Line hairline, never a shadow or glow. A 4% black overlay + fine film grain sits over every graded photo instead of a shadow-based frame.

### Named Rules
**The Hairline-Not-Shadow Rule.** Where a card or panel needs separation from its background, use a Warm Line hairline or a Raised Stage / Deep Burgundy tonal shift — never `box-shadow`.

## Shapes

One radius system, unchanged from the incumbent build: media and cards at 12px, inputs at 8px, buttons at a full pill (9999px). No other radius values appear anywhere. No glassmorphism, no backdrop-blur cards.

## Components

### Buttons
- **Shape:** full pill (9999px radius).
- **Primary:** Caliper Red fill, white text; fill sweeps up from the bottom on hover (`btn-sweep`), sweeping to Maroon — never a scale transform.
- **Ghost/Outline:** Warm Line hairline border, white text; sweeps to Raised Stage on hover.
- **Paper:** Cream fill, near-black text — used only on dark-on-dark CTA bands that need an inverted pop (e.g. the Contact CTA band).

### Nav (signature component — Mansory layout)
- Thin, transparent over the hero; solidifies to `bg-black/95` + Warm Line hairline past 40px scroll.
- **Left:** primary link group (mirrors Mansory's left cluster).
- **Center:** the real IQBALLAZ logo mark (transparent PNG), not a text wordmark — the nav's signature move.
- **Right:** secondary link group plus the "Get a Quote" CTA.
- Hamburger/full-screen overlay menu is retained from the incumbent build for mobile and for the grouped mega-menu; the persistent left/right link clusters are new for desktop ≥1024px.

### Splash Screen (signature component, new)
- Pure Near-Black Stage background, the transparent logo mark centered, no spinner, no text.
- Fades in over ~400ms, holds, fades out over ~500ms into the homepage (~2.5s total).
- Runs once per browser session (sessionStorage flag), never re-triggers on client-side route changes.
- Skipped entirely under `prefers-reduced-motion` (logo shows statically for a beat, or the flow proceeds straight to content) and never blocks first paint of critical content beyond ~3s.

### Media frames / Cards
- **Corner style:** 12px radius, `overflow-hidden`.
- **Background:** Raised Stage placeholder (never a skeleton shimmer).
- **Border:** none; a 4% black overlay sits over the graded image instead.

### Inputs
- **Style:** Warm Line border, Raised Stage background, cream placeholder text.
- **Focus:** border shifts to Caliper Red.

## Do's and Don'ts

### Do:
- **Do** use Deep Burgundy and Maroon as real surface/accent colors — this is where the client's "use black, burgundy, and maroon more" direction lives.
- **Do** keep all body copy cream or white on dark surfaces; reserve Ash strictly for tertiary text.
- **Do** center the real logo mark in the nav on desktop, flanked by link clusters, per the Mansory reference.
- **Do** keep the mono-label eyebrow as the one recurring kicker device.

### Don't:
- **Don't** let red's screen coverage grow past the incumbent <4% ceiling — reach for burgundy/maroon instead.
- **Don't** reintroduce neutral gray-black surfaces (the old `#141416` black-raised); every raised surface is now warmed toward burgundy.
- **Don't** add drop shadows, glassmorphism, or glowing edges anywhere.
- **Don't** invent commercial claims (specific financing lender names, brand partner logos, review counts) that aren't confirmed in PRODUCT.md.
