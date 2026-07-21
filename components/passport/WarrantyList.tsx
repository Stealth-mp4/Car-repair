import type { Warranty } from "@/lib/builds";
import { warrantyStatus } from "@/lib/passport";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(w: Warranty): string {
  const status = warrantyStatus(w);
  if (status === "expired") return "Expired";
  if (status === "active") return "Active";
  const days = Math.ceil((new Date(w.expires).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return `Expires in ${days} day${days === 1 ? "" : "s"}`;
}

/**
 * WarrantyList — hairline-bordered pill rows (border-line, full radius), one
 * per warranty. Status is communicated by text only — never a background
 * fill or a dot icon. Red text is reserved for "Expired", nothing else.
 */
export default function WarrantyList({ warranties }: { warranties: Warranty[] }) {
  if (warranties.length === 0) {
    return <p className="mono-label text-muted">No warranties on file yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {warranties.map((w) => {
        const expired = warrantyStatus(w) === "expired";
        return (
          <div
            key={w.id}
            className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-line px-4 py-2"
          >
            <span className="text-ink">{w.service}</span>
            <span className="text-muted">{formatDate(w.expires)}</span>
            <span className={expired ? "text-red" : "text-muted"}>{statusLabel(w)}</span>
          </div>
        );
      })}
    </div>
  );
}
