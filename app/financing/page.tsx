import type { Metadata } from "next";
import MagneticButton from "@/components/ui/MagneticButton";
import Faq from "@/components/ui/Faq";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "Financing available for wraps, tint, and PPF at Iqballaz Customs in Houston. Split the cost of your build across manageable payments.",
};

const POINTS = [
  { title: "Spread the cost", body: "Break a wrap, PPF, or multi-service build into manageable payments instead of one lump sum." },
  { title: "Apply with your quote", body: "Tell us you'd like to finance when you request a quote — no separate trip, no guesswork." },
  { title: "Full build covered", body: "Financing applies to the whole build, current promotions included." },
];

const FAQS = [
  { q: "What can I finance?", a: "Most builds — full wraps, PPF packages, tint, and larger multi-service jobs." },
  { q: "How do I apply?", a: "Start a quote and let us know you'd like to finance. We'll walk you through the options that fit your build." },
  { q: "Can I combine financing with a promotion?", a: "Yes — financing applies to the full build, so any current offer still counts." },
];

export default function FinancingPage() {
  return (
    <>
      <section className="pb-16 pt-36" style={{ paddingInline: "var(--gutter)" }}>
        <p className="mono-label text-red">Financing</p>
        <h1 className="display mt-4 max-w-3xl text-ink">Financing available.</h1>
        <p className="mt-6 max-w-2xl text-muted">
          Build now, pay over time. We&apos;ll go over terms for your specific build
          when you request a quote — no obligation to start.
        </p>
        <div className="mt-8">
          <MagneticButton href="/quote" variant="primary">
            Start a quote
          </MagneticButton>
        </div>
      </section>

      <section className="py-8" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
          {POINTS.map((p, i) => (
            <div key={p.title}>
              <p className="mono-label text-red">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 font-display text-xl text-ink">{p.title}</h3>
              <p className="mt-2 text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Faq items={FAQS} />
    </>
  );
}
