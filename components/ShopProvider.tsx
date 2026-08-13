"use client";

import { createContext, useContext } from "react";
import type { Shop } from "@/lib/shop";

/**
 * Carries the shop's details to client components.
 *
 * Server components call `getShop()` directly. Client ones can't — so the root
 * layout reads once and hands the result down through this, rather than every
 * form and nav bar importing the static copy from lib/site.ts and quietly
 * disagreeing with the settings page.
 *
 * No default value: a missing provider throws instead of silently serving
 * whatever lib/site.ts happens to say, which is the failure mode this whole
 * change exists to remove.
 */
const ShopContext = createContext<Shop | null>(null);

export default function ShopProvider({
  shop,
  children,
}: {
  shop: Shop;
  children: React.ReactNode;
}) {
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop(): Shop {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error("useShop must be used inside <ShopProvider>.");
  return shop;
}
