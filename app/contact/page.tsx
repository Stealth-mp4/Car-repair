import type { Metadata } from "next";
import MagneticButton from "@/components/ui/MagneticButton";
import { business, hours, social } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact Iqballaz Customs — ${business.address.street}, ${business.address.locality}, ${business.address.region}. ${business.phone}. By appointment.`,
};

const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${business.address.street}, ${business.address.locality}, ${business.address.region} ${business.address.postalCode}`
)}`;

export default function ContactPage() {
  return (
    <section className="min-h-[70vh] pb-24 pt-36" style={{ paddingInline: "var(--gutter)" }}>
      <p className="mono-label text-red">Contact</p>
      <h1 className="display mt-4 max-w-3xl text-ink">By appointment only.</h1>
      <p className="mt-6 max-w-2xl text-muted">
        Tell us about your vehicle and we&apos;ll set a time. The fastest way to a
        real number is the quote builder — it gives us everything up front.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="mono-label">Call or text</p>
          <a href={business.phoneHref} className="link-underline mt-2 block text-2xl text-ink">
            {business.phone}
          </a>
          <a href={`mailto:${business.email}`} className="link-underline mt-3 block text-ink">
            {business.email}
          </a>
        </div>

        <div className="md:col-span-4">
          <p className="mono-label">Visit</p>
          <address className="mt-2 not-italic text-ink">
            {business.address.street}
            <br />
            {business.address.locality}, {business.address.region}{" "}
            {business.address.postalCode}
          </address>
          <a href={directions} target="_blank" rel="noreferrer" className="link-underline mt-3 inline-block text-ink">
            Get directions
          </a>
          <a href={social.instagram} className="link-underline mt-3 block text-muted">
            Instagram {social.instagramHandle}
          </a>
        </div>

        <div className="md:col-span-4">
          <p className="mono-label">Hours</p>
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

      <div className="mt-14">
        <MagneticButton href="/quote" variant="primary">
          Start a quote
        </MagneticButton>
      </div>
    </section>
  );
}
