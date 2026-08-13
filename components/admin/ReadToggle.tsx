"use client";

import { useAdmin } from "@/lib/admin/store";

/**
 * Read / unread, in one click.
 *
 * The store has had `markMessageRead` since it was written and nothing ever
 * called it — the only way to mark a message read was to open the edit dialog
 * on the customer's own words and tick a box. This is that action, finally
 * wired to something.
 *
 * Styled as the status pill it replaces, because it IS the status: making the
 * state itself the control means one thing to look at instead of a pill plus a
 * button that disagree.
 */
export default function ReadToggle({ id, read }: { id: string; read: boolean }) {
  const markRead = useAdmin((s) => s.markMessageRead);

  return (
    <button
      type="button"
      onClick={() => markRead(id, !read)}
      // The label says the state; the title says what clicking does. A button
      // captioned "Mark read" that then reads "Mark unread" is unreadable at a
      // glance across twenty rows.
      title={read ? "Mark as unread" : "Mark as read"}
      aria-pressed={read}
      className={`mono-label inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 capitalize transition-colors ${
        read
          ? "border-ok/35 text-ok hover:border-ok"
          : "border-warn/40 text-warn hover:border-warn"
      }`}
    >
      {read ? "Read" : "Unread"}
    </button>
  );
}
