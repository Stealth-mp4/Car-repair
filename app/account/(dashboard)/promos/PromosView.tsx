"use client";

import Link from "next/link";
import Image from "next/image";
import { useClaims } from "@/lib/account/customer";
import { claimPromo } from "@/app/account/actions";
import { isPayable, type Promo } from "@/lib/site";
import {
  Panel,
  StatTile,
  EmptyState,
  PrimaryButton,
  GhostButton,
  formatDate,
} from "@/components/account/ui";
import { StarIcon, CheckCircleIcon, ClockIcon } from "@/components/account/icons";

/**
 * Promos — the member side of /promos. Live offers with a claim button, plus
 * the claim history, which outlives the offers themselves (a claim keeps its
 * own copy of the headline, so an expired promo still reads properly here).
 *
 * A claim records that the member went to checkout. Whether they paid happens
 * on the provider's hosted page and never reaches this site, so nothing here
 * claims to know — see promo_claims in 0014.
 */
export default function PromosView({ live }: { live: Promo[] }) {
  const claims = useClaims();
  const claimedIds = new Set(claims.map((c) => c.promoId));
  // "offer live" on a past claim means the offer is still running now, which is
  // exactly what `live` holds — the old check used the full promo list, so a
  // long-expired offer still read as live.
  const liveIds = new Set(live.map((p) => p.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          feature
          icon={StarIcon}
          label="Offers claimed"
          value={String(claims.length)}
          detail={claims.length === 1 ? "1 offer on your account" : "on your account"}
        />
        <StatTile
          icon={ClockIcon}
          label="Live right now"
          value={String(live.length)}
          detail={live.length ? "open to claim" : "check back soon"}
        />
        <StatTile
          icon={CheckCircleIcon}
          label="Available to you"
          value={String(live.filter((p) => !claimedIds.has(p.id)).length)}
          detail="not yet claimed"
        />
      </div>

      <Panel
        title="Live offers"
        action={
          <Link href="/promos" className="link-underline text-sm text-muted">
            See the public page
          </Link>
        }
      >
        {live.length === 0 ? (
          <EmptyState
            title="No live offers right now"
            body="New packages go up regularly. Claimed offers stay on your account below."
          />
        ) : (
          <ul className="px-5">
            {live.map((promo) => {
              const claimed = claims.find((c) => c.promoId === promo.id);
              return (
                <li
                  key={promo.id}
                  className="flex flex-wrap items-center gap-4 border-b border-line py-4 last:border-b-0"
                >
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-input">
                    <Image
                      src={promo.image}
                      alt={promo.headline}
                      fill
                      sizes="80px"
                      className="graded object-cover"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{promo.headline}</span>
                    <span className="mono-label">
                      {promo.label} · ends {formatDate(promo.endsAt.slice(0, 10))}
                      {/* `!= null` catches both null and undefined: the promos table
                          returns null for an offer with no cap, and the old
                          `!== undefined` check rendered "null spots left". */}
                      {promo.spotsLeft != null ? ` · ${promo.spotsLeft} spots left` : ""}
                    </span>
                  </span>

                  {claimed ? (
                    <span className="flex shrink-0 items-center gap-3">
                      <span className={claimed.paid ? "mono-label text-ok" : "mono-label"}>
                        {claimed.paid
                          ? `Paid · ${formatDate(claimed.claimedAt)}`
                          : `Claimed ${formatDate(claimed.claimedAt)}`}
                      </span>
                      {/* Gone once the shop confirms the payment — still offering
                          "Finish paying" to someone who already paid is how you
                          get charged twice.

                          Through the action, not a <Link> to payUrl: a priced
                          offer has no fixed URL to link to, its link is built
                          per customer at the moment of the click. Re-claiming is
                          a no-op, so pressing this twice is safe. */}
                      {!claimed.paid && isPayable(promo) ? (
                        <form action={claimPromo}>
                          <input type="hidden" name="promoId" value={promo.id} />
                          <GhostButton type="submit">Finish paying</GhostButton>
                        </form>
                      ) : null}
                    </span>
                  ) : (
                    // A form, not a link: the claim has to be written before
                    // the navigation, or the navigation cancels it. The action
                    // records the claim and redirects to the offer's own
                    // checkout URL, looked up server-side.
                    <form action={claimPromo} className="shrink-0">
                      <input type="hidden" name="promoId" value={promo.id} />
                      <PrimaryButton type="submit" className="rounded-full">
                        {isPayable(promo) ? "Pay & claim" : "Claim offer"}
                      </PrimaryButton>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Claim history">
        {claims.length === 0 ? (
          <EmptyState
            title="Nothing claimed yet"
            body="Claim a live offer above and it's held against your account."
          />
        ) : (
          <ul className="px-5">
            {claims.map((claim) => (
              <li
                key={claim.id}
                className="flex items-center gap-4 border-b border-line py-3.5 last:border-b-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon/25">
                  <StarIcon className="h-4 w-4 text-red" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{claim.headline}</span>
                  <span className="mono-label">Claimed {formatDate(claim.claimedAt)}</span>
                </span>
                <span className="mono-label shrink-0 text-right">
                  {liveIds.has(claim.promoId) ? "offer live" : "offer closed"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
