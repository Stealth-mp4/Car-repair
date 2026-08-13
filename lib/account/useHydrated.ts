"use client";

import { useEffect, useState } from "react";

/**
 * False on the server and on the first client render, true from the first
 * effect onward.
 *
 * The account store is persisted in localStorage, which the server can't read,
 * so anything rendering signed-in state has to wait a tick or it mismatches
 * hydration and flashes the wrong view.
 *
 * This gates on mount rather than on `useAccount.persist.hasHydrated()`: the
 * persist API isn't attached during a static prerender (it crashed the build),
 * and it isn't needed. The store uses the default synchronous localStorage
 * backend, which rehydrates while the module initialises on the client — so by
 * the time this effect runs, the store is already the persisted one.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
