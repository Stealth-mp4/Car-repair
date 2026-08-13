import { NextResponse } from "next/server";
import type { Lead } from "@/lib/lead";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { leadChannel, leadPreview, leadSubject } from "@/lib/lead-summary";
import { getShop } from "@/lib/shop";

/**
 * POST /api/lead — the single lead intake for the appointment form and Chat Assistant.
 * Validates, stamps id + createdAt, then forwards to LEAD_WEBHOOK_URL when set
 * (e.g. a CRM, Zapier, or an email service). With no destination configured it
 * accepts and logs the lead so nothing 500s — wire the destination at launch.
 */
export async function POST(req: Request) {
  let body: Partial<Lead>;
  try {
    body = (await req.json()) as Partial<Lead>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = body.contact?.name?.trim();
  const phone = body.contact?.phone?.trim();
  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name and phone are required." },
      { status: 400 }
    );
  }

  const lead: Lead & { id: string } = {
    source: body.source === "chat" ? "chat" : body.source === "contact" ? "contact" : "quote",
    vehicle: body.vehicle ?? {},
    services: Array.isArray(body.services) ? body.services : [],
    details: body.details ?? {},
    appointment: body.appointment,
    photos: Array.isArray(body.photos) ? body.photos : [],
    contact: {
      name,
      phone,
      email: body.contact?.email,
      method: body.contact?.method,
    },
    note: body.note,
    createdAt: new Date().toISOString(),
    id: globalThis.crypto.randomUUID(),
  };

  /*
   * Into the console's Messages tab.
   *
   * The ADMIN client, deliberately: `messages` is office-only under RLS and the
   * visitor sending this is anonymous. This route is the trusted server-side
   * boundary that turns "a stranger filled in a form" into "a row staff can
   * read" — which is exactly the narrow job the secret key exists for.
   */
  const { error: saveError } = await supabaseAdmin.from("messages").insert({
    from: lead.contact.name,
    // NOT NULL on the table, and the forms only require a phone.
    email: lead.contact.email ?? "",
    phone: lead.contact.phone,
    subject: leadSubject(lead),
    preview: leadPreview(lead),
    channel: leadChannel(lead.source),
    // `createdAt` is optional on the Lead type but always stamped just above.
    date: (lead.createdAt ?? new Date().toISOString()).slice(0, 10),
    read: false,
  });

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      console.error("[lead] webhook forward failed:", err);
    }
  }

  /*
   * If the row didn't save, the enquiry reached nobody. Telling the visitor it
   * went through would be the worst outcome here: they'd wait for a call that
   * was never going to come. Fail loudly and point them at the phone instead —
   * unless a webhook took it, in which case someone does have it.
   */
  if (saveError) {
    console.error("[lead] NOT SAVED:", saveError.message, JSON.stringify(lead));
    if (!webhook) {
      // The number comes from settings, not lib/site.ts — telling someone to
      // ring a number the shop has since changed is a poor apology.
      const { business } = await getShop();
      return NextResponse.json(
        {
          ok: false,
          error: `Sorry — we couldn't send that just now. Please call the shop on ${business.phone}.`,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true, id: lead.id });
}
