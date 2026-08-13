import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, type ShopSettings } from "@/lib/admin/settings";
import { business } from "@/lib/site";

/**
 * Shop details for the public site — name, phone, address, hours, socials — as
 * edited in the console's settings page.
 *
 * Anonymous, cookie-free client for the same reason as lib/promos.ts: these
 * values appear in the footer and the LocalBusiness schema on every page, and
 * reading them through supabaseServer() would make the entire marketing site
 * dynamic to fetch three rows that are identical for every visitor.
 *
 * `cache()` dedupes within a single render, so a page whose layout, footer and
 * contact panel all ask for the shop makes one query, not three.
 */
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);

/**
 * The public shape. `business` keeps the non-editable design copy from
 * lib/site.ts (hero lines, wordmark, brand assets) alongside the editable NAP,
 * so consumers read one object rather than deciding per field which source it
 * came from.
 */
export type Shop = {
  // The literal types from lib/site.ts's `as const` are widened here on
  // purpose: these values now come from a text column, not a literal.
  business: Omit<typeof business, "address" | keyof ShopSettings["business"]> &
    ShopSettings["business"] & {
      address: { -readonly [K in keyof typeof business.address]: string };
    };
  hours: ShopSettings["hours"];
  social: ShopSettings["social"];
  /** Structured hours for the LocalBusiness schema. */
  openingHours: ShopSettings["openingHours"];
};

function shape(values: ShopSettings): Shop {
  return {
    business: {
      ...business,
      ...values.business,
      // The form stores address parts flat; the site reads them nested.
      address: {
        ...business.address,
        street: values.business.street,
        locality: values.business.locality,
        region: values.business.region,
        postalCode: values.business.postalCode,
      },
    },
    hours: values.hours,
    social: values.social,
    // Its own settings group, never derived from `hours`: that one is display
    // copy a human types, and turning "Closed" or "By appointment" back into
    // schema.org day arrays is a parser waiting to publish wrong hours.
    openingHours: values.openingHours,
  };
}

export const getShop = cache(async (): Promise<Shop> => {
  const { data, error } = await db.from("settings").select("key,value");

  // Falls back to lib/site.ts, per group. A failed read must not blank the
  // footer or the contact page — showing the built-in details during an outage
  // is right; showing an empty address is not.
  if (error) {
    console.error("[shop] falling back to lib/site.ts:", error.message);
    return shape(DEFAULT_SETTINGS);
  }

  const values = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) {
    const key = row.key as keyof ShopSettings;
    values[key] = (
      Array.isArray(DEFAULT_SETTINGS[key]) ? row.value : { ...DEFAULT_SETTINGS[key], ...row.value }
    ) as never;
  }
  return shape(values);
});
