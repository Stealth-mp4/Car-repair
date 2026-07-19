import Link from "next/link";
import Image from "next/image";

const ITEMS = [
  {
    title: "About the shop",
    href: "/about",
    image: "/cover.jpeg",
    alt: "Iqballaz Customs storefront on Richmond Ave at dusk",
  },
  {
    title: "The work",
    href: "/gallery",
    image: "/DSC_4434.jpeg",
    alt: "Tesla Cybertruck finished in satin black wrap",
  },
  {
    title: "Financing",
    href: "/financing",
    image: "/wheel_powder_coat.jpeg",
    alt: "Freshly powder-coated wheel",
  },
];

/**
 * "IQBALLAZ CUSTOMS" trio (V4 — bugatti.com "LA MAISON BUGATTI" reference) —
 * three equal columns, caption sits BELOW the image (not overlaid), a small
 * "Learn more" link underneath. No hover-scale text reveal here — restrained,
 * static captions, matching the reference exactly.
 */
export default function MaisonTrio() {
  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <p className="mono-label">Iqballaz Customs</p>

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3">
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="group block">
            <div className="media-frame relative aspect-[4/3]">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="graded object-cover transition-transform duration-[600ms] ease-brand group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="mt-4 font-display text-xl text-ink">{item.title}</h3>
            <span className="link-underline mono-label mt-1 inline-block text-muted group-hover:text-ink">
              Learn more
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
