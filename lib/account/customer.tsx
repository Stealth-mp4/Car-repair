"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type {
  AccountCustomer,
  AccountInvoice,
  AccountServiceRecord,
  AccountAppointment,
  AccountClaim,
} from "@/lib/account/auth";
import type { Vehicle } from "@/lib/builds";
import { supabase } from "@/lib/supabase/client";

/**
 * lib/account/customer.tsx — how a client component asks who is signed in.
 *
 * Two hooks, because there are two situations and they have different
 * constraints:
 *
 *   useCustomer()        inside /account. The layout is a Server Component, it
 *                        has already called currentCustomer(), and it hands the
 *                        row down through this context — so the first paint is
 *                        the real one, no flash of a signed-out shell.
 *
 *   useMaybeCustomer()   on the public marketing site. Those pages are
 *                        statically rendered and must stay that way (see
 *                        lib/shop.ts), so there is no server pass that could
 *                        know about a session. It asks the browser instead and
 *                        returns undefined until the answer lands, which is the
 *                        same signed-out-then-swap behaviour those components
 *                        already had.
 *
 * Neither is a security boundary. They decide what to render; RLS decides what
 * the database hands over.
 */

type Session = {
  customer: AccountCustomer;
  vehicles: Vehicle[];
  invoices: AccountInvoice[];
  serviceRecords: AccountServiceRecord[];
  appointments: AccountAppointment[];
  claims: AccountClaim[];
};

const CustomerContext = createContext<Session | null>(null);

/**
 * Vehicles ride along with the customer because the layout is already on the
 * server and already awaiting one query — a second one there costs a round trip
 * once per page, versus every consumer fetching its own.
 */
export function CustomerProvider({ children, ...session }: Session & { children: React.ReactNode }) {
  return <CustomerContext.Provider value={session}>{children}</CustomerContext.Provider>;
}

/**
 * Throws outside the provider rather than returning null. Every /account page
 * renders inside a layout that has already redirected anyone signed out, so a
 * null here means the tree is wired wrong — and silently rendering an empty
 * dashboard is exactly the "confident zero" the console's RLS notes warn about.
 */
export function useCustomer(): AccountCustomer {
  return useSession().customer;
}

/** The signed-in customer's own vehicles, oldest first. Empty is a real state. */
export function useVehicles(): Vehicle[] {
  return useSession().vehicles;
}

/** Their invoices, newest first. */
export function useInvoices(): AccountInvoice[] {
  return useSession().invoices;
}

/** Everything the shop has done to their cars, newest first. */
export function useServiceRecords(): AccountServiceRecord[] {
  return useSession().serviceRecords;
}

/** Their requests and bookings, newest request first. */
export function useAppointments(): AccountAppointment[] {
  return useSession().appointments;
}

/** Offers they've clicked through to checkout on. Never means "paid". */
export function useClaims(): AccountClaim[] {
  return useSession().claims;
}

function useSession(): Session {
  const session = useContext(CustomerContext);
  if (!session) {
    throw new Error("useCustomer must be used inside <CustomerProvider> — see app/account/(dashboard)/layout.tsx");
  }
  return session;
}

/**
 * `undefined` while it's still asking, `null` for signed out.
 *
 * `claimedPromoIds` rides along because the only caller — the public promo CTA
 * — needs both answers to decide what the button says, and both are one
 * RLS-scoped query on a page that has no server pass to do it for them.
 */
export function useMaybeCustomer(): {
  customer: AccountCustomer | null | undefined;
  claimedPromoIds: Set<string>;
} {
  const [customer, setCustomer] = useState<AccountCustomer | null | undefined>(undefined);
  const [claimedPromoIds, setClaimed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let live = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (live) {
          setCustomer(null);
          setClaimed(new Set());
        }
        return;
      }
      // RLS (customer_reads_self) means this returns the caller's own row or
      // nothing — a staff member signed into the console gets nothing, which is
      // the correct answer to "are you a customer".
      const { data } = await supabase
        .from("customers")
        .select("id, userId, name, phone, email, accessCode, joined, primaryVehicleId, notifications")
        .eq("userId", user.id)
        .maybeSingle();
      if (!live) return;
      setCustomer((data as AccountCustomer) ?? null);

      // customer_reads_own_claims scopes this to them; staff get nothing, which
      // is the right answer to "which offers have you claimed".
      const { data: claims } = await supabase.from("promo_claims").select("promoId");
      if (live) setClaimed(new Set((claims ?? []).map((c) => c.promoId as string)));
    };

    void load();
    // Sign-in and sign-out happen through server actions and a full navigation,
    // but a token refresh in another tab fires here too and keeps this honest.
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());

    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { customer, claimedPromoIds };
}

// Re-exported so a component needs one import for "who is signed in" and "what
// do I call them". The implementations live in ./name.ts, which stays
// import-free so node --test can load it.
export { firstName, lastName, fullName } from "@/lib/account/name";
