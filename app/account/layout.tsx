import type { Metadata } from "next";

/**
 * Account metadata only. The dashboard chrome lives in `(dashboard)/layout.tsx`
 * so `/account/login` and `/account/signup` — which sit outside that group —
 * render as bare pages instead of a shell nobody can navigate yet. Same split
 * the admin console uses.
 *
 * Deliberately outside `app/(site)`: no marketing nav, footer, splash, smooth
 * scroll, or chat widget over a dashboard. Never indexable.
 */
export const metadata: Metadata = {
  title: { default: "Account", template: "%s | Iqballaz Customs" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
