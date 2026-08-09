import AccountShell from "@/components/account/AccountShell";

/** Every signed-in account route renders inside the sidebar shell. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
