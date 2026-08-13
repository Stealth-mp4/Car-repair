"use client";

import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/site";
import { useShop } from "@/components/ShopProvider";

/**
 * Shared chrome for the sign-in and sign-up pages — brand mark, a bordered
 * card, and the escape hatch back to the marketing site. The two forms differ
 * only in their contents.
 */
export default function AuthCard({
  eyebrow,
  title,
  lede,
  children,
  footer,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** sign-up has twice the fields, so it gets a wider card */
  wide?: boolean;
}) {
  const shop = useShop();
  return (
    <main className="flex min-h-svh items-center justify-center px-[var(--gutter)] py-16">
      <div className={`w-full ${wide ? "max-w-xl" : "max-w-sm"}`}>
        <div className="relative mx-auto mb-8 h-12 w-36">
          <Image
            src={brand.markTight}
            alt={shop.business.name}
            fill
            sizes="144px"
            priority
            className="object-contain"
          />
        </div>

        <div className="rounded-media border border-line bg-black-raised p-6 sm:p-8">
          <p className="mono-label text-red">{eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm text-muted">{lede}</p>
          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-6 space-y-2 text-center">
          {footer}
          <p className="mono-label">
            <Link href="/" className="link-underline hover:text-cream">
              Back to {shop.business.name}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
