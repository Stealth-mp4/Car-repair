/**
 * lib/admin/images.ts — where promo images live, and how to tell ours apart.
 *
 * Shared by the upload control (browser) and the delete path (server), which is
 * the whole reason it isn't inlined in either: the two must agree on what counts
 * as an uploaded file, or deleting a promo either misses its image or tries to
 * delete a file that ships with the repo.
 */

export const BUCKET = "promo-images";

/** The public URL prefix every object in the bucket shares. */
const PREFIX = `/storage/v1/object/public/${BUCKET}/`;

/**
 * Did we upload this, or is it one of the images that ship in `public/`?
 *
 * The seeded offers point at `/VINYL_WRAP.webp` and friends, which are files in
 * the repository. Deleting one on the shop's behalf would break the site and no
 * amount of clicking in the console would bring it back.
 */
export const isUploaded = (url: string | null | undefined): boolean =>
  Boolean(url && url.includes(PREFIX));

/**
 * The object path inside the bucket, or null if this isn't one of ours.
 * `promo-abc/1234.jpg` from `https://….supabase.co/storage/v1/object/public/promo-images/promo-abc/1234.jpg`.
 */
export function objectPath(url: string | null | undefined): string | null {
  if (!isUploaded(url)) return null;
  const path = url!.split(PREFIX)[1];
  // Strip a cache-busting query if one is ever added; the storage API wants the
  // bare key and silently matches nothing otherwise.
  return path ? decodeURIComponent(path.split("?")[0]) : null;
}
