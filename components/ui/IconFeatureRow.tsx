import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

export type IconFeature = {
  icon: ReactNode;
  title: string;
  body: string;
};

/**
 * IconFeatureRow — a row of icon + title + caption tiles, each topped by a
 * hairline rule (no cards, no shadows — see DESIGN.md Elevation & Depth).
 * Shared across About (values/promise), Services, Financing, and Contact.
 */
export default function IconFeatureRow({
  items,
  columns = 4,
}: {
  items: IconFeature[];
  columns?: 3 | 4 | 5;
}) {
  const colClass =
    columns === 5
      ? "sm:grid-cols-2 lg:grid-cols-5"
      : columns === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 gap-x-8 gap-y-10 ${colClass}`}>
      {items.map((item, i) => (
        <Reveal key={item.title} delay={(i % columns) * 0.08} className="border-t border-line pt-6">
          <div className="text-maroon">{item.icon}</div>
          <h3 className="mt-4 font-display text-lg text-ink">{item.title}</h3>
          <p className="mt-2 text-sm text-cream/80">{item.body}</p>
        </Reveal>
      ))}
    </div>
  );
}
