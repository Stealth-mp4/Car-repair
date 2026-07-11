import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import BuildCard from "@/components/ui/BuildCard";
import RevealLines from "@/components/ui/RevealLines";
import Faq from "@/components/ui/Faq";
import { filterBuilds } from "@/lib/builds";
import type { ServicePageContent } from "@/lib/servicePages";

/**
 * ServiceLanding — shared LAYOUT for every /services/* page. Content is passed in
 * and is distinct per service (no boilerplate copy). Renders hero, process,
 * a service-filtered builds strip, an accessible FAQ (+FAQPage schema), and a CTA.
 */
export default function ServiceLanding({ content }: { content: ServicePageContent }) {
  const builds = filterBuilds({ service: content.facet });
  const quoteHref = `/quote?service=${content.slug}`;

  return (
    <article>
      {/* Hero */}
      <section className="pb-16 pt-36" style={{ paddingInline: "var(--gutter)" }}>
        <p className="mono-label text-ember">{content.eyebrow}</p>
        <h1 className="display mt-4 max-w-4xl text-ink">{content.h1}</h1>
        <p className="mt-6 max-w-2xl text-muted">{content.intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <MagneticButton href={quoteHref} variant="primary">
            Get a Quote
          </MagneticButton>
          {content.priceNote ? (
            <span className="mono-label">{content.priceNote}</span>
          ) : null}
        </div>
      </section>

      {/* Process */}
      <section className="py-16" style={{ paddingInline: "var(--gutter)" }}>
        <p className="mono-label">How it goes</p>
        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {content.process.map((step, i) => (
            <div key={step.title}>
              <p className="mono-label text-ember">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service-filtered builds */}
      {builds.length > 0 ? (
        <section className="py-16" style={{ paddingInline: "var(--gutter)" }}>
          <div className="flex items-end justify-between gap-6">
            <p className="mono-label">Recent {content.facet.toLowerCase()} builds</p>
            <Link
              href={`/gallery?service=${content.facet.toLowerCase()}`}
              className="link-underline text-sm text-muted"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {builds.map((b, i) => (
              <BuildCard key={b.slug} build={b} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ + FAQPage schema */}
      <Faq items={content.faqs} />

      {/* CTA band */}
      <section
        className="border-t border-line bg-surface py-24 md:py-28"
        style={{ paddingInline: "var(--gutter)" }}
      >
        <RevealLines
          as="h2"
          className="display max-w-4xl text-ink"
          lines={["Book your", `${content.facet.toLowerCase()} build.`]}
        />
        <div className="mt-10">
          <MagneticButton href={quoteHref} variant="paper">
            Start your quote
          </MagneticButton>
        </div>
      </section>
    </article>
  );
}
