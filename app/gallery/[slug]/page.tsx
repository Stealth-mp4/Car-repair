import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MagneticButton from "@/components/ui/MagneticButton";
import BuildCard from "@/components/ui/BuildCard";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { builds, getBuild, relatedBuilds } from "@/lib/builds";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return builds.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const build = getBuild(slug);
  if (!build) return { title: "Build not found" };
  return {
    title: `${build.year} ${build.make} ${build.model} — ${build.services.join(", ")}`,
    description: build.summary,
    openGraph: { images: [build.media[0]?.src].filter(Boolean) as string[] },
  };
}

export default async function BuildPage({ params }: { params: Params }) {
  const { slug } = await params;
  const build = getBuild(slug);
  if (!build) notFound();

  const related = relatedBuilds(slug);
  const quoteHref =
    `/quote?make=${encodeURIComponent(build.make)}` +
    `&model=${encodeURIComponent(build.model)}&year=${build.year}`;

  return (
    <article className="pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <Link href="/gallery" className="link-underline mono-label">
        ← All builds
      </Link>

      <header className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono-label">
            {build.year} {build.make} {build.model}
          </p>
          <h1 className="display mt-3 text-ink">{build.wrapColor ?? build.services[0]}.</h1>
          <p className="mt-6 max-w-2xl text-muted">{build.summary}</p>
        </div>

        {/* Spec list — mono, VIN-style tags */}
        <dl className="mono-label flex flex-col gap-3 md:col-span-4 md:items-end">
          <div className="flex gap-3">
            <dt className="text-muted">Services</dt>
            <dd className="text-ink">{build.services.join(" / ")}</dd>
          </div>
          {build.finish ? (
            <div className="flex gap-3">
              <dt className="text-muted">Finish</dt>
              <dd className="text-ink">{build.finish}</dd>
            </div>
          ) : null}
          {build.wrapColor ? (
            <div className="flex gap-3">
              <dt className="text-muted">Colour</dt>
              <dd className="text-ink">{build.wrapColor}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      {/* Before / after — only when the build has a pair */}
      {build.beforeAfter ? (
        <div className="mt-12">
          <p className="mono-label mb-4">Before / after</p>
          <BeforeAfterSlider data={build.beforeAfter} />
        </div>
      ) : null}

      {/* Media gallery (image + video) */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {build.media.map((m) =>
          m.type === "video" ? (
            <video
              key={m.src}
              src={m.src}
              controls
              playsInline
              className="media-frame graded aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div key={m.src} className="media-frame relative aspect-[4/5]">
              <Image
                src={m.src}
                alt={m.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="graded object-cover"
              />
            </div>
          )
        )}
      </div>

      {/* CTA — request the same build (pre-fills the quote vehicle) */}
      <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
        <MagneticButton href={quoteHref} variant="primary">
          Request this build
        </MagneticButton>
        <Link href="/tesla" className="link-underline text-ink">
          More Tesla builds
        </Link>
      </div>

      {/* Related builds strip */}
      {related.length > 0 ? (
        <section className="mt-20 border-t border-line pt-12">
          <p className="mono-label">Related builds</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((b, i) => (
              <BuildCard key={b.slug} build={b} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
