import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { ServiceRecord } from "@/lib/builds";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * ServiceTimeline — one row per ServiceRecord, mono date + service name,
 * reveals on scroll via the existing Reveal primitive. Rows with a linked
 * public build get a "View build" link into /gallery/[buildSlug].
 */
export default function ServiceTimeline({ records }: { records: ServiceRecord[] }) {
  if (records.length === 0) {
    return <p className="mono-label text-muted">No service history on file yet.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {records.map((r, i) => (
        <Reveal key={r.id} delay={i * 0.04}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
            <div className="flex flex-wrap items-baseline gap-x-4">
              <span className="mono-label text-muted">{formatDate(r.date)}</span>
              <span className="text-ink">{r.service}</span>
            </div>
            {r.buildSlug ? (
              <Link href={`/gallery/${r.buildSlug}`} className="link-underline mono-label text-ink">
                View build
              </Link>
            ) : r.notes ? (
              <span className="mono-label text-muted">{r.notes}</span>
            ) : null}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
