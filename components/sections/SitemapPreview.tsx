import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

const ITEMS = [
  {
    label: "About",
    body: "Our story, our mission, and the Iqballaz difference.",
    href: "/about",
    cta: "Read more",
    image: "/cover.webp",
    alt: "Iqballaz Customs storefront",
  },
  {
    label: "Services",
    body: "Explore all the ways we can transform your vehicle.",
    href: "/services",
    cta: "View services",
    image: "/gallery/bmw-m3-magenta-1.webp",
    alt: "BMW M3 in a Magenta wrap",
  },
  {
    label: "Builds",
    body: "See our latest projects and transformation stories.",
    href: "/gallery",
    cta: "Explore builds",
    image: "/gallery/lamborghini-aventador-black-1.webp",
    alt: "Lamborghini Aventador finished in a satin black wrap",
  },
  {
    label: "Reviews",
    body: "Real feedback from real clients.",
    href: "/#reviews",
    cta: "View reviews",
    image: "/gallery/rolls-royce-ghost-white-3.webp",
    alt: "Rolls-Royce Ghost finished in a Pearl White wrap",
  },
  {
    label: "Financing",
    body: "Flexible payment options to fit your budget.",
    href: "/financing",
    cta: "Learn more",
    image: "/gallery/ram-trx-tan-1.webp",
    alt: "RAM TRX finished in a Desert Tan wrap",
  },
  {
    label: "Contact",
    body: "Ready to build something extraordinary?",
    href: "/contact",
    cta: "Get in touch",
    image: "/locationbanner.webp",
    alt: "Iqballaz Customs shop",
  },
];

/**
 * Sitemap preview (V5) — a brief card per major page, sitting right above the
 * true footer. Mirrors the client's homepage wireframe's "footer — brief of
 * each page" band.
 */
export default function SitemapPreview() {
  return (
    <section className="border-t border-line py-16 md:py-20" style={{ paddingInline: "var(--gutter)" }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map((item, i) => (
          <Reveal key={item.label} delay={(i % 3) * 0.08} y={16}>
            <Link href={item.href} className="group relative block overflow-hidden rounded-media">
              <div className="relative aspect-[3/4]">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="graded object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-60"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/40" />

                <div className="absolute inset-x-4 top-4">
                  <h3 className="font-display text-base font-semibold text-ink">{item.label}</h3>
                  <p className="mt-2 text-xs text-cream/80">{item.body}</p>
                </div>

                <span className="absolute inset-x-4 bottom-4">
                  <span className="link-underline mono-label text-ink">{item.cta} →</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
