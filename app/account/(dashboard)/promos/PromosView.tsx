"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, currentUser } from "@/lib/account/store";
import type { Promo } from "@/lib/site";
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
 * claims to know — see ClaimedPromo in lib/account/data.ts.
 */
export default function PromosView({ live }: { live: Promo[] }) {
  const user = useAccount(currentUser);
  const claimPromo = useAccount((s) => s.claimPromo);
  if (!user) return null;

  const claimedIds = new Set(user.claims.map((c) => c.promoId));
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
          value={String(user.claims.length)}
          detail={user.claims.length === 1 ? "1 offer on your account" : "on your account"}
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
              const claimed = user.claims.find((c) => c.promoId === promo.id);
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
                      {promo.spotsLeft !== undefined ? ` · ${promo.spotsLeft} spots left` : ""}
                    </span>
                  </span>

                  {claimed ? (
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="mono-label text-ok">
                        Claimed {formatDate(claimed.claimedAt)}
                      </span>
                      {promo.payUrl ? (
                        <Link href={promo.payUrl}>
                          <GhostButton type="button">Finish paying</GhostButton>
                        </Link>
                      ) : null}
                    </span>
                  ) : (
                    <Link
                      href={promo.payUrl || promo.cta.href}
                      onClick={() => claimPromo({ id: promo.id, headline: promo.headline })}
                      className="shrink-0"
                    >
                      <PrimaryButton type="button" className="rounded-full">
                        {promo.payUrl ? "Pay & claim" : "Claim offer"}
                      </PrimaryButton>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Claim history">
        {user.claims.length === 0 ? (
          <EmptyState
            title="Nothing claimed yet"
            body="Claim a live offer above and it's held against your account."
          />
        ) : (
          <ul className="px-5">
            {user.claims.map((claim) => (
              <li
                key={claim.promoId}
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
