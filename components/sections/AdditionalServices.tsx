import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";

type Group = { label: string; items: string[]; href?: string };

/**
 * Everything the shop does that doesn't warrant its own landing page. Grouped
 * so a long flat list reads as four short ones — a visitor scanning for "curb
 * rash" finds it under Wheels & Tires instead of halfway down thirty bullets.
 * Groups with a `href` link through to the page that covers that work.
 */
const GROUPS: Group[] = [
  {
    label: "Styling & finish",
    items: [
      "Chrome Delete",
      "Caliper Paint",
      "Body Kit Installation",
      "Carbon Fiber Parts",
      "Powder Coating",
      "Starlight Headliners",
      "Cosmetic Repairs",
      "Detailing",
    ],
    href: "/services/starlight-headliners",
  },
  {
    label: "Wheels & tires",
    items: [
      "Custom Wheels",
      "Wheel Repair",
      "Curb Rash Repair",
      "Bent Wheel Repair",
      "Wheel Refinishing",
      "Wheel Installation",
      "Wheel Fitment Consultation",
      "Tire Replacement",
      "Tire Installation",
      "Tire Balancing",
      "Tire Rotation",
      "Tire Disposal",
      "TPMS Service",
    ],
    href: "/services/wheels-tires",
  },
  {
    label: "Suspension & performance",
    items: [
      "Leveling Kits",
      "Lift Kits",
      "Lowering Kits",
      "Suspension Replacement",
      "Suspension Upgrades",
      "Ride Height Adjustments",
      "Performance Handling Upgrades",
      "Spacers",
      "Tuning",
      "Exhaust Setup",
      "Modifications",
    ],
  },
  {
    label: "Maintenance & repair",
    items: ["Oil Changes", "General Vehicle Maintenance", "Body Work"],
  },
];

export default function AdditionalServices() {
  return (
    <section
      className="border-y border-line bg-black-raised py-20 md:py-28"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="mono-label text-red">Any and everything</p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["Additional services."]}
            className="display mt-4 text-3xl text-ink sm:text-4xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-lg text-cream/80">
              Beyond wraps, tint, and PPF, the same bay handles the rest of the build.
              Don&apos;t see what you need? Ask — if we don&apos;t do it, we&apos;ll
              tell you who does.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
            {GROUPS.map((group, i) => (
              <Reveal key={group.label} delay={i * 0.06}>
                <p className="mono-label border-b border-line pb-2 text-ink">
                  {group.href ? (
                    <Link href={group.href} className="link-underline">
                      {group.label}
                    </Link>
                  ) : (
                    group.label
                  )}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="text-sm text-cream/80">
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15} className="lg:col-span-5">
          <div className="media-frame relative aspect-4/5 h-full min-h-[320px] w-full">
            <Image
              src="/client/tesla-wrap-x5m.webp"
              alt="BMW X5 M in satin black inside the Iqballaz Customs shop"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="graded object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
