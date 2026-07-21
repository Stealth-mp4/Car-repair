import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuild } from "@/lib/builds";
import {
  vehicles,
  getVehicle,
  getServiceHistory,
  getWarranties,
  getInvoices,
} from "@/lib/passport";
import WarrantyList from "@/components/passport/WarrantyList";
import ServiceTimeline from "@/components/passport/ServiceTimeline";
import InvoiceList from "@/components/passport/InvoiceList";
import PassportPhotoGrid from "@/components/passport/PassportPhotoGrid";

type Params = Promise<{ vehicleId: string }>;

export function generateStaticParams() {
  return vehicles.map((v) => ({ vehicleId: v.id }));
}

// Private customer data — never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function VehiclePassportPage({ params }: { params: Params }) {
  const { vehicleId } = await params;
  const vehicle = getVehicle(vehicleId);
  if (!vehicle) notFound();

  const records = getServiceHistory(vehicle.id);
  const warranties = getWarranties(vehicle.id);
  const invoices = getInvoices(vehicle.id);
  const linkedBuilds = records
    .map((r) => (r.buildSlug ? getBuild(r.buildSlug) : undefined))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const filmBrands = [vehicle.tint?.brand, vehicle.ppf?.brand].filter(Boolean).join(" / ");

  return (
    <article className="pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <header className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono-label">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.vin ? ` — ${vehicle.vin}` : ""}
          </p>
          <h1 className="display mt-3 text-ink">
            {vehicle.wrapColor ?? vehicle.ppf?.coverage ?? vehicle.tint?.shade ?? "Passport"}.
          </h1>
        </div>

        {/* Spec list — mono, VIN-style tags, same pattern as the gallery detail page */}
        <dl className="mono-label flex flex-col gap-3 md:col-span-4 md:items-end">
          {vehicle.wrapColor ? (
            <div className="flex gap-3">
              <dt className="text-muted">Colour</dt>
              <dd className="text-ink">{vehicle.wrapColor}</dd>
            </div>
          ) : null}
          {vehicle.tint ? (
            <div className="flex gap-3">
              <dt className="text-muted">Tint</dt>
              <dd className="text-ink">
                {vehicle.tint.shade} — {vehicle.tint.areas.join(", ")}
              </dd>
            </div>
          ) : null}
          {vehicle.ppf ? (
            <div className="flex gap-3">
              <dt className="text-muted">PPF</dt>
              <dd className="text-ink">{vehicle.ppf.coverage}</dd>
            </div>
          ) : null}
          {filmBrands ? (
            <div className="flex gap-3">
              <dt className="text-muted">Film</dt>
              <dd className="text-ink">{filmBrands}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      <section className="mt-16 border-t border-line pt-12">
        <p className="mono-label mb-6">Warranties</p>
        <WarrantyList warranties={warranties} />
      </section>

      <section className="mt-16 border-t border-line pt-12">
        <p className="mono-label mb-6">Service history</p>
        <ServiceTimeline records={records} />
      </section>

      <section className="mt-16 border-t border-line pt-12">
        <p className="mono-label mb-6">Invoices</p>
        <InvoiceList invoices={invoices} />
      </section>

      <section className="mt-16 border-t border-line pt-12">
        <p className="mono-label mb-6">Build photos</p>
        <PassportPhotoGrid vehicle={vehicle} linkedBuilds={linkedBuilds} />
      </section>
    </article>
  );
}
