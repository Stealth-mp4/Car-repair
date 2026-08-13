"use client";

import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { useAdmin } from "@/lib/admin/store";

/**
 * AdminShell — the console frame. Client-side only because the content offset
 * follows the sidebar's collapse state, which lives in the store.
 *
 * `--admin-pad` is the console's single horizontal rhythm (the marketing site's
 * `--gutter` is far too generous for a data-dense layout).
 */
/**
 * The banner for a write the server refused.
 *
 * Lives in the shell rather than in each table because writes happen from
 * everywhere — a status pill on the dashboard, a dialog on a list page — and
 * every one of them reverts the same way when it fails.
 */
function WriteError() {
  const message = useAdmin((s) => s.writeError);
  const dismiss = useAdmin((s) => s.dismissWriteError);
  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 z-50 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded-media border border-red/60 bg-black-raised px-5 py-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-label text-red">Change not saved</p>
          <p className="mt-1 break-words text-sm text-cream">{message}</p>
          <p className="mt-1 text-sm text-muted">
            The list has been put back to what the database holds.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="mono-label shrink-0 text-muted transition-colors hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const collapsed = useAdmin((s) => s.ui.sidebarCollapsed);

  return (
    <div
      className="min-h-svh bg-black"
      style={{ ["--admin-pad" as string]: "clamp(1rem, 2.5vw, 2rem)" } as React.CSSProperties}
    >
      <Sidebar />
      <div
        className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-64"}`}
        style={{ transitionTimingFunction: "var(--ease-brand)" }}
      >
        <Topbar />
        <main className="px-[var(--admin-pad)] py-6 pb-16">{children}</main>
      </div>
      <WriteError />
    </div>
  );
}
