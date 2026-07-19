"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { makes, serviceFacets } from "@/lib/site";

/**
 * FilterBar — mono pill facets (not colourful chips), combinable make + service,
 * URL-synced (?make=tesla&service=wraps) so filtered views are shareable and
 * indexable. The gallery page reads the same params server-side and filters there.
 */
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`mono-label rounded-full border px-3 py-1.5 transition-colors ${
        active ? "border-red text-red" : "border-line text-ink hover:border-red"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeMake = params.get("make");
  const activeService = params.get("service");

  const toggle = (key: "make" | "service", value: string) => {
    const next = new URLSearchParams(Array.from(params.entries()));
    const current = next.get(key);
    if (current && current.toLowerCase() === value.toLowerCase()) {
      next.delete(key);
    } else {
      next.set(key, value.toLowerCase());
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const hasFilters = Boolean(activeMake || activeService);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-label mr-2 w-16 shrink-0">Make</span>
        {makes.map((m) => (
          <Pill
            key={m}
            active={activeMake?.toLowerCase() === m.toLowerCase()}
            onClick={() => toggle("make", m)}
          >
            {m}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-label mr-2 w-16 shrink-0">Service</span>
        {serviceFacets.map((s) => (
          <Pill
            key={s}
            active={activeService?.toLowerCase() === s.toLowerCase()}
            onClick={() => toggle("service", s)}
          >
            {s}
          </Pill>
        ))}
      </div>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="mono-label text-red underline-offset-4 hover:underline"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
