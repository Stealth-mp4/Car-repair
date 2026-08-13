import type { Metadata } from "next";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import { Countdown } from "@/components/ui/PromoBar";
import PromoClaim from "@/components/ui/PromoClaim";
import { getShop } from "@/lib/shop";
import { getPromos } from "@/lib/promos";

export const metadata: Metadata = {
  title: "Current Promos",
  description:
    "Live offers at Iqballaz Customs in Houston: wrap, tint, and PPF packages with limited spots. Book while they last.",
};

/**
 * /promos — where Meta ad traffic lands. Every live offer, soonest deadline
 * first, each with the countdown the ad creative promises. Expired offers drop
 * out in getPromos(), so an ad that outlives its promo lands on an honest
 * empty state rather than a deal we won't honour. Offers come from the promos
 * table the console edits; lib/site.ts is the fallback if that read fails.
 */
export default async function PromosPage() {
  const shop = await getShop();
  const live = await getPromos();

  return (
    <>
      <section className="pb-12 pt-36" style={{ paddingInline: "var(--gutter)" }}>
        <p className="mono-label text-red">Current promos</p>
        <RevealLines
          as="h1"
          trigger="load"
          className="display mt-4 max-w-3xl text-ink"
          lines={["Live offers.", "While spots last."]}
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl text-cream">
            Each package is capped so every car still gets the same bench time. When the
            timer runs out or the spots are gone, the offer comes down.
          </p>
        </Reveal>
      </section>

      {live.length === 0 ? (
        <section className="pb-24" style={{ paddingInline: "var(--gutter)" }}>
          <div className="rounded-media border border-line bg-black-raised p-10">
            <h2 className="font-display text-2xl text-ink">No live offers right now.</h2>
            <p className="mt-3 max-w-lg text-cream/80">
              New packages go up regularly. Call{" "}
              <a href={shop.business.phoneHref} className="link-underline text-ink">
                {shop.business.phone}
              </a>{" "}
              and we&apos;ll quote your build directly.
            </p>
            <div className="mt-7">
              <MagneticButton href="/quote" variant="primary">
                Book Appointment
              </MagneticButton>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-6 pb-24" style={{ paddingInline: "var(--gutter)" }}>
          {live.map((promo, i) => {
            const claimed =
              promo.spotsTotal && promo.spotsLeft !== undefined
                ? promo.spotsTotal - promo.spotsLeft
                : null;

            return (
              <Reveal key={promo.id} delay={i * 0.08}>
                <article className="grid grid-cols-1 overflow-hidden rounded-media border border-line md:grid-cols-12">
                  <div className="relative aspect-4/3 md:col-span-5 md:aspect-auto">
                    <Image
                      src={promo.image}
                      alt={promo.headline}
                      fill
                      sizes="(max-width: 768px) 100vw, 42vw"
                      className="graded object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-center bg-black-raised px-8 py-10 md:col-span-7 md:px-12">
                    <div className="flex flex-wrap items-center gap-4">
                      <p className="mono-label text-red">{promo.label}</p>
                      <Countdown endsAt={promo.endsAt} />
                    </div>

                    <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.05] text-ink sm:text-4xl">
                      {promo.headline}
                    </h2>
                    <p className="mt-4 max-w-md text-cream/80">{promo.detail}</p>

                    {promo.spotsTotal && promo.spotsLeft !== undefined ? (
                      <div className="mt-7 max-w-sm">
                        <div className="flex items-baseline justify-between">
                          <span className="mono-label text-ink">
                            <span className="money">{promo.spotsLeft}</span> of{" "}
                            {promo.spotsTotal} spots left
                          </span>
                          {claimed ? (
                            <span className="mono-label">{claimed} claimed</span>
                          ) : null}
                        </div>
                        <div className="mt-2 h-px w-full bg-line">
                          <div
                            className="h-px bg-red"
                            style={{
                              width: `${((claimed ?? 0) / promo.spotsTotal) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-8">
                      <PromoClaim promo={promo} />
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </section>
      )}
    </>
  );
}
