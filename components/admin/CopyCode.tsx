"use client";

import { useEffect, useState } from "react";

/**
 * A passport code, click-to-copy.
 *
 * It used to be reachable only by opening the customer's edit dialog, which
 * meant front desk had to enter an editing form — and risk saving something —
 * just to read a code out to someone on the phone.
 *
 * Null when the viewer isn't allowed it: `admin_customers` withholds the code
 * from anyone outside the office (migration 0008), so this renders the same
 * dash the rest of the console uses for "not yours to see".
 */
export default function CopyCode({ value }: { value: string | null }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  // Revert the label after a moment; cleared on unmount so a copy on the last
  // row before a page change can't set state on a gone component.
  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 1500);
    return () => clearTimeout(t);
  }, [state]);

  if (!value) return <span className="text-muted">&mdash;</span>;

  const copy = async () => {
    try {
      // Undefined on http:// origins other than localhost — the console is
      // served over https in production, but say so rather than doing nothing.
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${value}`}
      aria-label={`Copy passport code ${value}`}
      className={`mono-label rounded-input border px-2.5 py-1 normal-case tracking-normal transition-colors ${
        state === "copied"
          ? "border-ok text-ok"
          : state === "failed"
            ? "border-red text-red"
            : "border-line text-cream hover:border-maroon hover:text-ink"
      }`}
    >
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : value}
    </button>
  );
}
