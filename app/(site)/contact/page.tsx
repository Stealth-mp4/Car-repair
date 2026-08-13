import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import ContactForm from "@/components/ui/ContactForm";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
} from "@/components/ui/icons";
import { getShop } from "@/lib/shop";

// generateMetadata, not a static export: the description quotes the address,
// which is now a database value.
export async function generateMetadata(): Promise<Metadata> {
  const { business } = await getShop();
  return {
    title: "Contact",
    description: `Contact Iqballaz Customs at ${business.address.street}, ${business.address.locality}, ${business.address.region}. ${business.phone}. By appointment.`,
  };
}

export default async function ContactPage() {
  const { business, hours, social } = await getShop();

  const addr = `${business.address.street}, ${business.address.locality}, ${business.address.region} ${business.address.postalCode}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed`;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/client/contact-hero.webp"
            alt="Two Iqballaz installers laying blue vinyl over a front bumper"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="graded object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent" />
        </div>
        <div className="relative z-10 pt-28 pb-16" style={{ paddingInline: "var(--gutter)" }}>
          <p className="mono-label text-red">Get in touch</p>
          <RevealLines
            as="h1"
            trigger="load"
            className="display mt-4 max-w-3xl text-ink"
            lines={[
              <>
                Let&apos;s build something <span className="text-red">extraordinary</span>.
              </>,
            ]}
          />
          <p className="mt-5 max-w-xl text-cream">
            Have a question, ready to start your build, or want to book an appointment?
            Reach out and let&apos;s bring your vision to life.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href="/quote" variant="primary">
              Book Appointment
            </MagneticButton>
            <Link href="/gallery" className="link-underline text-ink">
              View our work
            </Link>
          </div>
        </div>
      </section>

      {/* Form + info + map */}
      <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="mono-label">Send us a message</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="mono-label">Contact information</p>
            <div className="mt-6 space-y-6">
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-maroon">
                  <MapPinIcon />
                </span>
                <div>
                  <p className="mono-label">Location</p>
                  <address className="mt-1 not-italic text-ink">
                    {business.address.street}
                    <br />
                    {business.address.locality}, {business.address.region}{" "}
                    {business.address.postalCode}
                  </address>
                  <a href={directions} target="_blank" rel="noreferrer" className="link-underline mt-2 inline-block text-sm text-cream">
                    Get directions
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-maroon">
                  <PhoneIcon />
                </span>
                <div>
                  <p className="mono-label">Phone</p>
                  <a href={business.phoneHref} className="link-underline mt-1 block text-ink">
                    {business.phone}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-maroon">
                  <MailIcon />
                </span>
                <div>
                  <p className="mono-label">Email</p>
                  <a href={`mailto:${business.email}`} className="link-underline mt-1 block text-ink">
                    {business.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-maroon">
                  <ClockIcon />
                </span>
                <div>
                  <p className="mono-label">Hours</p>
                  <ul className="mt-1 space-y-1 text-sm text-cream/80">
                    {hours.map((h) => (
                      <li key={h.day} className="flex justify-between gap-6">
                        <span>{h.day}</span>
                        <span>{h.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <p className="mono-label">Follow us</p>
                <div className="mt-2 flex gap-4">
                  <a href={social.instagram} className="link-underline text-sm text-ink">
                    Instagram
                  </a>
                  <a href={social.facebook} className="link-underline text-sm text-ink">
                    Facebook
                  </a>
                  <a href={social.tiktok} className="link-underline text-sm text-ink">
                    TikTok
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="lg:col-span-4">
            <div className="media-frame relative aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[26rem]">
              <iframe
                src={mapEmbed}
                title="Iqballaz Customs location map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale invert-[0.92] contrast-[1.1]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-burgundy py-24 md:py-32" style={{ paddingInline: "var(--gutter)" }}>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <RevealLines
            as="h2"
            lines={["Ready to start your next project?"]}
            className="display text-3xl text-ink sm:text-4xl md:text-5xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-4 text-cream">
              Let&apos;s turn your ideas into a masterpiece. Book your appointment today.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-8">
            <MagneticButton href="/quote" variant="paper">
              Book Appointment
            </MagneticButton>
          </Reveal>
        </div>
      </section>
    </>
  );
}
