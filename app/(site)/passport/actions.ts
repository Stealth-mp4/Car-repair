"use server";

import { redirect } from "next/navigation";
import { getCustomerByAccessCode, getVehiclesForCustomer } from "@/lib/passport";

/**
 * openPassport — verifies the access code server-side (customer/vehicle data,
 * including access codes, never ships to the client bundle) and redirects to
 * that customer's vehicle passport. Multi-vehicle customers land on the first
 * vehicle; a "your vehicles" switcher is a natural Phase 2 addition once a
 * customer has more than a couple.
 */
export async function openPassport(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const customer = code ? getCustomerByAccessCode(code) : undefined;
  const vehicles = customer ? getVehiclesForCustomer(customer.id) : [];

  if (!customer || vehicles.length === 0) {
    redirect("/passport?error=1");
  }

  redirect(`/passport/${vehicles[0].id}`);
}
