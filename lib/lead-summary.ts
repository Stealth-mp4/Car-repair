/**
 * Flattening a lead into a message.
 *
 * A lead is structured — vehicle, services, timeline, requested slot, photos —
 * and `messages` has one free-text field to hold all of it. So this is lossy by
 * construction: it is written to be READ by a person picking up the phone, not
 * parsed back into fields. If the shop ever needs that detail queryable, the
 * answer is a `leads` table, not a cleverer summary.
 *
 * Import-free so `node --test` can load it directly.
 */

export type LeadLike = {
  source?: string;
  vehicle?: { year?: string; make?: string; model?: string; vin?: string };
  services?: string[];
  details?: { colorFinish?: string; timeline?: string };
  appointment?: { date?: string; time?: string };
  photos?: string[];
  contact?: { name?: string; phone?: string; email?: string; method?: string };
  note?: string;
};

/** "2023 Tesla Model 3", or "" when the visitor skipped the vehicle step. */
export function vehicleLabel(lead: LeadLike): string {
  const v = lead.vehicle ?? {};
  return [v.year, v.make, v.model].filter(Boolean).join(" ").trim();
}

const SOURCE_LABEL: Record<string, string> = {
  quote: "Quote request",
  chat: "Chat enquiry",
  contact: "Contact form",
};

/** What staff see in the list. Kept short — the detail lives in the body. */
export function leadSubject(lead: LeadLike): string {
  const head = SOURCE_LABEL[lead.source ?? ""] ?? "Website enquiry";
  const vehicle = vehicleLabel(lead);
  return vehicle ? `${head} — ${vehicle}` : head;
}

/**
 * The body. One fact per line, most actionable first, and anything the visitor
 * left blank is omitted rather than printed as "Timeline: —".
 */
export function leadPreview(lead: LeadLike): string {
  const lines: string[] = [];
  const c = lead.contact ?? {};

  const reach = [c.phone, c.email].filter(Boolean).join(" · ");
  if (reach) {
    lines.push(c.method ? `${reach} (prefers ${c.method})` : reach);
  }

  const services = (lead.services ?? []).filter(Boolean);
  if (services.length) lines.push(`Wants: ${services.join(", ")}`);

  const vin = lead.vehicle?.vin;
  if (vin) lines.push(`VIN: ${vin}`);

  const finish = lead.details?.colorFinish;
  const timeline = lead.details?.timeline;
  const detail = [finish && `Finish: ${finish}`, timeline && `Timeline: ${timeline}`]
    .filter(Boolean)
    .join(" · ");
  if (detail) lines.push(detail);

  const appt = lead.appointment;
  if (appt?.date || appt?.time) {
    lines.push(`Asked for: ${[appt.date, appt.time].filter(Boolean).join(" at ")}`);
  }

  const photos = (lead.photos ?? []).filter(Boolean);
  // Names only — the forms don't upload the files yet, and saying "3 photos"
  // would suggest there's something to open.
  if (photos.length) lines.push(`Mentioned ${photos.length} photo(s): ${photos.join(", ")}`);

  if (lead.note?.trim()) lines.push(`"${lead.note.trim()}"`);

  return lines.join("\n");
}

/** Which console channel this arrived through. */
export function leadChannel(source?: string): "Web form" | "Chat" {
  return source === "chat" ? "Chat" : "Web form";
}
