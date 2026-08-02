import type { Metadata } from "next";
import Image from "next/image";
import IconFeatureRow from "@/components/ui/IconFeatureRow";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import ClipReveal from "@/components/ui/ClipReveal";
import {
  DiamondIcon,
  BulbIcon,
  UserIcon,
  HandshakeIcon,
  GlobeIcon,
  ShieldCheckIcon,
  WrenchIcon,
  StarIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Iqballaz Customs is a Houston vehicle customization shop for wraps, tint, PPF, wheels, and Tesla-specific builds, done by appointment with studio-lit precision.",
};

const VALUES = [
  { icon: <DiamondIcon />, title: "Excellence", body: "Uncompromising quality in every detail, on every build." },
  { icon: <BulbIcon />, title: "Craftsmanship", body: "Skilled hands, the right tools, and no shortcuts to get there." },
  { icon: <UserIcon />, title: "Individuality", body: "Every build reflects the vision of the owner behind it." },
  { icon: <HandshakeIcon />, title: "Trust", body: "Built on honesty, transparency, and relationships that last." },
  { icon: <GlobeIcon />, title: "Legacy", body: "Creating builds that hold up and leave a lasting impression." },
];

const PROMISE = [
  { icon: <ShieldCheckIcon />, title: "Premium materials", body: "Only proven film, coating, and finish brands go on your vehicle." },
  { icon: <WrenchIcon />, title: "Expert craftsmanship", body: "Trained hands, careful prep, and edges that finish clean." },
  { icon: <StarIcon />, title: "Customer first", body: "Your vision is the priority. We listen, advise, and deliver." },
  { icon: <CheckCircleIcon />, title: "Built to last", body: "From protection to finish, work that holds up over time." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/client/about-hero.webp"
            alt="Iqballaz Customs shop at dusk, a wrapped BMW M4 in the open bay"
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
          <p className="mono-label text-red">Our story</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 max-w-4xl text-ink"
            lines={["Every shop has a story."]}
          />
          <p className="mt-5 max-w-2xl text-cream">
            Ours is built on patience, precision, and a commitment to doing things
            the right way never the fast way.
          </p>
        </div>
      </section>

      {/* Vision split */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <ClipReveal className="media-frame relative aspect-[4/5]">
              <Image
                src="/client/about-vision.webp"
                alt="Satin silver Mercedes-AMG GT under the Houston skyline"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="graded object-cover"
              />
            </ClipReveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <p className="mono-label text-red">Our vision</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={["The benchmark, not the competition."]}
              className="display mt-4 text-3xl text-ink sm:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-lg text-cream/80">
                Our vision isn&apos;t simply to build exceptional vehicles, it&apos;s to
                redefine what customers expect from a customization studio.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What drives us */}
      <section className="border-y border-line py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label text-center">What drives us</p>
        </Reveal>
        <div className="mt-10">
          <IconFeatureRow items={VALUES} columns={5} />
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Reveal>
              <p className="mono-label text-red">Our mission</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={["Elevate every build.", "Exceed every expectation."]}
              className="display mt-4 text-3xl text-ink sm:text-4xl"
            />
          </div>
          <div className="md:col-span-5 md:col-start-8 md:self-end">
            <Reveal delay={0.15}>
              <p className="text-cream/80">
                Our mission is to deliver unmatched customization through skilled
                craftsmanship, premium materials, and a relentless commitment to
                getting the details right, build after build.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Aviation & marine — full-bleed blurred band */}
      <section className="relative flex h-[240px] items-center justify-center overflow-hidden border-y border-line md:h-[320px]">
        <Image
          src="/client/about-aviation.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="scale-110 object-cover blur-[6px]"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 text-center" style={{ paddingInline: "var(--gutter)" }}>
          <RevealLines
            as="h2"
            lines={["Skys the limit, so we wrapped it"]}
            className="display text-2xl text-ink sm:text-3xl md:text-4xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-4 text-cream">
              <span aria-hidden="true">⭐</span> We Wrap Private Jets, Aircraft &amp;
              Marine Vessels Too <span aria-hidden="true">⭐</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Our promise */}
      <section className="border-y border-line bg-black-raised py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label">Our promise</p>
        </Reveal>
        <div className="mt-10">
          <IconFeatureRow items={PROMISE} columns={4} />
        </div>
      </section>

      {/* The details */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <Reveal>
              <p className="mono-label text-red">The details</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={["Every edge.", "Every crevice."]}
              className="display mt-4 text-3xl text-ink sm:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-cream/80">
                The details most people never notice are the ones we refuse to
                overlook. Precision isn&apos;t optional, it&apos;s our standard.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <ClipReveal className="media-frame relative aspect-[4/5]">
              <Image
                src="/client/about-precision.webp"
                alt="BMW M3 in a matte rose wrap on the shop floor"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="graded object-cover"
              />
            </ClipReveal>
          </div>
        </div>
      </section>

      {/* Where we're headed */}
      <section className="border-y border-line bg-black-raised py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label text-red">Where we're headed</p>
        </Reveal>
        <RevealLines
          as="h2"
          lines={["The standard doesn't change. The reach does."]}
          className="display mt-4 max-w-2xl text-3xl text-ink sm:text-4xl"
        />
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
          <Reveal delay={0.1} className="border-t border-line pt-6">
            <p className="mono-label text-maroon">01</p>
            <h3 className="mt-3 font-display text-lg text-ink">Refine the craft</h3>
            <p className="mt-2 text-sm text-cream/80">
              Better tools, more training, tighter tolerances. The same studio-lit
              standard, sharpened build after build.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="border-t border-line pt-6">
            <p className="mono-label text-maroon">02</p>
            <h3 className="mt-3 font-display text-lg text-ink">Grow with Houston</h3>
            <p className="mt-2 text-sm text-cream/80">
              More owners, still by appointment. We&apos;d rather stay booked out than
              cut corners to keep up.
            </p>
          </Reveal>
          <Reveal delay={0.26} className="border-t border-line pt-6">
            <p className="mono-label text-maroon">03</p>
            <h3 className="mt-3 font-display text-lg text-ink">Protect more surfaces</h3>
            <p className="mt-2 text-sm text-cream/80">
              From daily drivers to the private jets and marine vessels we already
              wrap. One standard, wherever it&apos;s applied.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The shop */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <Reveal>
              <p className="mono-label text-red">The shop</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={["The Batcave."]}
              className="display mt-4 text-3xl text-ink sm:text-4xl"
            />
            <Reveal delay={0.05}>
              <p className="mt-4 font-display text-xl text-ink">Where all the magic happens.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-cream/80">
                Every great build starts here. Under bright lights, with experienced
                hands, and an obsession for the details most people never notice.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <ClipReveal className="media-frame relative aspect-[4/3]">
              <Image
                src="/client/about-batcave.webp"
                alt="The Iqballaz Customs shop floor with builds in progress"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="graded object-cover"
              />
            </ClipReveal>
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="bg-burgundy py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <RevealLines
          as="h2"
          lines={["Built with purpose. Finished with precision."]}
          className="display text-center text-2xl text-ink sm:text-3xl md:text-4xl"
        />
      </section>
    </>
  );
}
