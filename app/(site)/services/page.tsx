import type { Metadata } from "next";
import Image from "next/image";
import ServiceShowcase, { type ShowcaseItem } from "@/components/ui/ServiceShowcase";
import IconFeatureRow from "@/components/ui/IconFeatureRow";
import MagneticButton from "@/components/ui/MagneticButton";
import BrandsBand from "@/components/sections/BrandsBand";
import Process from "@/components/sections/Process";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import {
  DiamondIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  HandshakeIcon,
  CalendarIcon,
  StarIcon,
} from "@/components/ui/icons";
import AdditionalServices from "@/components/sections/AdditionalServices";
import TireQuoteForm from "@/components/ui/TireQuoteForm";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Wraps, ceramic tint, paint protection film, starlight headliners, and wheels at Iqballaz Customs in Houston.",
};

const HERO_TRUST = [
  { icon: <DiamondIcon />, title: "Premium materials", body: "Only the best brands go on your vehicle." },
  { icon: <ShieldCheckIcon />, title: "Expert installers", body: "Trained, certified, experienced." },
  { icon: <CheckCircleIcon />, title: "Attention to detail", body: "No shortcuts, ever." },
  { icon: <HandshakeIcon />, title: "Customer first", body: "Your vision, our priority." },
];

const WHY = [
  { icon: <CalendarIcon />, title: "Appointment only", body: "Dedicated time, zero rush." },
  { icon: <DiamondIcon />, title: "Quality over quantity", body: "Every vehicle gets our full attention." },
  { icon: <ShieldCheckIcon />, title: "Industry-leading brands", body: "We use only proven materials." },
  { icon: <HandshakeIcon />, title: "Expert craftsmanship", body: "Skilled installers, flawless results." },
  { icon: <StarIcon />, title: "Satisfaction guaranteed", body: "We're not done until you are." },
];

/**
 * Every card carries a starting price instead of a description (client note) —
 * the numeral gets the `.money` accent. `null` means the price genuinely varies
 * and gets the "Price varies" treatment instead of a figure.
 */
const PRICE: Record<string, string | null> = {
  "vehicle-wraps": "$2799",
  "paint-protection-film": "$3499",
  "ceramic-tint": "$349",
  "starlight-headliners": null,
};

/**
 * Card order and titles for this index. Wheels & Tires drops off the grid
 * (client note) — the route stays live and is reached from the Additional
 * Services block below. Accessories sits last.
 */
const ORDER = [
  "vehicle-wraps",
  "paint-protection-film",
  "ceramic-tint",
  "starlight-headliners",
];

const TITLE_OVERRIDE: Record<string, string> = {
  "starlight-headliners": "Accessories",
};

function priceCaption(slug: string) {
  const price = PRICE[slug];
  if (price === null) {
    return (
      <>
        Price <span className="money">varies</span>
      </>
    );
  }
  if (!price) return undefined;
  return (
    <>
      Starts at <span className="money">{price}</span>+
    </>
  );
}

export default function ServicesIndexPage() {
  const bySlug = new Map(services.map((s) => [s.slug, s]));

  const items: ShowcaseItem[] = [
    {
      href: "/tesla",
      title: "Services",
      image: "/client/services-card.webp",
      alt: "Cadillac Escalade wrapped in satin black outside the Houston shop",
      caption: (
        <>
          Starts at <span className="money">$2799</span>+
        </>
      ),
    },
    ...ORDER.flatMap((slug) => {
      const s = bySlug.get(slug);
      if (!s) return [];
      return [
        {
          href: s.href,
          title: TITLE_OVERRIDE[slug] ?? s.title,
          image: s.image,
          alt: s.title,
          caption: priceCaption(slug),
          // Accessories closes the grid (client note) — spanning both columns
          // is what actually puts it last, since the masonry balances by height.
          span: slug === ORDER[ORDER.length - 1],
        },
      ];
    }),
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/gallery/rolls-royce-wraith-blue-1.webp"
            alt="Rolls-Royce Wraith finished in a Cobalt Blue wrap"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="graded object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent" />
        </div>
        <div className="relative z-10 pt-28 pb-16" style={{ paddingInline: "var(--gutter)" }}>
          <p className="mono-label text-red">Iqballaz Customs</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 max-w-2xl text-ink"
            lines={["Precision. Protection. Perfection."]}
          />
          <p className="mt-5 max-w-xl text-cream">
            From custom wraps to paint protection, every build is delivered with the same
            materials and the same standard of care.
          </p>
          <div className="mt-8">
            <MagneticButton href="#services" variant="primary">
              Explore our services
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Hero trust row */}
      <section className="border-b border-line py-14" style={{ paddingInline: "var(--gutter)" }}>
        <IconFeatureRow items={HERO_TRUST} columns={4} />
      </section>

      {/* Services grid */}
      <section id="services" className="scroll-mt-24 py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="mono-label">Our services</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={["Complete customization. Every detail covered."]}
              className="display mt-4 max-w-xl text-3xl text-ink sm:text-4xl"
            />
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-cream/80">
              Every build starts with the same shop, the same hands, and the same film
              brands, picked below by what you&apos;re here for.
            </p>
          </Reveal>
        </div>

        <div className="mt-12">
          <ServiceShowcase items={items} />
        </div>
      </section>

      {/* Everything else the shop handles */}
      <AdditionalServices />

      {/* Why choose Iqballaz */}
      <section className="border-y border-line bg-black-raised py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label">Why choose Iqballaz?</p>
        </Reveal>
        <RevealLines
          as="h2"
          lines={["Built different. For owners who expect more."]}
          className="display mt-4 max-w-2xl text-3xl text-ink sm:text-4xl"
        />
        <div className="mt-12">
          <IconFeatureRow items={WHY} columns={5} />
        </div>
      </section>

      {/* Brands */}
      <BrandsBand />

      {/* Process */}
      <Process />

      {/* Tire recommendation capture */}
      <TireQuoteForm />

      {/* Closing CTA */}
      <section className="bg-burgundy py-24 md:py-32" style={{ paddingInline: "var(--gutter)" }}>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <RevealLines
            as="h2"
            lines={["Your vehicle. Your vision. Our expertise."]}
            className="display text-3xl text-ink sm:text-4xl md:text-5xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-4 text-cream">
              Book an appointment today and let&apos;s build something extraordinary.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-8">
            <MagneticButton href="/quote" variant="paper">
              Book Appointment
            </MagneticButton>
          </Reveal>
        </div>
      </section>
    </>
  );
}
