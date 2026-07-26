import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
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
import { business, hours } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Iqballaz Customs is a Houston vehicle customization shop — wraps, tint, PPF, wheels, and Tesla-specific builds, done by appointment with studio-lit precision.",
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
  { icon: <StarIcon />, title: "Customer first", body: "Your vision is the priority — we listen, advise, and deliver." },
  { icon: <CheckCircleIcon />, title: "Built to last", body: "From protection to finish, work that holds up over time." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cover.webp"
            alt="Iqballaz Customs storefront at dusk"
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
          <p className="mono-label text-red">Our vision</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 max-w-4xl text-ink"
            lines={["Redefining excellence.", <span key="built" className="text-red">Built different.</span>]}
          />
          <p className="mt-5 max-w-2xl text-cream">
            Iqballaz Customs sees customization as more than modification — it&apos;s an
            expression of individuality, crafted with precision and built to last.
          </p>
        </div>
      </section>

      {/* Vision split */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <ClipReveal className="media-frame relative aspect-[4/5]">
              <Image
                src="/DSC_4436.webp"
                alt="Tesla Cybertruck rear detail, satin black wrap"
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
              lines={["To be Houston's most trusted name in vehicle customization."]}
              className="display mt-4 text-3xl text-ink sm:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-lg text-cream/80">
                We don&apos;t chase trends. Our vision is to lead on craftsmanship and
                customer experience — one car at a time, under studio light, until the
                standard is the same on every build: it should read as paint.
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
                getting the details right — build after build.
              </p>
            </Reveal>
          </div>
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

      {/* Beyond cars */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <p className="mono-label text-red">Beyond cars</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={["One standard.", "Limitless surfaces."]}
              className="display mt-4 text-3xl text-ink sm:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-cream/80">
                Our precision extends beyond the road — we wrap private jets, aircraft,
                and marine vessels too, with the same care and finish standard as every
                vehicle that comes through the shop.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <div className="grid grid-cols-3 gap-3">
              <ClipReveal className="media-frame relative col-span-3 aspect-[16/9]">
                <Image
                  src="/DSC_4434.webp"
                  alt="Tesla Cybertruck in satin black wrap"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="graded object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <span className="mono-label absolute inset-x-4 bottom-3 text-ink">Automotive</span>
              </ClipReveal>
              <Reveal delay={0.1} className="col-span-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
                <div>
                  <p className="mono-label text-maroon">Aviation</p>
                  <p className="mt-1 text-sm text-cream/80">
                    Private jets and aircraft, wrapped to the same standard.
                  </p>
                </div>
                <div>
                  <p className="mono-label text-maroon">Marine</p>
                  <p className="mt-1 text-sm text-cream/80">
                    Performance boats and yachts, finished with the same precision.
                  </p>
                </div>
              </Reveal>
            </div>
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
              Better tools, more training, tighter tolerances — the same studio-lit
              standard, sharpened build after build.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="border-t border-line pt-6">
            <p className="mono-label text-maroon">02</p>
            <h3 className="mt-3 font-display text-lg text-ink">Grow with Houston</h3>
            <p className="mt-2 text-sm text-cream/80">
              More owners, still by appointment — we&apos;d rather stay booked out than
              cut corners to keep up.
            </p>
          </Reveal>
          <Reveal delay={0.26} className="border-t border-line pt-6">
            <p className="mono-label text-maroon">03</p>
            <h3 className="mt-3 font-display text-lg text-ink">Protect more surfaces</h3>
            <p className="mt-2 text-sm text-cream/80">
              From daily drivers to the private jets and marine vessels we already
              wrap — one standard, wherever it&apos;s applied.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The future we build */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <Reveal>
              <p className="mono-label text-red">The future we build</p>
            </Reveal>
            <RevealLines
              as="h2"
              lines={["It's not just about vehicles.", "It's about legacy."]}
              className="display mt-4 text-3xl text-ink sm:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-cream/80">
                Every build that leaves this shop carries our name. We see a future
                where that build earns confidence, turns heads, and holds up to the
                same standard years from now.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-9 pb-1 font-display text-3xl italic leading-[1.1] text-red">
                Iqballaz
              </p>
              <p className="mono-label mt-1">Founder, Iqballaz Customs</p>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <ClipReveal className="media-frame relative aspect-[4/5] md:aspect-[3/4]">
              <Image
                src="/DSC_5212.webp"
                alt="Car under studio light in the Iqballaz Customs shop"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="graded object-cover"
              />
            </ClipReveal>
          </div>
        </div>
      </section>

      {/* Where / hours + CTA */}
      <section className="border-t border-line py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <p className="mono-label">Where</p>
            <address className="mt-2 not-italic text-2xl text-ink">
              {business.address.street}
              <br />
              {business.address.locality}, {business.address.region} {business.address.postalCode}
            </address>
            <a href={business.phoneHref} className="link-underline mt-4 inline-block text-ink">
              {business.phone}
            </a>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <MagneticButton href="/quote" variant="primary">
                Get a Quote
              </MagneticButton>
              <Link href="/gallery" className="link-underline text-ink">
                See the work
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-4 md:col-start-9">
            <p className="mono-label">Hours</p>
            <ul className="mt-2 space-y-1 text-cream/80">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-6">
                  <span>{h.day}</span>
                  <span>{h.value}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Closing statement */}
      <section className="bg-burgundy py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="flex items-center justify-center gap-6 text-center">
          <span className="mono-label hidden text-cream/60 sm:inline">Built different.</span>
          <RevealLines
            as="h2"
            lines={[
              <>
                We don&apos;t follow the road. We <span className="text-red">define</span> it.
              </>,
            ]}
            className="display text-2xl text-ink sm:text-3xl md:text-4xl"
          />
          <span className="mono-label hidden text-cream/60 sm:inline">Built to inspire.</span>
        </div>
      </section>
    </>
  );
}
