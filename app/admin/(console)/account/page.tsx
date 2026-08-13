import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Panel } from "@/components/admin/Panel";
import { ChangePassword } from "@/components/admin/PasswordForms";
import { currentStaff } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your account" };

/**
 * Every role reaches this page — it's the one console section that isn't in
 * the access matrix, because "change your own password" can't be a privilege.
 * Deliberately not in the sidebar: it hangs off the user menu in the topbar,
 * where people look for account things.
 */
export default async function AccountPage() {
  const me = await currentStaff();
  if (!me) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight text-ink">Your account</h1>
        <p className="mt-1 text-sm text-muted">
          {me.name} · {me.email} · {me.access}
        </p>
      </div>

      <Panel title="Change password">
        <ChangePassword />
      </Panel>

      <p className="mono-label leading-relaxed">
        Locked out and can&apos;t sign in? Use the reset link on the sign-in page
        — it emails you a way back in. If the email never arrives, a Super Admin
        can set a password for you by hand.
      </p>
    </div>
  );
}
