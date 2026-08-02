import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { business, hours } from "@/lib/site";

const fullAddress = `${business.address.street}, ${business.address.locality}, ${business.address.region} ${business.address.postalCode}`;

const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

/**
 * Location band (V5 homepage) — address, hours, and the shop on a map, sitting
 * just above the closing CTA. Same inverted-greyscale map treatment as the
 * contact page so the embed reads as part of the dark palette.
 */
export default function LocationMap() {
  return (
    <section
      className="border-t border-line py-20 md:py-28"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="mono-label text-red">Find us</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["Houston, off Stancliff."]}
            className="display mt-4 text-3xl text-ink sm:text-4xl"
          />
          <Reveal delay={0.1}>
            <address className="mt-5 not-italic text-cream/80">
              {business.address.street}
              <br />
              {business.address.locality}, {business.address.region}{" "}
              {business.address.postalCode}
            </address>
            <a href={business.phoneHref} className="link-underline mt-3 inline-block text-ink">
              {business.phone}
            </a>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="mt-6 max-w-xs space-y-1 border-t border-line pt-5 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-6">
                  <span className="text-cream/80">{h.day}</span>
                  <span className={h.value === "Closed" ? "text-red" : "text-ink"}>{h.value}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <a
              href={directions}
              target="_blank"
              rel="noreferrer"
              className="link-underline mt-6 inline-block text-ink"
            >
              Get directions →
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-8">
          <div className="media-frame relative aspect-[4/3] sm:aspect-[16/9]">
            <iframe
              src={mapEmbed}
              title={`${business.name} location map`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full grayscale invert-[0.92] contrast-[1.1]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
