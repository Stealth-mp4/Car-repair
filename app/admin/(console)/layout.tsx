import AdminShell from "@/components/admin/AdminShell";

/** Every signed-in console route renders inside the sidebar + topbar shell. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
