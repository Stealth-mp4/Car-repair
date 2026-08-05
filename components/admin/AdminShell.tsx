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
    </div>
  );
}
