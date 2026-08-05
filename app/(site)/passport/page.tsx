import type { Metadata } from "next";
import AccessGate from "@/components/passport/AccessGate";

type SearchParams = Promise<{ error?: string }>;

// Returning-customer utility, not marketing content — keep it out of search.
export const metadata: Metadata = {
  title: "Vehicle Passport",
  robots: { index: false, follow: false },
};

export default async function PassportAccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center text-center">
      <p className="mono-label">Returning customer</p>
      <h1 className="display mt-4 text-ink">Vehicle passport.</h1>
      <p className="mt-4 max-w-sm text-muted">
        Enter the access code the shop sent you to view your build history,
        warranties, and invoices.
      </p>
      <div className="mt-10 w-full">
        <AccessGate error={error === "1"} />
      </div>
    </section>
  );
}
