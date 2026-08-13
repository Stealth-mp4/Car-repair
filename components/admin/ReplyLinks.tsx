"use client";

import { MailIcon, PhoneIcon } from "@/components/admin/icons";

/**
 * How staff answer an enquiry: their own mail client, or their phone.
 *
 * Deliberately not a compose box in the console. Sending from here would mean
 * the shop's replies live in this database while the customer's answers land in
 * a mailbox nobody's looking at — a thread split down the middle, which is
 * worse than no thread at all. A mailto: reply is sent from the address the
 * customer wrote to, and the whole conversation stays in one inbox.
 *
 * `mailto:` also pre-fills a subject, so replies keep the enquiry's own thread.
 */
export default function ReplyLinks({
  email,
  phone,
  subject,
}: {
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
}) {
  // Trimmed because `email` is NOT NULL on the table and "no email" is stored
  // as an empty string, not null.
  const to = email?.trim();
  const tel = phone?.trim();

  if (!to && !tel) return <span className="text-muted">&mdash;</span>;

  const link =
    "mono-label inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-cream transition-colors hover:border-maroon hover:text-ink";

  return (
    <span className="flex flex-wrap justify-end gap-1.5">
      {to && (
        <a
          href={`mailto:${to}?subject=${encodeURIComponent(`Re: ${subject ?? "your enquiry"}`)}`}
          className={link}
          title={to}
        >
          <MailIcon className="h-3.5 w-3.5" />
          Reply
        </a>
      )}
      {tel && (
        <a href={`tel:${tel.replace(/[^\d+]/g, "")}`} className={link} title={tel}>
          <PhoneIcon className="h-3.5 w-3.5" />
          Call
        </a>
      )}
    </span>
  );
}
