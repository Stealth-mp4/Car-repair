/**
 * lib/servicePages.ts — distinct content per /services/* landing (build.md SEO).
 * NO shared boilerplate copy: each service has its own intro, process, and FAQs.
 * `facet` maps to the gallery service filter so each page pulls its own builds.
 */

import { services as siteServices } from "@/lib/site";

export type ServiceFaq = { q: string; a: string };
export type ServiceStep = { title: string; body: string };
/** A heading plus its paragraphs in the long-form body of a service page. */
export type ServiceSection = { heading: string; paragraphs: string[] };
export type ServiceImage = { src: string; alt: string; caption?: string };

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
  /**
   * Optional long-form body, for the pages the client wants reading like a real
   * article rather than a spec card. Rendered between the hero and the process
   * strip; pages without it are unchanged.
   */
  body?: ServiceSection[];
  /** Photos interleaved through `body` — kept few on purpose (client note). */
  images?: ServiceImage[];
  /** Full-bleed cover image; when set the hero renders as an image hero. */
  heroImage?: ServiceImage;
  /** Label above the long-form body, e.g. "The full picture". */
  bodyEyebrow?: string;
};

/** Film/product brand carried for this service, read from lib/site (single source). */
export const filmBrandFor = (slug: string): string | undefined =>
  siteServices.find((s) => s.slug === slug)?.filmBrand;

export const servicePages: Record<string, ServicePageContent> = {
  "vehicle-wraps": {
    slug: "vehicle-wraps",
    facet: "Wraps",
    metaTitle: "Vehicle Wraps Houston | Colour Change, Satin, Gloss & Specialty Film",
    metaDescription:
      "Full colour-change vinyl wraps in Houston: satin, gloss, matte, and specialty finishes installed with wrapped edges and no lifting. Iqballaz Customs.",
    eyebrow: "Wraps · Houston",
    h1: "Vehicle Wraps Houston.",
    intro:
      "A full wrap changes the colour of your car in cast vinyl. Reversible, paint-protecting, and, done right, indistinguishable from a respray. We wrap edges rather than tuck them, so panels read as painted, not covered.",
    priceNote: "Full wraps start at $2,799+, depending on vehicle size and film.",
    heroImage: {
      src: "/client/tesla-wrap-cover.webp",
      alt: "Wrapped vehicles under studio lighting in the Iqballaz Customs Houston shop",
    },
    bodyEyebrow: "The full picture",
    body: [
      {
        heading: "Why a wrap, and why not a respray",
        paragraphs: [
          "Factory colour palettes are short. A Houston parking lot is white, black, grey, and silver, and half of what's there is the same white as the car parked next to it. A vinyl wrap is the fastest and most reversible way out of that, which is why colour change is the single most requested job in the shop.",
          "There's a second reason, and it matters more than most owners expect. Modern factory paint is thin. It marks easily, shows swirl under direct sun, and chips on the low nose and the leading edge of the hood faster than owners think it should. A wrap puts a layer of cast vinyl between that paint and the road, so the surface underneath stays exactly as it left the factory. When you sell or trade in three years, the film comes off and the paint is still original.",
          "Reversibility is the part people underrate. A respray is permanent, it shows up on a vehicle history report, and it costs you at resale. A wrap is a decision you can undo in an afternoon.",
        ],
      },
      {
        heading: "Colour change: what actually gets installed on your car",
        paragraphs: [
          "We install cast vinyl, not calendared film. The difference isn't marketing — cast film is manufactured in a way that leaves it dimensionally stable, so it conforms to compound curves on a hatch or a rear quarter without fighting back and without shrinking off the edges six months later. Calendared film is cheaper, and it's why a lot of budget wraps start lifting at the corners within a season.",
          "Panels come apart before film goes on. Badges, door handles, mirror caps, light trim, and where necessary the bumpers come off the car, so film wraps behind edges rather than stopping at them. A tucked edge collects dirt and gives water somewhere to start. A wrapped edge reads as paint from two feet away, which is the whole point.",
          "Finish is the fun part and the part worth seeing in person. Satin is the most popular choice and for good reason: it hides road film and light texture better than gloss and it photographs beautifully. Gloss reads closest to factory paint and is the easiest to keep clean. Matte is the boldest and the most demanding to live with. Colour-shift, chrome, and specialty films land somewhere else entirely. Bring the car by and we'll lay swatches on your own panels under our lights and in daylight — screens lie about finishes.",
        ],
      },
      {
        heading: "Partial wraps, chrome delete, and accents",
        paragraphs: [
          "Not every job is a full colour change. A roof wrapped in gloss black, a chrome delete across the window trim and badges, a carbon-fibre hood or mirror caps — these are small jobs that change how a car reads far more than the price suggests, and they're a low-risk way to see how you like living with film.",
          "Partial work is held to the same install standard as a full wrap. The trim still comes off, the edges are still wrapped, and the film is still cast. The only thing smaller is the area, never the prep.",
          "Roof wraps in particular take the most sun of any panel on the car, so we specify film accordingly rather than using whatever is left on the roll.",
        ],
      },
      {
        heading: "Stainless, exotics, and the jobs most shops decline",
        paragraphs: [
          "A Cybertruck is not a normal wrap job, and shops that treat it like one produce visibly bad work. The panels are flat, unforgiving, and enormous, which means every squeegee mark and every speck of trapped dust has nowhere to hide. The edges are sharp enough to cut film during install, and bare stainless shows adhesive residue instantly. We wrap them regularly, and we wrap the edges rather than trimming to them, so there's no exposed steel line running down the vehicle.",
          "Exotics bring the opposite problem: deep curves, aggressive aero, active spoilers, and carbon panels that have to be treated as finished surfaces rather than substrates. Those cars get relief cuts planned before a single piece of film is laid, and they get post-heated properly so nothing pulls back off a curve a week later.",
          "The install standard doesn't move with the badge. A daily-driven sedan gets the same teardown, the same cast film, and the same edge work as the car in the gallery you recognised.",
        ],
      },
      {
        heading: "Wraps and paint protection film together",
        paragraphs: [
          "A wrap and PPF are not an either/or. Vinyl changes colour and shields paint from sun and light abrasion, but it isn't armour against rock chips at highway speed. Urethane PPF is — it's thicker, self-healing, and built to take impact.",
          "The common combinations: satin PPF over factory gloss gives you the satin look with real impact protection and no colour change at all. Clear PPF over the high-wear areas of a colour-change wrap — bumper, hood edge, rockers — protects the vinyl itself so the wrap ages evenly. Plenty of the cars in our gallery are running both.",
          "If you're deciding between them, tell us how the car is used. A garage-kept weekend car and a car that commutes I-10 daily deserve different specifications, and we'd rather say so up front than sell you coverage you don't need.",
        ],
      },
      {
        heading: "How a build actually runs, start to finish",
        paragraphs: [
          "It starts with a conversation, not a checkout page. Tell us the vehicle, what you're after, and how it gets used. We'll give you a real number rather than a range that doubles when you arrive.",
          "The car comes in by appointment. It gets washed and decontaminated, because film bonds to a clean surface and nothing else. Panels come apart. Film goes on panel by panel, relief-cut and post-heated so it stays where it's put. Then every edge gets checked under light before the car goes back together. A full wrap is typically three to five days.",
          "We work by appointment for a reason: one build at a time gets the bay, so nobody's car is sitting half-wrapped while we squeeze in a walk-in. When it's done you get care instructions that actually matter — the first week of cure, what soap to use, and what to keep away from the edges. Hand wash with a pH-neutral soap and two buckets, skip automatic brushes, and keep pressure washers off the seams. Treated that way, quality cast vinyl holds up for five to seven years.",
        ],
      },
    ],
    images: [
      {
        src: "/client/tesla-wrap-x5m.webp",
        alt: "BMW X5 M finished in satin black inside the Houston shop",
        caption: "Satin black, edges wrapped rather than tucked.",
      },
      {
        src: "/client/tesla-wrap-huracan.webp",
        alt: "Lamborghini Huracán in red with a carbon fibre hood, in the shop",
        caption: "Colour change over carbon — the same install standard, whatever the badge.",
      },
    ],
    process: [
      { title: "Colour & film", body: "Pick a finish in person against your paint: satin, gloss, matte, colour-shift, or a chrome delete." },
      { title: "Prep & teardown", body: "Wash, decontaminate, and remove badges, handles, and trim so film wraps behind edges." },
      { title: "Precision install", body: "Cast vinyl laid panel by panel, relief-cut and post-heated so it stays down." },
      { title: "Heat & inspect", body: "Every edge sealed and the whole car checked under light before it leaves." },
    ],
    faqs: [
      { q: "How long does a wrap last?", a: "Quality cast vinyl lasts roughly 5-7 years with normal use and hand washing. Harsh sun and automatic brushes shorten that." },
      { q: "Will a wrap damage my paint?", a: "No. On factory paint in good condition it actually protects the surface, and it removes cleanly when you're ready for a change." },
      { q: "How long does the install take?", a: "A full wrap is typically 3-5 days. We don't rush edges; a good wrap is measured in how it's finished, not how fast." },
      { q: "Can you wrap a Cybertruck or stainless panels?", a: "Yes. Stainless is one of our regular jobs. We wrap Cybertrucks so cleanly people read it as paint." },
      { q: "Gloss, satin, or matte?", a: "Gloss reads like paint and cleans easiest; satin hides more and looks factory-custom; matte is the boldest and the most care-intensive." },
    ],
  },

  "ceramic-tint": {
    slug: "ceramic-tint",
    facet: "Tint",
    metaTitle: "Ceramic Tint Houston",
    metaDescription:
      "Ceramic window tint in Houston. Rejects heat and UV, keeps the cabin cool, and won't fade purple or block signal. Iqballaz Customs.",
    eyebrow: "Service · Tint",
    h1: "Ceramic Tint Houston.",
    intro:
      "Ceramic film blocks infrared heat and UV without the signal interference of metallic tint or the purple fade of cheap dyed film. In a Houston summer that's a measurably cooler cabin and an interior that doesn't bake.",
    priceNote: "Ceramic tint starts at $349+, depending on coverage and film.",
    body: [
      {
        heading: "Why window tint is not optional in Houston",
        paragraphs: [
          "Houston sits at roughly 29 degrees north with humidity that turns a 95-degree afternoon into something closer to 105. A car parked outside for an hour reaches interior temperatures well past what's comfortable and well past what's good for the materials inside it. Tint is the cheapest intervention that actually changes that number.",
          "The effect compounds over years. Ultraviolet light is what cracks a dashboard, fades a leather seat from black to grey, and yellows the plastic on your interior trim. Quality film blocks essentially all of it. The car you sell in five years looks like a car that lived in a garage, because as far as its interior is concerned, it did.",
          "Then there's the part you notice on day one: the air conditioning stops fighting a losing battle. Less solar load through the glass means the cabin cools faster and holds temperature, which on an electric vehicle shows up directly as range you didn't spend on climate control.",
        ],
      },
      {
        heading: "Ceramic, dyed, and metallic — the difference that matters",
        paragraphs: [
          "Dyed film is the cheap option and it works by being dark. It blocks visible light, does very little about infrared heat, and it fades. The purple-tinted windows you see on older cars are dyed film at the end of its life. If the goal is privacy on a budget it does the job; if the goal is a cooler car, it mostly does not.",
          "Metallic film rejects heat properly by reflecting it, but it does so with a layer of metal particles in the film. On a modern car that runs cellular, GPS, satellite radio, tire-pressure sensors, and in many cases a key card or phone-as-key through the glass, a conductive layer across every window is a real and recurring problem.",
          "Ceramic film uses non-conductive ceramic particles instead. It rejects a large share of infrared heat without darkening the glass more than you want, without interfering with a single antenna, and without fading. It costs more than dyed film. It is the only one of the three we recommend, which is why it's the only one we install.",
        ],
      },
      {
        heading: "What's legal in Texas",
        paragraphs: [
          "Texas allows 25% VLT or lighter on the front side windows, meaning at least a quarter of visible light has to get through. Rear side windows and the back glass can go as dark as you like on most vehicles. The windshield can take film below the AS-1 line — the small marking near the top of the glass — or the top five inches if there's no AS-1 marking.",
          "A clear or very light ceramic film across the full windshield is legal in many configurations and is the single biggest heat improvement available on a car, because the windshield is the largest piece of glass pointed at the sun. We'll walk you through exactly what applies to your vehicle rather than talking you into a shade that gets you a ticket.",
          "Medical exemptions exist for drivers with documented photosensitivity. If that applies to you, bring the paperwork and we'll work to it.",
        ],
      },
      {
        heading: "How we install it",
        paragraphs: [
          "Film is computer-cut from a pattern for your exact year, make, and model. Nothing is cut on the car, which means no blade ever goes near your glass, your rubber seals, or the defroster lines printed on your rear window — the most common and most expensive damage a careless tint job causes.",
          "Glass is cleaned and scraped down to a genuinely clean surface first, because every speck of dust left behind becomes a permanent bump under the film. Installation happens in a controlled bay rather than an open lot, so airborne fibres aren't landing on wet adhesive.",
          "Old film gets removed properly when there is any — steamed off and the adhesive fully cleaned rather than scraped and covered over. Most tint jobs are a same-day service; a full car with a windshield takes longer.",
          "Afterwards the film needs three to five days to cure. Leave the windows up during that window. A little haze or a few small water pockets in the first days are normal and clear on their own as the moisture evaporates.",
        ],
      },
    ],
    images: [
      {
        src: "/client/ceramic-tint-card.webp",
        alt: "Range Rover with fresh ceramic tint in the Iqballaz Customs bay",
        caption: "Computer-cut patterns, installed in a controlled bay.",
      },
      {
        src: "/WINDOW_TINT.webp",
        alt: "Ceramic window tint film applied to vehicle glass",
        caption: "Ceramic rejects infrared without touching signal.",
      },
    ],
    process: [
      { title: "Shade & VLT", body: "Choose a legal shade and heat-rejection level for each set of glass." },
      { title: "Computer-cut", body: "Patterns plotted to your exact vehicle so there's no blade near your glass." },
      { title: "Clean-room install", body: "Applied in a controlled bay to keep dust and fibres out from under the film." },
      { title: "Cure & care", body: "We hand off simple cure instructions so the film sets clear and even." },
    ],
    faqs: [
      { q: "How much heat does ceramic block?", a: "Good ceramic film rejects a large share of infrared heat. The difference you feel on your arm at a stoplight versus dyed film is obvious." },
      { q: "Is ceramic worth it over dyed tint?", a: "For Houston heat, yes. Dyed film darkens but does little for heat and fades over time; ceramic holds colour and rejects IR." },
      { q: "Will it turn purple?", a: "No. Purple fade is a hallmark of cheap dyed film. Ceramic keeps its colour." },
      { q: "What's legal in Texas?", a: "Texas allows 25% VLT on front side windows and any darkness below the AS-1 line on the windshield. We'll keep you legal and tell you the trade-offs." },
      { q: "When can I roll the windows down?", a: "Give the film 3-5 days to cure before lowering windows so the edges set fully." },
    ],
  },

  "paint-protection-film": {
    slug: "paint-protection-film",
    facet: "PPF",
    metaTitle: "PPF Houston | Paint Protection Film",
    metaDescription:
      "Self-healing paint protection film in Houston. Shields against rock chips, swirl, and road rash in clear gloss or stealth satin. Iqballaz Customs.",
    eyebrow: "Service · PPF",
    h1: "PPF Houston.",
    intro:
      "Paint protection film is a clear urethane layer that takes the rock chips, sand, and swirl your paint otherwise would. It self-heals light marks with heat and comes in clear gloss or a satin 'stealth' finish that turns gloss paint matte.",
    priceNote: "PPF starts at $3,499+, by coverage and vehicle.",
    process: [
      { title: "Decon & prep", body: "Paint washed, clayed, and prepped so film bonds to a clean surface." },
      { title: "Pattern or bulk", body: "Computer-cut patterns for most panels, hand-cut on the car where coverage needs to be seamless." },
      { title: "Wrapped edges", body: "Edges wrapped where possible so there's no visible film line catching dirt." },
      { title: "Final inspection", body: "Checked for lift and clarity under light before delivery." },
    ],
    faqs: [
      { q: "Does PPF really self-heal?", a: "Yes, light swirl and fine scratches vanish with heat from the sun or warm water. Deeper cuts are permanent, but they're in the film, not your paint." },
      { q: "How long does PPF last?", a: "Quality film carries a manufacturer warranty around 10 years against yellowing and cracking." },
      { q: "Full front or full body?", a: "A full front (bumper, hood, fenders, mirrors) covers where chips happen most. Full body protects everything and is popular on wraps and high-end paint." },
      { q: "Does modern PPF yellow?", a: "No. Current films are non-yellowing; the yellowing reputation comes from older material." },
      { q: "Can you put PPF over a wrap?", a: "Yes, a satin PPF over a gloss wrap, or clear PPF on high-wear areas of a wrap, is a common combination." },
    ],
  },

  "starlight-headliners": {
    slug: "starlight-headliners",
    facet: "Starlights",
    metaTitle: "Starlight Headliners Houston",
    metaDescription:
      "Fibre-optic starlight headliners in Houston: mapped constellations, dimmable, with optional shooting stars, cleanly integrated. Iqballaz Customs.",
    eyebrow: "Service · Starlights",
    h1: "Starlight Headliners Houston.",
    intro:
      "A starlight headliner threads hundreds of fibre-optic points through your headliner and drives them from a dimmable light source, a night sky overhead that switches off to a factory-clean finish by day.",
    priceNote: "Priced by star density and shooting-star options.",
    process: [
      { title: "Remove headliner", body: "The headliner comes out so fibres run behind it, never through visible trim." },
      { title: "Map the sky", body: "We lay out density and pattern, either an even scatter or a mapped constellation." },
      { title: "Thread & trim", body: "Each fibre set, trimmed flush, and heat-finished so points sit flat." },
      { title: "Reinstall & wire", body: "Headliner refitted and the light engine wired to a dimmer or app control." },
    ],
    faqs: [
      { q: "How many fibres go in?", a: "Anywhere from a few hundred for a subtle effect to a thousand-plus for a dense night sky. Your call on density." },
      { q: "Can you add shooting stars?", a: "Yes, a meteor effect that streaks across the headliner is a popular add-on alongside the static field." },
      { q: "Does it damage the headliner?", a: "No. Fibres run behind the material and the light source is tucked out of sight; switched off, it looks factory." },
      { q: "Does it work in a Tesla?", a: "Yes, Model 3, Y, S, and X are common starlight jobs, glass roof or not." },
      { q: "How is it controlled?", a: "By a dimmer or a phone app depending on the light engine, so you set brightness and, on RGB engines, colour." },
    ],
  },

  "wheels-tires": {
    slug: "wheels-tires",
    facet: "Wheels",
    metaTitle: "Wheel Powder Coat & Refinishing Houston",
    metaDescription:
      "Wheel powder coating and refinishing in Houston. Rust-resistant, weatherproof colour with proper mount and balance. Iqballaz Customs.",
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
      { q: "Is powder coat tougher than paint?", a: "Yes, it's a baked-on finish that stands up to chips, chemicals, and weather far better than wheel paint." },
      { q: "What colours can I get?", a: "Effectively any: matte, satin, or gloss, plus candies and metallics. Bring a reference and we'll match the look." },
      { q: "What's the turnaround?", a: "Typically a few days per set, since stripping, coating, and curing each take time to do right." },
      { q: "Do you handle TPMS sensors?", a: "Yes, sensors are cared for during dismount and checked on reinstall." },
      { q: "Is it priced per wheel?", a: "Yes, per wheel, so a standard set of four is straightforward to quote." },
    ],
  },
};

export const getServicePage = (slug: string): ServicePageContent | undefined =>
  servicePages[slug];
