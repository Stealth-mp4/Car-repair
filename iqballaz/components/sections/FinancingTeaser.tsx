import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";

/**
 * Financing teaser (section 9) — inset block, offset to the right (col-start-9),
 * short and direct. Generous space on the left, never both sides.
 */
export default function FinancingTeaser() {
  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 md:col-start-8">
          <p className="mono-label">Financing</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.02] text-ink">
            Financing available.
          </h2>
          <p className="mt-4 text-muted">
            Split the cost of your build across manageable terms. Apply in minutes.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href="/financing" variant="ghost">
              See terms
            </MagneticButton>
            <Link href="/quote" className="link-underline text-ink">
              Start a quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
