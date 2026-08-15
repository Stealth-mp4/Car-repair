"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { BUCKET, isUploaded, objectPath } from "@/lib/admin/images";

/**
 * ImageField — pick a picture, and it's on the site.
 *
 * Replaces the old "Image path" text box, which asked the office to type
 * `/VINYL_WRAP.webp` and know that the file had already been put in the repo by
 * a developer. Anything that needs a developer to add a new promo image is a
 * feature the shop doesn't have.
 *
 * The upload goes straight from the browser to Supabase Storage on the staff
 * member's own session — the `staff write promo images` policy in 0001 is what
 * authorises it, so no server action and no secret key is involved. The row
 * stores the resulting public URL, which is what the public site already
 * renders.
 *
 * Uploads land under `{promoId}/`, which is load-bearing: deleting a promo
 * deletes that whole folder, so an offer can be replaced a dozen times without
 * leaving a dozen orphans in the bucket.
 */
export default function ImageField({
  id,
  value,
  rowId,
  onChange,
}: {
  id: string;
  value: string;
  /** the promo's id — the folder every upload for this row goes into */
  rowId: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);

    // The bucket has no size limit set, so this is the only thing standing
    // between a phone photo straight off a camera roll and a 12MB hero image on
    // a page the shop's customers load on mobile data.
    if (file.size > 5_000_000) {
      setError("That image is over 5MB — please resize it first.");
      return;
    }

    setBusy(true);
    const previous = value;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    // Random name, not the original: two people uploading DSC_0001.jpg would
    // otherwise fight over one object, and `upsert: false` would reject the
    // second with a confusing "already exists".
    const path = `${rowId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setBusy(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);

    // The old file goes only after the new one is safely up, and only if it was
    // ours — the seeded offers point at files in `public/`, which are part of
    // the repo and must survive an edit. A failure here is a stray object, not a
    // broken promo, so it isn't surfaced.
    const stale = objectPath(previous);
    if (stale) await supabase.storage.from(BUCKET).remove([stale]);

    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-start gap-4">
      <span className="relative flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-input border border-line bg-black">
        {value ? (
          // Plain <img>: a data-driven URL from a bucket, inside an admin dialog
          // nobody measures Core Web Vitals on. next/image would want the host
          // in remotePatterns and buy nothing here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="mono-label text-muted">No image</span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <label
          htmlFor={id}
          className="mono-label inline-flex w-fit cursor-pointer items-center border border-line px-4 py-2 text-ink transition-colors hover:border-red"
        >
          {busy ? "Uploading…" : value ? "Replace image" : "Choose image"}
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          disabled={busy}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Reset so choosing the same file twice fires change again — after a
            // failed upload the retry is usually the identical file.
            e.target.value = "";
            if (file) void upload(file);
          }}
        />

        <span className="mono-label normal-case tracking-normal text-muted">
          {error ? (
            <span className="text-warn">{error}</span>
          ) : isUploaded(value) ? (
            "Uploaded — replacing it removes the old file."
          ) : value ? (
            "Built-in image. Uploading one replaces it."
          ) : (
            "JPG, PNG or WebP. Landscape works best — under 5MB."
          )}
        </span>
      </span>
    </div>
  );
}
