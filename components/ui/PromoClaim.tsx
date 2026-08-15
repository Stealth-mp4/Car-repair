"use client";

import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import { useMaybeCustomer, firstName } from "@/lib/account/customer";
import { claimPromo } from "@/app/account/actions";
import { isPayable, type Promo } from "@/lib/site";

/**
 * PromoClaim — the account gate on a promo CTA (client note: a promo is claimed
 * by an account, not by an anonymous visitor).
 *
 * Signed out — and on the server, which can't know: this page is statically
 * rendered and stays that way — the button sends people to sign-up with
 * `?next=/promos`, so they land back on the offer they came for. Signed in, clicking records the claim against their
 * account and hands off to the offer's hosted checkout — `promo.payUrl`, a
 * Square or Stripe payment link. Card details never touch this site.
 *
 * What the claim means is "this member went to pay", not "this member paid":
 * the outcome happens on the provider's page and nothing reports it back. See
 * promo_claims in migration 0014.
 *
 * Until the client sends the payment link, a signed-in claim still records and
 * then falls through to the normal booking flow rather than dead-ending.
 */
export default function PromoClaim({ promo }: { promo: Promo }) {
  // undefined while the browser is still asking, null when signed out — both
  // render the signed-out branch, which is what a static page shows first.
  const { customer, claimedPromoIds } = useMaybeCustomer();
  const next = encodeURIComponent("/promos");

  if (!customer) {
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

  const claimed = claimedPromoIds.has(promo.id);

  return (
    <div>
      {/*
        A form, not a magnetic link. The claim must be written BEFORE the
        navigation — recording it alongside a <Link> wrote nothing, because the
        navigation cancels the request in flight. The action redirects to the
        offer's checkout itself, from the promos table, so the destination is
        never a client-supplied URL.
      */}
      <form action={claimPromo}>
        <input type="hidden" name="promoId" value={promo.id} />
        <button
          type="submit"
          style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
          className="btn-sweep mono-label inline-flex items-center justify-center bg-red px-6 py-3 text-ink"
        >
          {isPayable(promo)
            ? claimed
              ? "Finish paying"
              : "Pay & claim your spot"
            : // No checkout behind this offer yet, so the button must not say
              // "pay" — it books, and it says so. This is the state every offer
              // starts in.
              promo.cta.label}
        </button>
      </form>

      <p className="mono-label mt-4">
        {claimed ? (
          <>
            <span className="text-ok">Claimed</span> · saved to{" "}
            <Link href="/account/promos" className="link-underline text-ink">
              your account
            </Link>
          </>
        ) : (
          <>Claiming as {firstName(customer)} · secure checkout, card details never touch this site</>
        )}
      </p>

      {!isPayable(promo) && process.env.NODE_ENV !== "production" ? (
        <p className="mono-label mt-3">
          <span className="text-warn">Online payment not connected</span>
          <br />
          <span className="normal-case tracking-normal text-cream/80">
            Either set <code className="text-ink">Console → Promos → Price (cents)</code>,
            which generates a Square link per customer and confirms itself, or
            paste a fixed link into <code className="text-ink">Payment link</code>{" "}
            and confirm payments by hand. Until one of them is set, this button
            falls through to the quote form.
          </span>
        </p>
      ) : null}
    </div>
  );
}
