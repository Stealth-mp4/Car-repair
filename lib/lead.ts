/**
 * lib/lead.ts — the ONE lead schema + pipeline (build.md QUOTE BUILDER + AI CHAT).
 * Both the Quote Builder and the Chat Assistant submit this shape to /api/lead —
 * do not build two separate contact pipelines.
 */

export type ContactMethod = "phone" | "text" | "email";

export type Lead = {
  source: "quote" | "chat";
  vehicle: { year?: string; make?: string; model?: string; vin?: string };
  services: string[];
  details: { colorFinish?: string; timeline?: string };
  /** filenames only for now — binary upload wires to storage later */
  photos: string[];
  contact: { name: string; phone: string; email?: string; method?: ContactMethod };
  /** free-text interest, mainly from the chat handoff */
  note?: string;
  createdAt?: string;
};

export function emptyLead(source: Lead["source"]): Lead {
  return {
    source,
    vehicle: {},
    services: [],
    details: {},
    photos: [],
    contact: { name: "", phone: "" },
  };
}

/** Returns an error message, or null when the contact block is submittable. */
export function validateContact(lead: Lead): string | null {
  if (!lead.contact.name.trim()) return "Please add your name.";
  if (!lead.contact.phone.trim()) return "Please add a phone number.";
  if (lead.contact.phone.replace(/\D/g, "").length < 10)
    return "Please add a valid phone number.";
  if (lead.contact.email && !/^\S+@\S+\.\S+$/.test(lead.contact.email))
    return "That email doesn't look right.";
  return null;
}

/** Client-side submit. Both wizard and chat call this. */
export async function submitLead(
  lead: Lead
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error ?? "Submission failed." };
    return { ok: true, id: data?.id };
  } catch {
    return { ok: false, error: "Network error — try again, or call us." };
  }
}
