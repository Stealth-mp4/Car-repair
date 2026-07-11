import type { Metadata } from "next";
import { Suspense } from "react";
import FilterBar from "@/components/ui/FilterBar";
import BuildCard from "@/components/ui/BuildCard";
import { filterBuilds } from "@/lib/builds";

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
    title: `${prefix}Gallery — Completed Builds`,
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

  return (
    <section className="min-h-[70vh] pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <p className="mono-label">Completed builds</p>
      <h1 className="display mt-4 max-w-3xl text-ink">The work.</h1>

      <div className="mt-10">
        <Suspense fallback={<div className="mono-label text-muted">Loading filters…</div>}>
          <FilterBar />
        </Suspense>
      </div>

      <p className="mono-label mt-8 text-muted">
        {results.length} build{results.length === 1 ? "" : "s"}
        {filtered ? " · filtered" : ""}
      </p>

      {results.length === 0 ? (
        <div className="mt-6 rounded-media border border-line p-10 text-muted">
          No builds match that combination yet. Clear a filter to see more of the work.
        </div>
      ) : (
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {results.map((b, i) => (
            <BuildCard key={b.slug} build={b} index={i} priority={i < 2} />
          ))}
        </div>
      )}
    </section>
  );
}
