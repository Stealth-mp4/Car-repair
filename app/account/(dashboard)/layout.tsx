import { redirect } from "next/navigation";
import AccountShell from "@/components/account/AccountShell";
import { CustomerProvider } from "@/lib/account/customer";
import {
  currentCustomer,
  currentVehicles,
  currentInvoices,
  currentServiceRecords,
  currentAppointments,
  currentClaims,
} from "@/lib/account/auth";

/**
 * Every signed-in account route renders inside the sidebar shell.
 *
 * This is also where the gate lives, and it is a real one now — the layout runs
 * on the server, so the redirect happens before any dashboard markup is built.
 * Middleware already turned away requests with no session at all; this checks
 * the part middleware deliberately doesn't, which is whether that session
 * belongs to a customer. A staff member with a valid console cookie has no
 * `customers` row and lands back on the login form.
 *
 * Mirrors the console's own layout check. Neither is the last line of defence:
 * RLS is.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const customer = await currentCustomer();
  if (!customer) redirect("/account/login");

  // After the gate, not alongside it: these are useless without a customer, and
  // RLS would return nothing for a session that failed the check anyway. In
  // parallel because neither depends on the other.
  const [vehicles, invoices, serviceRecords, appointments, claims] = await Promise.all([
    currentVehicles(),
    currentInvoices(),
    currentServiceRecords(),
    currentAppointments(),
    currentClaims(),
  ]);

  return (
    <CustomerProvider
      customer={customer}
      vehicles={vehicles}
      invoices={invoices}
      serviceRecords={serviceRecords}
      appointments={appointments}
      claims={claims}
    >
      <AccountShell>{children}</AccountShell>
    </CustomerProvider>
  );
}
