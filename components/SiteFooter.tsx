import Link from "next/link";
import Image from "next/image";
import { brand, business, hours, services, social } from "@/lib/site";

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path
      d="M6.6 10.8c1.1 2.2 2.8 3.9 5 5l1.7-1.7c.2-.2.6-.3.9-.2 1 .3 2 .5 3.1.5.5 0 .9.4.9.9v3c0 .5-.4.9-.9.9C9.7 19.2 4.8 14.3 4.8 7.7c0-.5.4-.9.9-.9h3c.5 0 .9.4.9.9 0 1.1.2 2.1.5 3.1.1.3 0 .7-.2.9L6.6 10.8Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const MAIL_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="m4.5 7 7.5 5.5L19.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PIN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path
      d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const INSTAGRAM_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17" cy="7" r="1" fill="currentColor" />
  </svg>
);

const FACEBOOK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M14.5 8.5h2V5.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.5V21h3.3v-5.6h2.5l.4-3.2h-2.9V10.2c0-.9.3-1.7 1.4-1.7Z"
      fill="currentColor"
    />
  </svg>
);

const TIKTOK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M16.5 3c.4 2.2 1.8 3.7 4 3.9v2.9c-1.4.1-2.7-.3-4-1.1v6.1c0 3.2-2.6 5.2-5.4 5.2-2.9 0-5.3-2.1-5.3-5.2 0-3.1 2.7-5.4 6-5V13c-1.5-.2-2.9.7-2.9 2.1 0 1.3 1.1 2.2 2.4 2.2 1.5 0 2.6-1.1 2.6-2.8V3h2.6Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * SiteFooter (V5 — Habibi Tires & Wheels reference) — logo + blurb, pill
 * contact buttons with icons, circular social icon buttons, service/company/
 * hours columns, a credits row, and the oversized wordmark bleeding off the
 * bottom edge on a Deep Burgundy plate.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-line" style={{ paddingInline: "var(--gutter)" }}>
      <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-3 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="relative h-12 w-32">
            <Image
              src={brand.markTight}
              alt={business.name}
              fill
              sizes="140px"
              className="object-contain object-left"
            />
          </div>
          <p className="mt-5 max-w-xs text-cream">
            Houston&apos;s premium vehicle customization shop — wraps, tint, PPF,
            wheels, and Tesla-specific builds. By appointment.
          </p>

          <div className="mt-6 flex flex-col items-start gap-2.5">
            <a
              href={business.phoneHref}
              className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-maroon"
            >
              {PHONE_ICON}
              {business.phone}
            </a>
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-maroon"
            >
              {MAIL_ICON}
              {business.email}
            </a>
            <span className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-sm text-ink">
              {PIN_ICON}
              {business.address.street}, {business.address.locality}, {business.address.region}{" "}
              {business.address.postalCode}
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a
              href={social.instagram}
              aria-label="Instagram"
              className="btn-sweep flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
              style={{ ["--sweep" as string]: "var(--color-black-raised)" }}
            >
              {INSTAGRAM_ICON}
            </a>
            <a
              href={social.facebook}
              aria-label="Facebook"
              className="btn-sweep flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
              style={{ ["--sweep" as string]: "var(--color-black-raised)" }}
            >
              {FACEBOOK_ICON}
            </a>
            <a
              href={social.tiktok}
              aria-label="TikTok"
              className="btn-sweep flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
              style={{ ["--sweep" as string]: "var(--color-black-raised)" }}
            >
              {TIKTOK_ICON}
            </a>
          </div>
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
      </div>

      {/* Credits row */}
      <div className="flex flex-col justify-between gap-2 border-t border-line py-6 text-sm text-muted md:flex-row">
        <span>
          © {new Date().getFullYear()} {business.name}. {business.address.locality},{" "}
          {business.address.region}.
        </span>
        <span className="mono-label">By appointment only</span>
      </div>

      {/* Oversized wordmark — Deep Burgundy plate, bleeds subtly off the bottom edge */}
      <div className="pointer-events-none overflow-hidden bg-burgundy" aria-hidden="true">
        <p className="translate-y-[15%] whitespace-nowrap font-display font-semibold leading-none tracking-[-0.03em] text-black-raised text-[clamp(2.5rem,15vw,13rem)]">
          {business.wordmark}
        </p>
      </div>
    </footer>
  );
}
