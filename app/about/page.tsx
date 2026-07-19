import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import { business, hours } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Iqballaz Customs is a Houston wrap, tint, and PPF shop on Richmond Ave — studio-lit installs, wrapped edges, work that reads like paint. By appointment.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero — real storefront at blue hour */}
      <section className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cover.jpeg"
            alt="Iqballaz Customs storefront on Richmond Ave at dusk"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="graded object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent" />
        </div>
        <div className="relative z-10 pb-16" style={{ paddingInline: "var(--gutter)" }}>
          <p className="mono-label text-red">About</p>
          <h1 className="display mt-4 max-w-4xl text-ink">A Houston shop, not a franchise.</h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="max-w-2xl text-lg text-muted">
              Iqballaz Customs is a wrap, tint, and paint-protection shop on Richmond
              Avenue in Houston. We work by appointment, one car at a time, under
              studio light — because a wrap is judged by how its edges finish, not how
              fast it&apos;s done.
            </p>
            <p className="mt-6 max-w-2xl text-muted">
              We wrap edges rather than tuck them, cut PPF to seam cleanly, and tint in
              a controlled bay so nothing settles under the film. Stainless Cybertrucks,
              colour-change on a Model 3, a full front of PPF on a daily — the standard
              is the same: it should read as paint.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <MagneticButton href="/quote" variant="primary">
                Get a Quote
              </MagneticButton>
              <Link href="/gallery" className="link-underline text-ink">
                See the work
              </Link>
            </div>
          </div>

          {/* Facts */}
          <div className="md:col-span-4 md:col-start-9">
            <p className="mono-label">Where</p>
            <address className="mt-2 not-italic text-ink">
              {business.address.street}
              <br />
              {business.address.locality}, {business.address.region}{" "}
              {business.address.postalCode}
            </address>
            <a href={business.phoneHref} className="link-underline mt-3 inline-block text-ink">
              {business.phone}
            </a>

            <p className="mono-label mt-8">Hours</p>
            <ul className="mt-2 space-y-1 text-muted">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-6">
                  <span>{h.day}</span>
                  <span>{h.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
