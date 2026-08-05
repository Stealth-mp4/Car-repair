import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import FilterBar from "@/components/ui/FilterBar";
import BuildCard from "@/components/ui/BuildCard";
import MagneticButton from "@/components/ui/MagneticButton";
import IconFeatureRow from "@/components/ui/IconFeatureRow";
import { CalendarIcon, StarIcon, DiamondIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { filterBuilds } from "@/lib/builds";
import { getReviews } from "@/lib/reviews";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import ClipReveal from "@/components/ui/ClipReveal";

type SearchParams = Promise<{ make?: string; service?: string }>;

const titleCase = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : undefined);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { make, service } = await searchParams;
  const scope = [titleCase(make), titleCase(service)].filter(Boolean).join(" ");
  const prefix = scope ? `${scope} ` : "";
  return {
    title: `${prefix}Gallery | Completed Builds`,
    description: `Completed ${scope || "wrap, tint & PPF"} builds from Iqballaz Customs in Houston. Filter by make and service.`,
  };
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { make, service } = await searchParams;
  const results = filterBuilds({ make, service });
  const filtered = Boolean(make || service);

  const reviews = await getReviews();
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  const TRUST = [
    { icon: <CalendarIcon />, title: "By appointment only", body: "Every build gets a dedicated, unrushed slot." },
    { icon: <StarIcon />, title: avgRating ? `${avgRating.toFixed(1)} rating on Google` : "Real customer reviews", body: "On-record feedback, not a curated highlight reel." },
    { icon: <DiamondIcon />, title: "Tesla specialists", body: "Model 3, Y, S, X, and Cybertruck, regularly." },
    { icon: <ShieldCheckIcon />, title: "Studio-lit precision", body: "Every build shot and finished under the same light." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/client/gallery-hero.webp"
            alt="BMW M4 in a satin grey wrap on the Iqballaz Customs shop floor"
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
          <p className="mono-label text-red">Our gallery</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 max-w-3xl text-ink"
            lines={["Built different. Captured perfectly."]}
          />
          <p className="mt-5 max-w-xl text-cream">
            Completed builds from the shop floor, every detail, every angle, the same
            standard on every car.
          </p>
          <div className="mt-8">
            <MagneticButton href="#builds" variant="ghost">
              View the builds
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section id="builds" className="pb-24 pt-16" style={{ paddingInline: "var(--gutter)" }}>
        <Suspense fallback={<div className="mono-label text-muted">Loading filters…</div>}>
          <FilterBar />
        </Suspense>

        {filtered ? <p className="mono-label mt-8 text-muted">Filtered</p> : null}

        {results.length === 0 ? (
          <div className="mt-6 rounded-media border border-line p-10 text-cream/80">
            No builds match that combination yet. Clear a filter to see more of the work.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((b, i) => (
              <BuildCard key={b.slug} build={b} index={i} priority={i < 2} />
            ))}
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <RevealLines
              as="h2"
              lines={["Have a project in mind?"]}
              className="display text-3xl text-ink sm:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-3 text-cream/80">Let&apos;s bring your vision to life.</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-7">
              <MagneticButton href="/quote" variant="primary">
                Start your build
              </MagneticButton>
            </Reveal>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <ClipReveal className="media-frame relative aspect-[16/9]">
              <Image
                src="/gallery/bmw-m4-white-1.webp"
                alt="BMW M4 Competition finished in Alpine White"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="graded object-cover"
              />
            </ClipReveal>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="border-t border-line py-16" style={{ paddingInline: "var(--gutter)" }}>
        <IconFeatureRow items={TRUST} columns={4} />
      </section>
    </>
  );
}
