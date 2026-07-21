import Image from "next/image";
import type { Build, Vehicle } from "@/lib/builds";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";

/**
 * PassportPhotoGrid — the vehicle's own build photos, plus a before/after
 * slider for any linked public gallery build that has one. Does not
 * reinvent the gallery grid: same media-frame + .graded treatment and the
 * same 4:5 / 4:3 aspect system as BuildCard / the gallery detail page.
 */
export default function PassportPhotoGrid({
  vehicle,
  linkedBuilds,
}: {
  vehicle: Vehicle;
  linkedBuilds: Build[];
}) {
  const beforeAfterBuilds = linkedBuilds.filter((b) => b.beforeAfter);

  return (
    <div className="space-y-10">
      {beforeAfterBuilds.map((b) => (
        <div key={b.slug}>
          <p className="mono-label mb-4">
            Before / after — {b.services.join(" / ")}
          </p>
          <BeforeAfterSlider data={b.beforeAfter!} />
        </div>
      ))}

      {vehicle.media.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vehicle.media.map((m, i) => (
            <div
              key={m.src}
              className="media-frame relative"
              style={{ aspectRatio: i % 3 === 1 ? "4 / 3" : "4 / 5" }}
            >
              {m.type === "video" ? (
                <video
                  src={m.src}
                  controls
                  playsInline
                  className="graded absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="graded object-cover"
                />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
