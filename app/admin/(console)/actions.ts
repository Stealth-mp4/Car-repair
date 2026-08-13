"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer, currentStaff } from "@/lib/supabase/server";
import { READ_FROM, WRITE_TO, pkOf, writable } from "@/lib/admin/tables";
import type { Collections, RowCollections, ChartPeriod, RevenuePoint } from "@/lib/admin/store";

export type SaveResult = { error?: string };

/**
 * Every action re-checks staff membership. RLS would refuse the write anyway,
 * but that surfaces as a confusing empty result — this gives a real message,
 * and it means an action is never a softer entry point than a page is.
 */
async function guard() {
  const staff = await currentStaff();
  if (!staff) throw new Error("Not signed in as staff.");
  return supabaseServer();
}

/**
 * Promos are the one collection the public site renders, so a console edit has
 * to invalidate the cached pages showing them.
 *
 * "layout" scope, not a list of paths: the promo bar lives in the site layout
 * and appears above every page, so revalidating /promos alone would leave a
 * stale offer in the nav everywhere else. This is the blunt option and the
 * correct one — promos change weekly, not per request.
 */
function revalidateIfPublic(collection: keyof RowCollections) {
  if (collection === "promos") revalidatePath("/", "layout");
}

/** Create-or-update by primary key. Mirrors the store's `upsertRow`. */
export async function saveRow(
  collection: keyof RowCollections,
  row: Record<string, unknown>,
): Promise<SaveResult> {
  try {
    const db = await guard();
    const { error } = await db
      .from(WRITE_TO[collection])
      .upsert(writable(collection, row), { onConflict: pkOf(collection) });
    if (error) return { error: error.message };
    revalidateIfPublic(collection);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed." };
  }
}

/** Mirrors the store's `removeRow`. */
export async function deleteRow(
  collection: keyof RowCollections,
  id: string,
): Promise<SaveResult> {
  try {
    const db = await guard();
    const { error } = await db
      .from(WRITE_TO[collection])
      .delete()
      .eq(pkOf(collection), id);
    if (error) return { error: error.message };
    revalidateIfPublic(collection);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Delete failed." };
  }
}

/**
 * Every collection, in one round of parallel queries. Also the recovery path:
 * when a write fails the store calls this and replaces its optimistic copy
 * with whatever the database actually holds.
 */
export type AdminData = Partial<Collections> & {
  /** Per-collection failure messages. Absent key = loaded fine. */
  errors: Partial<Record<keyof Collections, string>>;
};

export async function loadAdminData(): Promise<AdminData> {
  const db = await supabaseServer();

  const keys = Object.keys(READ_FROM) as (keyof RowCollections)[];
  const results = await Promise.all(
    keys.map((k) => db.from(READ_FROM[k]).select("*")),
  );

  const out: Record<string, unknown> = {};
  const errors: AdminData["errors"] = {};

  keys.forEach((k, i) => {
    const { data, error } = results[i];
    // A failed collection is reported, never papered over. The tab renders an
    // error state; showing an empty table instead would read as "no records",
    // which is a different and much more damaging claim than "couldn't load".
    if (error) {
      console.error(`[admin] load ${READ_FROM[k]}:`, error.message);
      errors[k] = error.message;
    } else {
      out[k] = data;
    }
  });

  const [series, breakdown] = await Promise.all([
    db.from("revenue_series").select("*").order("sort"),
    db.from("revenue_breakdown").select("*").maybeSingle(),
  ]);

  if (series.error) errors.revenueSeries = series.error.message;
  else {
    const grouped = { week: [], month: [], year: [] } as Record<ChartPeriod, RevenuePoint[]>;
    for (const r of series.data) {
      grouped[r.period as ChartPeriod]?.push({ label: r.label, value: Number(r.value) });
    }
    out.revenueSeries = grouped;
  }

  if (breakdown.error) errors.revenueBreakdown = breakdown.error.message;
  else if (breakdown.data) out.revenueBreakdown = breakdown.data;

  return { ...out, errors } as AdminData;
}
