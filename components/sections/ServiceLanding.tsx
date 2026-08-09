import Link from "next/link";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import BuildCard from "@/components/ui/BuildCard";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import Faq from "@/components/ui/Faq";
import ServiceShowcase, { type ShowcaseItem } from "@/components/ui/ServiceShowcase";
import { filterBuilds } from "@/lib/builds";
import { services as siteServices } from "@/lib/site";
import type { ServicePageContent } from "@/lib/servicePages";
import { filmBrandFor } from "@/lib/servicePages";

/**
 * ServiceLanding — shared LAYOUT for every /services/* page. Content is passed in
 * and is distinct per service (no boilerplate copy). Renders hero, process,
 * a service-filtered builds strip, an accessible FAQ (+FAQPage schema), and a CTA.
 */
export default function ServiceLanding({ content }: { content: ServicePageContent }) {
  const builds = filterBuilds({ service: content.facet });
  const quoteHref = `/quote?service=${content.slug}`;
  const filmBrand = filmBrandFor(content.slug);

  // Real build photos for this service first — falls back to the service's
  // own hero image when there isn't gallery coverage yet.
  const heroImage = siteServices.find((s) => s.slug === content.slug)?.image;
  const galleryImages = builds.flatMap((b) =>
    b.media.filter((m) => m.type === "image").map((m) => ({ src: m.src, alt: m.alt }))
  );
  const imagePool =
    galleryImages.length > 0
      ? galleryImages
      : heroImage
        ? [{ src: heroImage, alt: content.h1 }]
        : [];

  const processItems: ShowcaseItem[] = content.process.map((step, i) => {
    const img = imagePool[i % Math.max(imagePool.length, 1)];
    return {
      href: quoteHref,
      title: step.title,
      caption: step.body,
      image: img?.src ?? "/VINYL_WRAP.webp",
      alt: img?.alt ?? step.title,
      eyebrow: `Step ${String(i + 1).padStart(2, "0")} of ${content.process.length}`,
      ctaLabel: "Start your quote",
    };
  });

  return (
    <article>
      {/* Hero — full-bleed cover variant when the page carries a heroImage */}
      {content.heroImage ? (
        <section className="relative flex min-h-[80svh] flex-col justify-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={content.heroImage.src}
              alt={content.heroImage.alt}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="graded object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent" />
          </div>
          <div className="relative z-10 pt-32 pb-16" style={{ paddingInline: "var(--gutter)" }}>
            <p className="mono-label text-red">{content.eyebrow}</p>
            <RevealLines
              as="h1"
              trigger="load"
              className="display mt-4 max-w-4xl text-ink"
              lines={[content.h1]}
            />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-cream">{content.intro}</p>
            </Reveal>
            <Reveal delay={0.25} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <MagneticButton href={quoteHref} variant="primary">
                Book Appointment
              </MagneticButton>
              <Link href={`/gallery?service=${content.facet.toLowerCase()}`} className="link-underline text-ink">
                See {content.facet.toLowerCase()} builds
              </Link>
            </Reveal>
            {content.priceNote ? (
              <Reveal delay={0.3}>
                <p className="mono-label mt-6">{content.priceNote}</p>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : (
      <section className="pb-16 pt-36" style={{ paddingInline: "var(--gutter)" }}>
        <p className="mono-label text-red">{content.eyebrow}</p>
        <RevealLines
          as="h1"
          trigger="load"
          className="display mt-4 max-w-4xl text-ink"
          lines={[content.h1]}
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-cream">{content.intro}</p>
        </Reveal>
        <Reveal delay={0.25} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <MagneticButton href={quoteHref} variant="primary">
            Book Appointment
          </MagneticButton>
          {content.priceNote ? (
            <span className="mono-label">{content.priceNote}</span>
          ) : null}
          {filmBrand ? (
            <span className="mono-label rounded-full border border-line px-3 py-1.5">
              Film: {filmBrand}
            </span>
          ) : null}
        </Reveal>
      </section>
      )}

      {/* Long-form body — only the pages that carry `body` content render this */}
      {content.body?.length ? (
        <section className="py-8 md:py-12" style={{ paddingInline: "var(--gutter)" }}>
          <div className="mx-auto max-w-3xl">
            {content.bodyEyebrow ? (
              <Reveal>
                <p className="mono-label mb-6 text-red">{content.bodyEyebrow}</p>
              </Reveal>
            ) : null}
            {content.body.map((block, i) => (
              <div key={block.heading}>
                <Reveal>
                  <h2
                    className={`font-display text-2xl font-semibold text-ink sm:text-3xl ${
                      i === 0 ? "" : "mt-14"
                    }`}
                  >
                    {block.heading}
                  </h2>
                </Reveal>
                {block.paragraphs.map((p, j) => (
                  <Reveal key={j}>
                    <p className="mt-5 text-cream/85">{p}</p>
                  </Reveal>
                ))}

                {/* Photos are spaced through the article rather than stacked:
                    image 0 after block 0, image 1 after block 2, and so on. */}
                {content.images?.[i / 2] && i % 2 === 0 ? (
                  <Reveal delay={0.1}>
                    <figure className="mt-12">
                      <div className="media-frame relative aspect-4/3 w-full">
                        <Image
                          src={content.images[i / 2].src}
                          alt={content.images[i / 2].alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="graded object-cover"
                        />
                      </div>
                      {content.images[i / 2].caption ? (
                        <figcaption className="mono-label mt-3">
                          {content.images[i / 2].caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  </Reveal>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Process */}
      <section className="pb-16 pt-8 md:pt-16" style={{ paddingInline: "var(--gutter)" }}>
        <Reveal>
          <p className="mono-label">How it goes</p>
        </Reveal>
        <div className="mt-8">
          <ServiceShowcase items={processItems} />
        </div>
      </section>

      {/* Service-filtered builds */}
      {builds.length > 0 ? (
        <section className="py-16" style={{ paddingInline: "var(--gutter)" }}>
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <p className="mono-label">Recent {content.facet.toLowerCase()} builds</p>
            </Reveal>
            <Link
              href={`/gallery?service=${content.facet.toLowerCase()}`}
              className="link-underline text-sm text-muted"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        className="border-t border-line bg-black-raised py-24 md:py-28"
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
