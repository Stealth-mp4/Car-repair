import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Wraps, ceramic tint, paint protection film, starlight headliners, and wheels at Iqballaz Customs in Houston.",
};

export default function ServicesIndexPage() {
  return (
    <section className="min-h-[70vh] pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <p className="mono-label">Services</p>
      <h1 className="display mt-4 max-w-3xl text-ink">What we do.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {services.map((s) => (
          <li key={s.slug}>
            <Link
              href={s.href}
              className="flex flex-col gap-1 py-6 md:flex-row md:items-baseline md:justify-between"
            >
              <span className="font-display text-2xl text-ink">{s.title}</span>
              <span className="text-muted">{s.short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
