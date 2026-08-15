import { NextResponse, type NextRequest } from "next/server";
import { orderReference } from "@/lib/square";
import { verifySignature } from "@/lib/square-signature";
import { siteOrigin } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * app/api/square/webhook — Square telling us a payment landed.
 *
 * This is the half that makes tier-two checkout automatic. `claimPromo` builds a
 * link carrying the claim id; this receives the outcome and ticks `paid`, which
 * is the same column a person ticks in the console and fires the same 0015
 * trigger to move the spot counter.
 *
 * Why a webhook and not just the redirect back from Square: people close the tab
 * the moment the receipt appears. The redirect is a courtesy; this is the
 * record.
 *
 * The secret key is used deliberately. There is no signed-in user on a request
 * from Square — it is a server talking to a server — so there is no session for
 * RLS to evaluate. The verified signature is the authorisation, which is why it
 * is checked before anything else happens and why nothing is trusted before it.
 */

// Node, not Edge: the signature check uses node:crypto.
export const runtime = "nodejs";
// Never cached, never statically analysed as a page.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // RAW body, and it must stay raw all the way to the hash — `req.json()` here
  // would silently break every signature. See lib/square-signature.ts.
  const raw = await req.text();

  // The signed URL is the one registered on the subscription, not whatever host
  // header this request happens to carry: an attacker controls the header, and a
  // hash over an attacker-supplied string verifies nothing.
  const notificationUrl = `${siteOrigin()}/api/square/webhook`;

  if (!verifySignature(raw, req.headers.get("x-square-hmacsha256-signature"), notificationUrl)) {
    console.error("[square/webhook] bad signature");
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    type?: string;
    data?: { object?: { payment?: { id?: string; status?: string; order_id?: string } } };
  };

  const payment = event.data?.object?.payment;

  // Subscribed to payment.created and payment.updated both, because a card can
  // land as PENDING and complete a moment later. Only COMPLETED is money.
  if (payment?.status !== "COMPLETED" || !payment.order_id) {
    return NextResponse.json({ ok: true, ignored: event.type ?? "unknown" });
  }

  // The payment carries the order id but NOT the reference id, so the claim id
  // costs one lookup. This is the step people miss.
  const claimId = await orderReference(payment.order_id);

  if (!claimId) {
    // A payment taken through the Square app or a Dashboard link — real money,
    // just not from this site. Not an error, and returning one would make Square
    // retry it forever.
    console.warn("[square/webhook] payment with no claim reference:", payment.id);
    return NextResponse.json({ ok: true, ignored: "no reference" });
  }

  const { data, error } = await supabaseAdmin
    .from("promo_claims")
    .update({ paid: true, squareOrderId: payment.order_id })
    .eq("id", claimId)
    // Guards the retry: Square resends on any non-2xx, and both event types fire
    // for one payment. A second delivery matches nothing and the counter stays
    // put. (The 0015 trigger also ignores an unchanged `paid`, and the unique
    // index on squareOrderId would reject it too — three layers, because a
    // double-decremented spot counter is invisible until the shop oversells.)
    .eq("paid", false)
    .select("id");

  if (error) {
    // 500 so Square retries: a database blip must not lose a payment. The one
    // thing worse than a late tick is a payment nobody ever ticked.
    console.error("[square/webhook]", error.message);
    return NextResponse.json({ error: "write failed" }, { status: 500 });
  }

  // Zero rows is the ordinary retry case, not a failure — but it is also what a
  // wrong claim id looks like, so it gets logged rather than passing silently.
  // An RLS-filtered write returning zero with no error is the recurring bug in
  // this schema; the secret key rules that half out, which is why this one can
  // be read plainly as "already ticked".
  if (!data?.length) {
    console.log("[square/webhook] already recorded:", claimId);
  }

  return NextResponse.json({ ok: true, claimId, updated: Boolean(data?.length) });
}
