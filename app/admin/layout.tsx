import type { Metadata } from "next";

/**
 * Admin metadata only. The console chrome (sidebar + topbar) lives in
 * `(console)/layout.tsx` so `/admin/login` — which sits outside that group —
 * renders as a bare page instead of a shell nobody can navigate yet.
 *
 * Deliberately outside `app/(site)`: no marketing nav, footer, splash, smooth
 * scroll, or chat widget. Never indexable.
 */
export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Iqballaz Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
