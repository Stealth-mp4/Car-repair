import type { Metadata } from "next";
import { Suspense } from "react";
import AppointmentForm from "@/components/ui/AppointmentForm";
import Reveal from "@/components/ui/Reveal";
import { getShop } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book an appointment at Iqballaz Customs. Pick a service, a date, and a time. No account needed.",
};

export default async function QuotePage() {
  const shop = await getShop();
  return (
    <section className="pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <span className="mono-label inline-block rounded-full border border-line px-4 py-1.5">
              Schedule a visit
            </span>
          </Reveal>
          <h1 className="display mt-5 max-w-3xl text-4xl text-ink sm:text-5xl md:text-6xl">
            Book an appointment.
          </h1>
          <p className="mt-4 max-w-xl text-cream/80">
            Pick a service, a date, and a preferred time. No account needed. For urgent
            requests, call or text the shop directly.
          </p>
        </div>
        <Reveal delay={0.1} className="flex flex-wrap gap-3">
          <a
            href={shop.business.phoneHref}
            style={{ ["--sweep" as string]: "var(--color-red-deep)" }}
            className="btn-sweep mono-label rounded-full bg-red px-6 py-3 text-ink"
          >
            Call
          </a>
          <a
            href={`sms:${shop.business.phoneHref.replace("tel:", "")}`}
            style={{ ["--sweep" as string]: "var(--color-black-raised)" }}
            className="btn-sweep mono-label rounded-full border border-line px-6 py-3 text-ink"
          >
            Text
          </a>
        </Reveal>
      </div>

      <div className="mt-12">
        <Suspense fallback={<div className="mono-label text-muted">Loading…</div>}>
          <AppointmentForm />
        </Suspense>
      </div>
    </section>
  );
}
