import type { Metadata } from "next";
import { Suspense } from "react";
import QuoteWizard from "@/components/ui/QuoteWizard";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Build a quote for your wrap, tint, or PPF at Iqballaz Customs. Vehicle, services, details, photos — one step at a time.",
};

export default function QuotePage() {
  return (
    <section className="min-h-[70vh] pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <p className="mono-label">Quote Builder</p>
      <h1 className="display mt-4 max-w-3xl text-ink">Build your quote.</h1>
      <p className="mt-4 max-w-xl text-muted">
        Six quick steps. Your progress saves automatically.
      </p>
      <div className="mt-12 max-w-3xl">
        <Suspense fallback={<div className="mono-label text-muted">Loading…</div>}>
          <QuoteWizard />
        </Suspense>
      </div>
    </section>
  );
}
