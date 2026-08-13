import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/site";
import { getShop } from "@/lib/shop";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

type SearchParams = Promise<{ next?: string }>;

/**
 * Console sign-in. Sits outside `(console)/` so it renders without the sidebar
 * and topbar — there's nothing to navigate to until you're signed in.
 *
 * The "not configured" branch this page used to carry is gone: it existed for
 * the shared-credential era, where the console could run with no environment
 * set. Supabase Auth has no such fallback state, by design.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const shop = await getShop();
  const { next } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center px-[var(--gutter)] py-16">
      <div className="w-full max-w-sm">
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
          <p className="mono-label text-red">Admin console</p>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-ink">Sign in</h1>

          <p className="mt-2 text-sm text-muted">
            Staff access only. Each person signs in with their own account.
          </p>

          <div className="mt-6">
            <LoginForm next={next} />
          </div>

          <p className="mono-label mt-4 text-center">
            <Link href="/auth/forgot" className="link-underline text-cream hover:text-red">
              Forgot your password?
            </Link>
          </p>
        </div>

        <p className="mono-label mt-6 text-center">
          <Link href="/" className="link-underline hover:text-cream">
            Back to {shop.business.name}
          </Link>
        </p>
      </div>
    </main>
  );
}
