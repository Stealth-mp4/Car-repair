import Link from "next/link";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    title: "Consult",
    body: "Tell us the vehicle and the services you're after: wraps, tint, PPF, wheels, or a full build.",
  },
  {
    title: "Plan",
    body: "Colour, finish, and timeline confirmed before anything is booked. No surprises on the day.",
  },
  {
    title: "Build",
    body: "One car at a time, by appointment, under studio light. Every edge finished, not just fast.",
  },
  {
    title: "Deliver",
    body: "Walkthrough at pickup, warranty on file, and the build added to your vehicle's record.",
  },
];

/**
 * Process (V5 homepage) — how a build actually moves from quote to pickup.
 * Grounded in the real Quote Builder flow and by-appointment model, not
 * invented steps.
 */
export default function Process() {
  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="mono-label">How it works</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["From quote to pickup."]}
            className="display mt-4 text-4xl text-ink sm:text-5xl"
          />
        </div>
        <Link href="/quote" className="link-underline text-sm text-cream">
          Book an appointment →
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.1} className="border-t border-line pt-6">
            <p className="mono-label text-maroon">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-3 font-display text-xl text-ink">{step.title}</h3>
            <p className="mt-2 text-cream/80">{step.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
