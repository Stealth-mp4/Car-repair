import { NextResponse } from "next/server";
import type { Lead } from "@/lib/lead";

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
  } else {
    // No destination configured yet — log so the lead isn't silently lost.
    console.log("[lead] received (no LEAD_WEBHOOK_URL set):", JSON.stringify(lead));
  }

  return NextResponse.json({ ok: true, id: lead.id });
}
