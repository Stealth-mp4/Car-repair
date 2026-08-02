import MagneticButton from "@/components/ui/MagneticButton";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

/**
 * Contact CTA band (V5 homepage) — Mansory's "JOIN MANSORY" closing band,
 * in Iqballaz's own material: Deep Burgundy field, centered, one line, one
 * button. Sits directly before the footer.
 */
export default function ContactCta() {
  return (
    <section className="bg-burgundy py-24 md:py-32" style={{ paddingInline: "var(--gutter)" }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <RevealLines
          as="h2"
          lines={["Your Next Build Starts Here."]}
          className="display text-3xl text-ink sm:text-4xl md:text-5xl"
        />
        <Reveal delay={0.1}>
          <p className="mt-4 text-cream">
            Tell us what you're driving and what you're envisioning. We'll handle the
            rest.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-8">
          <MagneticButton href="/contact" variant="paper">
            Contact Us
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
