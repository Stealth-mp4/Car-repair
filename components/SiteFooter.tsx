import Link from "next/link";
import { business, hours, services, social } from "@/lib/site";

/**
 * SiteFooter — SKELETON of homepage section 11.
 * TODO(footer section): oversized wordmark bleeding off the bottom edge, credits
 * columns. For now: NAP, hours, service links, social, hairline top.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-line" style={{ paddingInline: "var(--gutter)" }}>
      <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <p className="font-display text-2xl font-semibold text-ink">
            {business.wordmark} <span className="mono-label">{business.wordmarkSub}</span>
          </p>
          <address className="mt-4 not-italic text-muted">
            {business.address.street}
            <br />
            {business.address.locality}, {business.address.region}{" "}
            {business.address.postalCode}
          </address>
          <a href={business.phoneHref} className="link-underline mt-3 inline-block text-ink">
            {business.phone}
          </a>
        </div>

        <div>
          <p className="mono-label">Services</p>
          <ul className="mt-4 space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={s.href} className="link-underline text-ink">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mono-label">Company</p>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/about" className="link-underline text-ink">
                About
              </Link>
            </li>
            <li>
              <Link href="/financing" className="link-underline text-ink">
                Financing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="link-underline text-ink">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/quote" className="link-underline text-red">
                Get a Quote
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mono-label">Hours</p>
          <ul className="mt-4 space-y-2 text-muted">
            {hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-6">
                <span>{h.day}</span>
                <span>{h.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mono-label">Follow</p>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={social.instagram} className="link-underline text-ink">
                Instagram {social.instagramHandle}
              </a>
            </li>
            <li>
              <a href={social.facebook} className="link-underline text-ink">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Credits row */}
      <div className="flex flex-col justify-between gap-2 border-t border-line py-6 text-sm text-muted md:flex-row">
        <span>
          © {business.name}. {business.address.locality}, {business.address.region}.
        </span>
        <span className="mono-label">By appointment only</span>
      </div>

      {/* Oversized wordmark — fits the width, bleeds subtly off the bottom edge */}
      <div className="pointer-events-none mt-8 overflow-hidden" aria-hidden="true">
        <p className="translate-y-[15%] whitespace-nowrap font-display font-semibold leading-none tracking-[-0.03em] text-black-raised text-[clamp(2.5rem,15vw,13rem)]">
          {business.wordmark}
        </p>
      </div>
    </footer>
  );
}
