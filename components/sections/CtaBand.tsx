import RevealLines from "@/components/ui/RevealLines";
import MagneticButton from "@/components/ui/MagneticButton";

/**
 * CTA band (section 10) — full-bleed, black-on-black (raised, not pure ink-black),
 * huge RevealLines headline, magnetic inverted (paper) button into the Quote Builder.
 */
export default function CtaBand() {
  return (
    <section
      className="border-t border-line bg-black-raised py-28 md:py-36"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <RevealLines
        as="h2"
        className="display max-w-4xl text-ink"
        lines={["Ready to build", "yours?"]}
      />
      <div className="mt-10">
        <MagneticButton href="/quote" variant="paper">
          Start your build
        </MagneticButton>
      </div>
    </section>
  );
}
