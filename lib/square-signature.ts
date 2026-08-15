import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Is this webhook really from Square?
 *
 * HMAC-SHA256 over the notification URL concatenated with the RAW request body,
 * base64, compared against the `x-square-hmacsha256-signature` header. Two ways
 * to get this wrong, both of which produce a mismatch with no clue why:
 *
 *   - re-serialising the parsed JSON. `JSON.parse` then `JSON.stringify` gives
 *     back different bytes (key order, whitespace, unicode escapes) and the hash
 *     is over bytes. The route reads `req.text()` and never `req.json()`.
 *   - a notification URL that doesn't match the subscription character for
 *     character. It is part of the signed string, so http vs https, a trailing
 *     slash, or a missing www all fail identically.
 *
 * Its own file, apart from lib/square.ts, because that one is `server-only` and
 * this is the half worth testing.
 *
 * Compared with `timingSafeEqual`, not `===`. A string compare returns early at
 * the first differing byte, and the time it took says how much of a guess was
 * right — enough to walk a forgery out byte by byte given enough attempts. The
 * obvious version is the wrong version here.
 */
export function verifySignature(
  rawBody: string,
  signature: string | null,
  notificationUrl: string,
  key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
): boolean {
  if (!signature || !key) return false;

  const expected = createHmac("sha256", key)
    .update(notificationUrl + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  // timingSafeEqual throws on a length mismatch rather than returning false, and
  // a wrong-length signature is just a mismatch like any other.
  return a.length === b.length && timingSafeEqual(a, b);
}
