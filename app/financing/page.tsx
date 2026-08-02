import type { Metadata } from "next";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import IconFeatureRow from "@/components/ui/IconFeatureRow";
import Faq from "@/components/ui/Faq";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import {
  DollarIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  HandshakeIcon,
  WrenchIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "Financing available for wraps, tint, and PPF at Iqballaz Customs in Houston. Split the cost of your build across manageable payments.",
};

const TRUST = [
  { icon: <DollarIcon />, title: "Flexible terms", body: "Payments spread across a schedule that fits your build." },
  { icon: <CalendarIcon />, title: "Apply with your quote", body: "No separate trip. Mention it when you request pricing." },
  { icon: <ShieldCheckIcon />, title: "Full build covered", body: "Financing applies to the whole build, promotions included." },
  { icon: <CheckCircleIcon />, title: "No surprises", body: "Terms discussed upfront. No obligation to start." },
  { icon: <HandshakeIcon />, title: "One conversation", body: "We walk through real options together, no paperwork chase." },
];

const FINANCING_OPTIONS = [
  {
    title: "Promotional financing",
    body: "Short-term financing reviewed case by case for qualified builds.",
    points: ["No cost to check your options", "Reviewed with your quote", "Applies to promotional builds"],
  },
  {
    title: "Payment plans",
    body: "A fixed monthly payment sized to fit your build.",
    points: ["Predictable monthly amount", "Terms set before you commit", "Low down payment options"],
  },
  {
    title: "Lease options",
    body: "Keep your options open as your build evolves.",
    points: ["Lower monthly commitment", "Upgrade or adjust more often", "Fits business or personal use"],
  },
  {
    title: "Service financing",
    body: "Finance protection and service work, not just parts.",
    points: ["Covers PPF, tint, and detailing", "Keeps your vehicle in top condition", "Terms discussed with your quote"],
  },
];

const STEPS = [
  { title: "Book an appointment", body: "Tell us the vehicle and the build. No commitment yet.", icon: <CalendarIcon /> },
  { title: "Talk financing", body: "Mention it when you book and we'll walk through real options together.", icon: <HandshakeIcon /> },
  { title: "Confirm your plan", body: "Terms are set before anything is booked. No surprises on the day.", icon: <CheckCircleIcon /> },
  { title: "Start your build", body: "Once confirmed, your vehicle goes on the schedule.", icon: <WrenchIcon /> },
];

const WHAT_YOU_CAN_FINANCE = [
  { title: "Vehicle wraps", href: "/services/vehicle-wraps", body: "Full colour-change vinyl, any finish." },
  { title: "Paint protection film", href: "/services/paint-protection-film", body: "Front packages or full-body coverage." },
  { title: "Ceramic tint", href: "/services/ceramic-tint", body: "Heat-rejecting film, all-around." },
  { title: "Multi-service builds", href: "/quote", body: "Combine wraps, PPF, tint, and wheels into one build." },
];

const LENDERS = [
  { name: "Stripe", logo: "/lenders/stripe.svg", body: "Fast, secure online payments for your deposit or full build cost." },
  { name: "Acima", logo: "/lenders/acima.svg", body: "Flexible lease-to-own options when you'd rather spread the cost over time." },
  { name: "Square", logo: "/lenders/square.svg", body: "Simple in-person and online payment plans, handled securely." },
  { name: "Snap Finance", logo: "/lenders/snap-finance.svg", body: "Fast-decision financing for larger builds, including less-than-perfect credit." },
];

const FAQS = [
  { q: "What can I finance?", a: "Most builds: full wraps, PPF packages, tint, and larger multi-service jobs." },
  { q: "How do I apply?", a: "Book an appointment and let us know you'd like to finance. We'll walk you through the options that fit your build." },
  { q: "Can I combine financing with a promotion?", a: "Yes. Financing applies to the full build, so any current offer still counts." },
  { q: "Do I need to decide before my appointment?", a: "No. Bring it up when you request your quote and we'll go over the options together, no obligation to start." },
];

export default function FinancingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/gallery/lamborghini-aventador-blue-2.webp"
            alt="Lamborghini Aventador with scissor doors open during a build"
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
          <p className="mono-label text-red">Financing</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 max-w-2xl text-ink"
            lines={["Build now. Pay over time."]}
          />
          <p className="mt-5 max-w-xl text-cream">
            We&apos;ll go over terms for your specific build when you request a quote,
            no obligation to start.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-4">
            <MagneticButton href="/quote" variant="primary">
              Book Appointment
            </MagneticButton>
            <MagneticButton href="#options" variant="ghost">
              View options
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label">Why finance with us</p>
        </Reveal>
        <div className="mt-10">
          <IconFeatureRow items={TRUST} columns={5} />
        </div>
      </section>

      {/* Financing options */}
      <section id="options" className="border-y border-line bg-black-raised py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label text-red">Financing options</p>
        </Reveal>
        <RevealLines
          as="h2"
          lines={["Options that fit your lifestyle."]}
          className="display mt-4 max-w-xl text-3xl text-ink sm:text-4xl"
        />
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-media bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FINANCING_OPTIONS.map((item, i) => (
            <Reveal key={item.title} delay={(i % 4) * 0.08} className="flex flex-col justify-between bg-black-raised p-6">
              <div>
                <h3 className="font-display text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-cream/80">{item.body}</p>
                <ul className="mt-4 space-y-2">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-cream/80">
                      <span className="mt-0.5 shrink-0 text-red">
                        <CheckCircleIcon className="h-4 w-4" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="/quote" className="link-underline mono-label mt-6 inline-block text-ink">
                Ask about this →
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Simple. Fast. Secure. */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label">How it works</p>
        </Reveal>
        <RevealLines
          as="h2"
          lines={["Simple. Fast. Secure."]}
          className="display mt-4 max-w-xl text-3xl text-ink sm:text-4xl"
        />
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="border-t border-line pt-6">
                <div className="text-maroon">{step.icon}</div>
                <p className="mono-label mt-3 text-maroon">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-display text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-cream/80">{step.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="rounded-media bg-black-raised p-8 lg:col-span-4">
            <h3 className="font-display text-xl text-ink">Worried about your credit?</h3>
            <p className="mt-3 text-sm text-cream/80">
              We work with a range of financing partners, so approval isn&apos;t
              one size fits all. Let&apos;s find an option that works for you.
            </p>
            <div className="mt-6">
              <MagneticButton href="/quote" variant="ghost">
                Book Appointment
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What you can finance */}
      <section className="border-y border-line bg-black-raised py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label">What you can finance</p>
        </Reveal>
        <RevealLines
          as="h2"
          lines={["Every service, one build."]}
          className="display mt-4 max-w-xl text-3xl text-ink sm:text-4xl"
        />
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-media bg-line sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_YOU_CAN_FINANCE.map((item, i) => (
            <Reveal key={item.title} delay={(i % 4) * 0.08} className="bg-black-raised">
              <a
                href={item.href}
                className="group flex h-full flex-col justify-between p-6 transition-colors hover:bg-black"
              >
                <div>
                  <h3 className="font-display text-lg text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm text-cream/80">{item.body}</p>
                </div>
                <span className="link-underline mono-label mt-6 inline-block text-ink">
                  Learn more →
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trusted lenders */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label">Partnered with trusted lenders</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {LENDERS.map((lender, i) => (
            <Reveal key={lender.name} delay={i * 0.08} className="border-t border-line pt-6">
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG, no raster optimization needed */}
              <img src={lender.logo} alt={lender.name} className="h-8 w-auto" />
              <p className="mt-4 text-sm text-cream/80">{lender.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Faq items={FAQS} heading="Financing FAQ" />

      {/* Closing CTA */}
      <section className="bg-burgundy py-24 md:py-32" style={{ paddingInline: "var(--gutter)" }}>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <RevealLines
            as="h2"
            lines={["Ready to get started?"]}
            className="display text-3xl text-ink sm:text-4xl md:text-5xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-4 text-cream">
              Apply when you request your quote, flexible options, no pressure.
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
