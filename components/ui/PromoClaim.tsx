"use client";

import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import { useAccount, currentUser } from "@/lib/account/store";
import { useHydrated } from "@/lib/account/useHydrated";
import type { Promo } from "@/lib/site";

/**
 * PromoClaim — the account gate on a promo CTA (client note: a promo is claimed
 * by an account, not by an anonymous visitor).
 *
 * Signed out (and on the server, which can't read the persisted session) the
 * button sends people to sign-up with `?next=/promos`, so they land back on the
 * offer they came for. Signed in, clicking records the claim against their
 * account and hands off to the offer's hosted checkout — `promo.payUrl`, a
 * Square or Stripe payment link. Card details never touch this site.
 *
 * What the claim means is "this member went to pay", not "this member paid":
 * the outcome happens on the provider's page and nothing reports it back. See
 * ClaimedPromo in lib/account/data.ts.
 *
 * Until the client sends the payment link, a signed-in claim still records and
 * then falls through to the normal booking flow rather than dead-ending.
 */
export default function PromoClaim({ promo }: { promo: Promo }) {
  const hydrated = useHydrated();
  const user = useAccount(currentUser);
  const claimPromo = useAccount((s) => s.claimPromo);
  const next = encodeURIComponent("/promos");

  if (!hydrated || !user) {
    return (
      <div>
        <MagneticButton href={`/account/signup?next=${next}`} variant="primary">
          Create account to claim
        </MagneticButton>
        <p className="mono-label mt-4">
          Offers are held against your account.{" "}
          <Link href={`/account/login?next=${next}`} className="link-underline text-red">
            Sign in
          </Link>{" "}
          if you already have one.
        </p>
      </div>
    );
  }

  const claimed = user.claims.find((c) => c.promoId === promo.id);
  const record = () => claimPromo({ id: promo.id, headline: promo.headline });

  return (
    <div>
      <MagneticButton
        href={promo.payUrl || promo.cta.href}
        variant="primary"
        onClick={record}
      >
        {claimed ? "Finish paying" : promo.payUrl ? "Pay & claim your spot" : promo.cta.label}
      </MagneticButton>

      <p className="mono-label mt-4">
        {claimed ? (
          <>
            <span className="text-ok">Claimed</span> · saved to{" "}
            <Link href="/account/promos" className="link-underline text-ink">
              your account
            </Link>
          </>
        ) : (
          <>Claiming as {user.firstName} · secure checkout, card details never touch this site</>
        )}
      </p>

      {!promo.payUrl && process.env.NODE_ENV !== "production" ? (
        <p className="mono-label mt-3">
          <span className="text-warn">Online payment not connected</span>
          <br />
          <span className="normal-case tracking-normal text-cream/80">
            Add this offer&apos;s payment link in{" "}
            <code className="text-ink">lib/site.ts → promos[].payUrl</code>.
          </span>
        </p>
      ) : null}
    </div>
  );
}
