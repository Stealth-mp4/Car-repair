import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DEV_SEED, readConfig, usingDevSeed } from "@/lib/admin/auth";
import { brand, business } from "@/lib/site";
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
 * When the environment isn't configured, this page says exactly what's missing
 * instead of leaving a form that can never succeed.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;
  const configured = readConfig() !== null;
  const devSeed = usingDevSeed();

  return (
    <main className="flex min-h-svh items-center justify-center px-[var(--gutter)] py-16">
      <div className="w-full max-w-sm">
        <div className="relative mx-auto mb-8 h-12 w-36">
          <Image
            src={brand.markTight}
            alt={business.name}
            fill
            sizes="144px"
            priority
            className="object-contain"
          />
        </div>

        <div className="rounded-media border border-line bg-black-raised p-6 sm:p-8">
          <p className="mono-label text-red">Admin console</p>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-ink">
            {configured ? "Sign in" : "Not configured"}
          </h1>

          {configured ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Staff access only. Sessions last eight hours.
              </p>
              <div className="mt-6">
                <LoginForm next={next} />
              </div>
              {devSeed && (
                /* Shown whenever the console is running on the seeded login.
                   Setting ADMIN_USER / ADMIN_PASSWORD hides this. */
                <p className="mono-label mt-6 rounded-input border border-line px-4 py-3 leading-relaxed">
                  <span className="text-warn">Demo login</span>
                  <br />
                  <span className="text-cream normal-case tracking-normal">
                    {DEV_SEED.user} / {DEV_SEED.password}
                  </span>
                  <br />
                  Set ADMIN_USER + ADMIN_PASSWORD in the host to override.
                </p>
              )}
            </>
          ) : (
            <div className="mt-3 space-y-3 text-sm text-cream">
              <p>
                Production builds have no seeded login. Set these three environment
                variables where the app is deployed, then restart it:
              </p>
              <pre className="overflow-x-auto rounded-input border border-line bg-black p-4 font-mono text-xs text-cream">
                {`ADMIN_USER=...\nADMIN_PASSWORD=...\nSESSION_SECRET=...   # openssl rand -base64 32`}
              </pre>
              <p className="text-muted">
                In development the console opens on a seeded login with no setup at all —
                see <code className="text-ink">lib/admin/auth.ts</code>.
              </p>
            </div>
          )}
        </div>

        <p className="mono-label mt-6 text-center">
          <Link href="/" className="link-underline hover:text-cream">
            Back to {business.name}
          </Link>
        </p>
      </div>
    </main>
  );
}
