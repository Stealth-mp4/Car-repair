import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

export type FaqItem = { q: string; a: string };

/**
 * Faq — accessible native <details> accordion (no icon soup, no JS) plus a
 * FAQPage JSON-LD block for rich results. Shared by /services/* and /tesla.
 */
export default function Faq({
  items,
  heading = "Questions",
}: {
  items: FaqItem[];
  heading?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="py-16" style={{ paddingInline: "var(--gutter)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <p className="mono-label">{heading}</p>
      </Reveal>
      <div className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
        {items.map((f, i) => (
          <Reveal key={f.q} delay={Math.min(i * 0.06, 0.3)}>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg text-ink">
                {f.q}
                <span className="mono-label shrink-0 text-muted transition-transform group-open:rotate-90">
                  →
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-cream/80">{f.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
