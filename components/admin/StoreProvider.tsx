"use client";

import { useRef } from "react";
import {
  AdminStoreContext,
  createAdminStore,
  type AdminStoreApi,
  type InitialData,
} from "@/lib/admin/store";

/**
 * Creates the console's store for this request and puts it on the context.
 *
 * Replaces the old <Hydrate> component. That one pushed server data into a
 * module-level store after mount, which meant the server pass rendered
 * whatever the store's initial state happened to be — empty (a skeleton on
 * every load) or, before that, the seed fixtures. Handing the data to the store
 * at construction means the SSR pass renders the real rows directly.
 *
 * The ref is the whole trick: `createAdminStore` must run once per mount, not
 * once per render. Calling it in the render body without this would build a new
 * store — and throw away every local edit — on any parent re-render.
 */
export default function AdminStoreProvider({
  data,
  children,
}: {
  data: InitialData;
  children: React.ReactNode;
}) {
  const store = useRef<AdminStoreApi>(undefined);
  store.current ??= createAdminStore(data);

  return (
    <AdminStoreContext.Provider value={store.current}>{children}</AdminStoreContext.Provider>
  );
}
