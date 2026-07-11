/**
 * lib/servicePages.ts — distinct content per /services/* landing (build.md SEO).
 * NO shared boilerplate copy: each service has its own intro, process, and FAQs.
 * `facet` maps to the gallery service filter so each page pulls its own builds.
 */

export type ServiceFaq = { q: string; a: string };
export type ServiceStep = { title: string; body: string };

export type ServicePageContent = {
  slug: string;
  /** gallery service facet used to pull matching builds */
  facet: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  priceNote?: string;
  process: ServiceStep[];
  faqs: ServiceFaq[];
};

export const servicePages: Record<string, ServicePageContent> = {
  "vehicle-wraps": {
    slug: "vehicle-wraps",
    facet: "Wraps",
    metaTitle: "Vehicle Wraps Houston",
    metaDescription:
      "Full colour-change vinyl wraps in Houston — satin, gloss, and specialty finishes installed with wrapped edges and no lifting. Iqballaz Customs.",
    eyebrow: "Service · Wraps",
    h1: "Vehicle Wraps Houston.",
    intro:
      "A full wrap changes the colour of your car in cast vinyl — reversible, paint-protecting, and, done right, indistinguishable from a respray. We wrap edges rather than tuck them, so panels read as painted, not covered.",
    priceNote: "Full wraps from around $2,800, depending on vehicle size and film.",
    process: [
      { title: "Colour & film", body: "Pick a finish in person against your paint — satin, gloss, matte, colour-shift, or a chrome delete." },
      { title: "Prep & teardown", body: "Wash, decontaminate, and remove badges, handles, and trim so film wraps behind edges." },
      { title: "Precision install", body: "Cast vinyl laid panel by panel, relief-cut and post-heated so it stays down." },
      { title: "Heat & inspect", body: "Every edge sealed and the whole car checked under light before it leaves." },
    ],
    faqs: [
      { q: "How long does a wrap last?", a: "Quality cast vinyl lasts roughly 5–7 years with normal use and hand washing. Harsh sun and automatic brushes shorten that." },
      { q: "Will a wrap damage my paint?", a: "No — on factory paint in good condition it actually protects the surface, and it removes cleanly when you're ready for a change." },
      { q: "How long does the install take?", a: "A full wrap is typically 3–5 days. We don't rush edges; a good wrap is measured in how it's finished, not how fast." },
      { q: "Can you wrap a Cybertruck or stainless panels?", a: "Yes. Stainless is one of our regular jobs — we wrap Cybertrucks so cleanly people read it as paint." },
      { q: "Gloss, satin, or matte?", a: "Gloss reads like paint and cleans easiest; satin hides more and looks factory-custom; matte is the boldest and the most care-intensive." },
    ],
  },

  "ceramic-tint": {
    slug: "ceramic-tint",
    facet: "Tint",
    metaTitle: "Ceramic Tint Houston",
    metaDescription:
      "Ceramic window tint in Houston — rejects heat and UV, keeps the cabin cool, and won't fade purple or block signal. Iqballaz Customs.",
    eyebrow: "Service · Tint",
    h1: "Ceramic Tint Houston.",
    intro:
      "Ceramic film blocks infrared heat and UV without the signal interference of metallic tint or the purple fade of cheap dyed film. In a Houston summer that's a measurably cooler cabin and an interior that doesn't bake.",
    priceNote: "Tint from around $200, depending on coverage and film.",
    process: [
      { title: "Shade & VLT", body: "Choose a legal shade and heat-rejection level for each set of glass." },
      { title: "Computer-cut", body: "Patterns plotted to your exact vehicle so there's no blade near your glass." },
      { title: "Clean-room install", body: "Applied in a controlled bay to keep dust and fibres out from under the film." },
      { title: "Cure & care", body: "We hand off simple cure instructions so the film sets clear and even." },
    ],
    faqs: [
      { q: "How much heat does ceramic block?", a: "Good ceramic film rejects a large share of infrared heat — the difference you feel on your arm at a stoplight versus dyed film is obvious." },
      { q: "Is ceramic worth it over dyed tint?", a: "For Houston heat, yes. Dyed film darkens but does little for heat and fades over time; ceramic holds colour and rejects IR." },
      { q: "Will it turn purple?", a: "No. Purple fade is a hallmark of cheap dyed film. Ceramic keeps its colour." },
      { q: "What's legal in Texas?", a: "Texas allows 25% VLT on front side windows and any darkness below the AS-1 line on the windshield. We'll keep you legal and tell you the trade-offs." },
      { q: "When can I roll the windows down?", a: "Give the film 3–5 days to cure before lowering windows so the edges set fully." },
    ],
  },

  "paint-protection-film": {
    slug: "paint-protection-film",
    facet: "PPF",
    metaTitle: "PPF Houston — Paint Protection Film",
    metaDescription:
      "Self-healing paint protection film in Houston — shields against rock chips, swirl, and road rash in clear gloss or stealth satin. Iqballaz Customs.",
    eyebrow: "Service · PPF",
    h1: "PPF Houston.",
    intro:
      "Paint protection film is a clear urethane layer that takes the rock chips, sand, and swirl your paint otherwise would. It self-heals light marks with heat and comes in clear gloss or a satin 'stealth' finish that turns gloss paint matte.",
    priceNote: "Front packages and full-body coverage priced per vehicle.",
    process: [
      { title: "Decon & prep", body: "Paint washed, clayed, and prepped so film bonds to a clean surface." },
      { title: "Pattern or bulk", body: "Computer-cut patterns for most panels, hand-cut on the car where coverage needs to be seamless." },
      { title: "Wrapped edges", body: "Edges wrapped where possible so there's no visible film line catching dirt." },
      { title: "Final inspection", body: "Checked for lift and clarity under light before delivery." },
    ],
    faqs: [
      { q: "Does PPF really self-heal?", a: "Yes — light swirl and fine scratches vanish with heat from the sun or warm water. Deeper cuts are permanent, but they're in the film, not your paint." },
      { q: "How long does PPF last?", a: "Quality film carries a manufacturer warranty around 10 years against yellowing and cracking." },
      { q: "Full front or full body?", a: "A full front (bumper, hood, fenders, mirrors) covers where chips happen most. Full body protects everything and is popular on wraps and high-end paint." },
      { q: "Does modern PPF yellow?", a: "No. Current films are non-yellowing; the yellowing reputation comes from older material." },
      { q: "Can you put PPF over a wrap?", a: "Yes — a satin PPF over a gloss wrap, or clear PPF on high-wear areas of a wrap, is a common combination." },
    ],
  },

  "starlight-headliners": {
    slug: "starlight-headliners",
    facet: "Starlights",
    metaTitle: "Starlight Headliners Houston",
    metaDescription:
      "Fibre-optic starlight headliners in Houston — mapped constellations, dimmable, with optional shooting stars, cleanly integrated. Iqballaz Customs.",
    eyebrow: "Service · Starlights",
    h1: "Starlight Headliners Houston.",
    intro:
      "A starlight headliner threads hundreds of fibre-optic points through your headliner and drives them from a dimmable light source — a night sky overhead that switches off to a factory-clean finish by day.",
    priceNote: "Priced by star density and shooting-star options.",
    process: [
      { title: "Remove headliner", body: "The headliner comes out so fibres run behind it, never through visible trim." },
      { title: "Map the sky", body: "We lay out density and pattern — even scatter or a mapped constellation." },
      { title: "Thread & trim", body: "Each fibre set, trimmed flush, and heat-finished so points sit flat." },
      { title: "Reinstall & wire", body: "Headliner refitted and the light engine wired to a dimmer or app control." },
    ],
    faqs: [
      { q: "How many fibres go in?", a: "Anywhere from a few hundred for a subtle effect to a thousand-plus for a dense night sky — your call on density." },
      { q: "Can you add shooting stars?", a: "Yes — a meteor effect that streaks across the headliner is a popular add-on alongside the static field." },
      { q: "Does it damage the headliner?", a: "No. Fibres run behind the material and the light source is tucked out of sight; switched off, it looks factory." },
      { q: "Does it work in a Tesla?", a: "Yes — Model 3, Y, S, and X are common starlight jobs, glass roof or not." },
      { q: "How is it controlled?", a: "By a dimmer or a phone app depending on the light engine, so you set brightness and, on RGB engines, colour." },
    ],
  },

  "wheels-tires": {
    slug: "wheels-tires",
    facet: "Wheels",
    metaTitle: "Wheel Powder Coat & Refinishing Houston",
    metaDescription:
      "Wheel powder coating and refinishing in Houston — rust-resistant, weatherproof colour with proper mount and balance. Iqballaz Customs.",
    eyebrow: "Service · Wheels",
    h1: "Wheels & Tires Houston.",
    intro:
      "Powder coating bakes a durable, weatherproof finish onto your wheels that resists chips and curb rash far better than paint. Any colour, matte to gloss, on a wheel stripped and prepped properly first.",
    priceNote: "Powder coat from around $150 per wheel.",
    process: [
      { title: "Dismount & strip", body: "Tires off, wheels chemically stripped and blasted back to bare metal." },
      { title: "Prep & prime", body: "Cleaned, treated, and primed so the coat bonds and resists corrosion." },
      { title: "Powder & cure", body: "Colour applied and oven-cured to a hard, even finish." },
      { title: "Remount & balance", body: "Tires remounted, balanced, and TPMS checked before they go back on." },
    ],
    faqs: [
      { q: "Is powder coat tougher than paint?", a: "Yes — it's a baked-on finish that stands up to chips, chemicals, and weather far better than wheel paint." },
      { q: "What colours can I get?", a: "Effectively any — matte, satin, or gloss, plus candies and metallics. Bring a reference and we'll match the look." },
      { q: "What's the turnaround?", a: "Typically a few days per set, since stripping, coating, and curing each take time to do right." },
      { q: "Do you handle TPMS sensors?", a: "Yes — sensors are cared for during dismount and checked on reinstall." },
      { q: "Is it priced per wheel?", a: "Yes, per wheel, so a standard set of four is straightforward to quote." },
    ],
  },
};

export const getServicePage = (slug: string): ServicePageContent | undefined =>
  servicePages[slug];
