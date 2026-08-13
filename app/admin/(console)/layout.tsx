import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminStoreProvider from "@/components/admin/StoreProvider";
import { currentStaff } from "@/lib/supabase/server";
import { loadAdminData } from "./actions";

// Session-dependent and always live — a cached console would show one member of
// staff another's stale view of the shop.
export const dynamic = "force-dynamic";

/** Every signed-in console route renders inside the sidebar + topbar shell. */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  // The middleware only proves there's a valid session; this proves it belongs
  // to active staff. Without it, a customer account would reach the console
  // chrome and see every table render empty (RLS denying each query) rather
  // than being sent to the login screen.
  const me = await currentStaff();
  if (!me) redirect("/admin/login");

  const data = await loadAdminData();

  // The provider wraps the shell, not just the page: the sidebar and topbar
  // read the store too.
  return (
    <AdminStoreProvider data={{ ...data, me }}>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
