/**
 * lib/supabase/client.ts — Supabase client for browser components.
 *
 * Publishable key only. Everything it can reach is whatever RLS allows the
 * signed-in user to reach, which is the point: this key is in the page source.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
