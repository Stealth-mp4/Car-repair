import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import BuildCard from "@/components/ui/BuildCard";
import Faq, { type FaqItem } from "@/components/ui/Faq";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import { filterBuilds } from "@/lib/builds";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  // Targets "Tesla Wrap Houston" specifically (build.md SEO).
  title: "Tesla Wrap Houston | Wraps, Tint & PPF for Model 3/Y/S/X",
  description:
    "Tesla-specific wraps, ceramic tint, and paint protection film in Houston. PPF for panel gaps, tint for range and heat, colour-change for Model 3, Y, S, X and Cybertruck. Iqballaz Customs.",
};

const TESLA_FAQS: FaqItem[] = [
  {
    q: "Does a wrap or PPF void my Tesla warranty?",
    a: "No. A wrap or paint protection film sits on top of the factory paint and doesn't touch the mechanical, electrical, or battery warranty.",
  },
  {
    q: "Can you tint the glass roof?",
    a: "Yes. A ceramic tint across the panoramic roof cuts a large share of the overhead heat Model 3 and Y owners feel in summer.",
  },
  {
    q: "Will tint actually help my range?",
    a: "Indirectly. Less cabin heat means less air-conditioning load, and in Houston heat that shows up as better efficiency.",
  },
  {
    q: "Can you wrap a Cybertruck?",
    a: "Yes, regularly. Stainless is one of our specialties, and we wrap edges so there's no visible steel and it reads as a painted finish.",
  },
  {
    q: "Which finish suits a Model 3 or Y best?",
    a: "Satin and stealth finishes are the most popular and hide road grime well. We'll show you options against your own car before you commit.",
  },
  {
    q: "How long will my Tesla be with you?",
    a: "A full colour change is typically 3-5 days. Tint is a same-day job on most models, and a front PPF clip is usually one to two days.",
  },
  {
    q: "How much does a Tesla wrap cost in Houston?",
    a: "Full wraps start around $2,799 and move with the model, the film, and how much disassembly the panels need. A Model 3 in a standard satin sits at the lower end; a Model X or a Cybertruck in a specialty film sits higher.",
  },
  {
    q: "How do I wash a wrapped Tesla?",
    a: "Hand wash with a pH-neutral soap and two buckets. Skip automatic brushes, keep pressure washers off the edges, and dry with a soft towel. Treated that way, quality cast vinyl holds up for five to seven years.",
  },
];

/** Body copy for the long-form section. One heading, one or more paragraphs. */
const BODY: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Why Teslas get wrapped more than anything else on the road",
    paragraphs: [
      "Tesla sells a short palette. Outside of the occasional limited colour, a Houston parking lot is white, black, grey, blue, and red — and half of what's there is the same white as the car next to it. A vinyl wrap is the fastest, most reversible way out of that, and it's why colour change is the single most requested job we do on Model 3 and Model Y.",
      "There's a second reason, and it matters more than most owners expect. Tesla's factory paint is thin. It marks easily, it shows swirl under direct sun, and it chips on the low nose and the leading edge of the frunk faster than a comparable German car. A wrap puts a layer of cast vinyl between that paint and the road, so the surface underneath stays as it left Fremont. When you sell or trade in three years, the wrap comes off and the paint is still original.",
      "Reversibility is the part people underrate. A respray is permanent, it shows up on a vehicle history report, and it costs you at resale. A wrap is a decision you can undo in an afternoon.",
    ],
  },
  {
    heading: "Colour change: what actually gets installed on your car",
    paragraphs: [
      "We install cast vinyl, not calendared film. The difference isn't marketing — cast film is manufactured in a way that leaves it dimensionally stable, so it conforms to the compound curves on a Model Y hatch and a Model S rear quarter without fighting back and without shrinking off the edges six months later. Calendared film is cheaper and it is why a lot of budget wraps start lifting at the corners within a season.",
      "Panels come apart before film goes on. Badges, door handles, mirror caps, light trim, and where necessary the bumpers come off the car, so film wraps behind edges rather than stopping at them. A tucked edge collects dirt and gives water somewhere to start. A wrapped edge reads as paint from two feet away, which is the whole point.",
      "Finish is the fun part and the part worth seeing in person. Satin is the most popular choice on a Tesla and for good reason: it hides road film and light texture better than gloss and it photographs beautifully. Gloss reads closest to factory paint and is the easiest to keep clean. Matte is the boldest and the most demanding to live with. Colour-shift and specialty films land somewhere else entirely. Bring the car by and we'll lay swatches on your own panels under our lights and in daylight — screens lie about finishes.",
    ],
  },
  {
    heading: "Cybertruck: stainless is its own discipline",
    paragraphs: [
      "The Cybertruck is not a normal wrap job and shops that treat it like one produce visibly bad work. The panels are flat, unforgiving, and enormous, which means every squeegee mark and every speck of trapped dust has nowhere to hide. The edges are sharp enough to cut film during install. And bare stainless shows any adhesive residue instantly.",
      "We wrap Cybertrucks regularly and we wrap the edges rather than trimming to them, so there's no exposed steel line running down the vehicle. Done properly, the truck reads as painted — which, on a body panel that was never painted in the first place, is the highest compliment the job can get.",
    ],
  },
  {
    heading: "Ceramic tint: the Houston-specific argument",
    paragraphs: [
      "Every Tesla with a glass roof is a greenhouse in a Houston August. Model 3 and Model Y owners feel it on the top of their head at a stoplight; Model S and X owners feel it through the windshield. Ceramic film is the fix, and the reason we specify ceramic rather than dyed or metallic comes down to physics rather than preference.",
      "Dyed film darkens glass and does very little about heat. It also fades — that purple tint you see on ten-year-old cars is dyed film giving up. Metallic film rejects heat well but it is conductive, and on a car that runs its cellular, GPS, and key-card antennas through the glass, that's a real problem. Ceramic rejects a large share of infrared without touching signal and without fading.",
      "Texas law allows 25% VLT on the front side windows and any darkness below the AS-1 line on the windshield. We'll tell you exactly where the line is and what the trade-offs are on each set of glass rather than talking you into something that gets you pulled over. Film is computer-cut to your specific model, so no blade goes near your glass or your defroster lines, and it's installed in a controlled bay to keep fibres out from under the film.",
    ],
  },
  {
    heading: "Paint protection film: where it earns its money on a Tesla",
    paragraphs: [
      "PPF is a clear, self-healing urethane layer, and on a Tesla the case for it is concentrated in a few specific places. The low front bumper sits closer to the road than most cars and eats rock chips. The leading edge of the frunk catches everything the bumper misses. The rockers behind the front wheels take sand blasting from the tires. Those areas are where a front package pays for itself.",
      "A full front — bumper, hood, fenders, mirrors, and the A-pillar edges — covers the overwhelming majority of chip damage. Full-body coverage protects everything and is the usual choice on a car that's already wrapped or on high-end paint the owner intends to keep pristine. Light swirl and fine scratches in the film disappear with heat from the sun or a bucket of warm water; deeper marks stay, but they're in a replaceable layer rather than in your paint.",
      "PPF and a wrap are not an either/or. A satin PPF over factory gloss gives you the satin look with real impact protection. Clear PPF over the high-wear areas of a colour-change wrap protects the vinyl itself. Plenty of the cars in our gallery are running both.",
    ],
  },
  {
    heading: "How a build actually runs, start to finish",
    paragraphs: [
      "It starts with a conversation, not a checkout page. Tell us the model, what you're after, and how the car gets used — a daily-driven Model 3 that lives outside is a different specification than a weekend Model S in a garage. We'll give you a real number rather than a range that doubles when you arrive.",
      "The car comes in by appointment. It gets washed and decontaminated, because film bonds to a clean surface and nothing else. Panels come apart. Film goes on panel by panel, relief-cut and post-heated so it stays where it's put. Then every edge gets checked under light before the car goes back together.",
      "We work by appointment for a reason: one build at a time gets the bay, so nobody's Tesla is sitting half-wrapped while we squeeze in a walk-in. When it's done you get care instructions that actually matter — the first week of cure, what soap to use, and what to keep away from the edges.",
    ],
  },
];

export default function TeslaHubPage() {
  const teslas = filterBuilds({ make: "Tesla" });
  const quoteHref = "/quote?make=Tesla";

  return (
    <>
      {/* Hero — client-supplied cover image */}
      <section className="relative flex min-h-[80svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/client/tesla-wrap-cover.webp"
            alt="Wrapped vehicles under studio lighting in the Iqballaz Customs Houston shop"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="graded object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent" />
        </div>
        <div className="relative z-10 pb-16" style={{ paddingInline: "var(--gutter)" }}>
          <p className="mono-label text-red">Tesla Hub · Houston</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 text-ink"
            lines={["Tesla Wrap Houston.", "Dialed for Model 3/Y/S/X."]}
          />
          <p className="mt-6 max-w-xl text-cream">
            Colour-change wraps, ceramic tint, and paint protection film specified for
            Tesla — installed one car at a time, by appointment, in Houston.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href={quoteHref} variant="primary">
              Get a Tesla Quote
            </MagneticButton>
            <Link href="/gallery?make=tesla" className="link-underline text-ink">
              See Tesla builds
            </Link>
          </div>
        </div>
      </section>

      {/* Long-form body — two vehicle photos break it up, nothing more */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="mono-label text-red">The full picture</p>
          </Reveal>

          {BODY.map((block, i) => (
            <div key={block.heading}>
              <Reveal delay={0.05}>
                <h2
                  className={`font-display text-2xl font-semibold text-ink sm:text-3xl ${
                    i === 0 ? "mt-6" : "mt-14"
                  }`}
                >
                  {block.heading}
                </h2>
              </Reveal>
              {block.paragraphs.map((p, j) => (
                <Reveal key={j} delay={0.05}>
                  <p className="mt-5 text-cream/85">{p}</p>
                </Reveal>
              ))}

              {/* Photo after the second and fourth blocks, so the article
                  breathes without turning into a gallery. */}
              {i === 1 ? (
                <Reveal delay={0.1}>
                  <figure className="mt-12">
                    <div className="media-frame relative aspect-4/3 w-full">
                      <Image
                        src="/client/tesla-wrap-x5m.webp"
                        alt="BMW X5 M finished in satin black inside the Houston shop"
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="graded object-cover"
                      />
                    </div>
                    <figcaption className="mono-label mt-3">
                      Satin black, edges wrapped rather than tucked.
                    </figcaption>
                  </figure>
                </Reveal>
              ) : null}

              {i === 3 ? (
                <Reveal delay={0.1}>
                  <figure className="mt-12">
                    <div className="media-frame relative aspect-4/3 w-full">
                      <Image
                        src="/client/tesla-wrap-huracan.webp"
                        alt="Lamborghini Huracán in red with a carbon fibre hood, in the shop"
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="graded object-cover"
                      />
                    </div>
                    <figcaption className="mono-label mt-3">
                      Colour change over carbon — the same install standard, whatever the badge.
                    </figcaption>
                  </figure>
                </Reveal>
              ) : null}
            </div>
          ))}

          <Reveal delay={0.1}>
            <div className="mt-14 rounded-media border border-line bg-black-raised p-8">
              <h2 className="font-display text-2xl text-ink">Book your Tesla in</h2>
              <p className="mt-3 text-cream/80">
                Appointment only, one build at a time. Call{" "}
                <a href={business.phoneHref} className="link-underline text-ink">
                  {business.phone}
                </a>{" "}
                or send the details and we&apos;ll come back with a real number.
              </p>
              <div className="mt-7">
                <MagneticButton href={quoteHref} variant="primary">
                  Get a Tesla Quote
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tesla gallery embed (make=tesla) */}
      {teslas.length > 0 ? (
        <section className="pb-8" style={{ paddingInline: "var(--gutter)" }}>
          <div className="flex items-end justify-between gap-6">
            <RevealLines
              as="h2"
              lines={["Tesla builds."]}
              className="font-display text-4xl font-semibold text-ink"
            />
            <Link href="/gallery?make=tesla" className="link-underline text-sm text-muted">
              View all
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teslas.map((b, i) => (
              <BuildCard key={b.slug} build={b} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Tesla-specific FAQ + schema */}
      <Faq items={TESLA_FAQS} heading="Tesla questions" />

      {/* CTA band */}
      <section
        className="border-t border-line bg-black-raised py-24 md:py-28"
        style={{ paddingInline: "var(--gutter)" }}
      >
        <RevealLines
          as="h2"
          className="display max-w-4xl text-ink"
          lines={["Your Tesla,", "built right."]}
        />
        <div className="mt-10">
          <MagneticButton href={quoteHref} variant="paper">
            Book a Tesla appointment
          </MagneticButton>
        </div>
      </section>
    </>
  );
}
