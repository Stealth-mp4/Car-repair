import "server-only";

/**
 * lib/square.ts — the two API calls this integration makes.
 *
 * Signature verification lives next door in ./square-signature.ts, which has no
 * `server-only` guard so the test runner can import it. This file does: it reads
 * the access token, and that must never be reachable from a client bundle.
 *
 * Deliberately `fetch` rather than the `square` SDK: it's a 3MB dependency for
 * two endpoints and a hash, it wraps everything in BigInt money types that then
 * have to be unwrapped, and it pins its own API version anyway. Three functions
 * is less code than the import.
 *
 * Everything here is server-only. A leaked access token is the whole Square
 * account, the same way SUPABASE_SECRET_KEY is the whole database.
 */

const HOST =
  process.env.SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

/**
 * Pinned, not floating. Square dates its API and an unpinned request gets the
 * oldest version the token allows — which is how an integration that worked in
 * testing starts failing months later with no deploy in between.
 *
 * Keep this equal to the version on the webhook subscription in the Square
 * dashboard. Requests and events on different versions is a payload shape
 * mismatch waiting to happen.
 */
const API_VERSION = "2026-07-15";

/** Configured at all? Lets callers fall back to the static-link path. */
export const squareConfigured = () =>
  Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);

async function square(path: string, init?: RequestInit) {
  const res = await fetch(`${HOST}/v2/${path}`, {
    ...init,
    headers: {
      "Square-Version": API_VERSION,
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Square returns an errors[] with codes worth having in the log — the usual
    // one being a sandbox token pointed at production or vice versa, which
    // otherwise surfaces as a bare 401.
    const detail = (body?.errors ?? [])
      .map((e: { code?: string; detail?: string }) => e.detail ?? e.code)
      .join("; ");
    throw new Error(`Square ${path} ${res.status}: ${detail || "no detail"}`);
  }

  return body;
}

/**
 * A hosted checkout page for one claim, priced from the promo row.
 *
 * `reference_id` on the order is the whole point: it carries our claim id
 * through Square and back out of `RetrieveOrder` when the payment lands. The
 * catch is that it is NOT included in the payment webhook payload — hence the
 * order lookup in the webhook rather than reading it straight off the event.
 *
 * `idempotency_key` is the claim id, so a double-click gets the same link back
 * instead of two orders for one sale.
 */
export async function createPaymentLink(opts: {
  claimId: string;
  name: string;
  priceCents: number;
  redirectUrl: string;
}): Promise<string> {
  const body = await square("online-checkout/payment-links", {
    method: "POST",
    body: JSON.stringify({
      idempotency_key: opts.claimId,
      // `order`, not the shorter `quick_pay`: quick_pay builds the order itself
      // and has nowhere to put a reference_id, so the whole attribution chain
      // would be missing and the webhook could never name the claim. Verified
      // against sandbox — this shape round-trips through RetrieveOrder, the
      // quick_pay one has no reference to return.
      order: {
        location_id: process.env.SQUARE_LOCATION_ID,
        reference_id: opts.claimId,
        line_items: [
          {
            name: opts.name,
            quantity: "1",
            base_price_money: { amount: opts.priceCents, currency: "USD" },
          },
        ],
      },
      checkout_options: {
        redirect_url: opts.redirectUrl,
        ask_for_shipping_address: false,
      },
    }),
  });

  return body.payment_link.url as string;
}

/** The claim id a payment belongs to, read back off its order. */
export async function orderReference(orderId: string): Promise<string | null> {
  const body = await square(`orders/${orderId}`);
  return (body.order?.reference_id as string | undefined) ?? null;
}

