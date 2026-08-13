"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer, currentStaff } from "@/lib/supabase/server";
import { canSee } from "@/lib/admin/access";
import {
  BUSINESS_FIELDS,
  SOCIAL_FIELDS,
  parseOpeningHours,
  DEFAULT_SETTINGS,
  type ShopSettings,
  type SettingsKey,
} from "@/lib/admin/settings";

export type SettingsState = { ok?: string; error?: string };

/**
 * Read every settings group, falling back to lib/site.ts per group.
 *
 * `loaded` is separate from the values: a failed read must not be presented as
 * "these are your settings", because saving that form back would overwrite real
 * settings with the defaults it happened to show.
 */
export async function loadSettings(): Promise<{
  values: ShopSettings;
  saved: Partial<Record<SettingsKey, string>>;
  error?: string;
}> {
  const db = await supabaseServer();
  const { data, error } = await db.from("settings").select("key,value,\"updatedAt\"");

  if (error) return { values: DEFAULT_SETTINGS, saved: {}, error: error.message };

  const values = { ...DEFAULT_SETTINGS };
  const saved: Partial<Record<SettingsKey, string>> = {};
  for (const row of data ?? []) {
    const key = row.key as SettingsKey;
    // Merge rather than replace: a group saved before a field was added would
    // otherwise come back missing that field entirely.
    values[key] = (
      Array.isArray(DEFAULT_SETTINGS[key])
        ? row.value
        : { ...DEFAULT_SETTINGS[key], ...row.value }
    ) as never;
    saved[key] = row.updatedAt;
  }
  return { values, saved };
}

async function guard() {
  const me = await currentStaff();
  // RLS enforces this too. Checking here turns a silent zero-row write into a
  // message, and keeps the action from being a softer door than the page.
  if (!canSee(me?.access, "settings")) throw new Error("Settings are Super Admin only.");
  return { db: await supabaseServer(), me: me! };
}

/** Whole-group save. The form always posts every field in its group. */
async function save(key: SettingsKey, value: unknown): Promise<SettingsState> {
  try {
    const { db, me } = await guard();
    const { error } = await db
      .from("settings")
      .upsert({ key, value, updatedAt: new Date().toISOString(), updatedBy: me.name });
    if (error) return { error: error.message };

    // "layout" scope: these values are in the footer and the LocalBusiness
    // schema on every page, not just the one that shows them.
    revalidatePath("/", "layout");
    return { ok: "Saved. The public site updates within a request or two." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed." };
  }
}

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export async function saveBusiness(_prev: SettingsState, form: FormData): Promise<SettingsState> {
  // Built from the field whitelist, not from the form's own keys — otherwise a
  // hand-crafted POST could write arbitrary properties into the jsonb blob.
  const value = Object.fromEntries(BUSINESS_FIELDS.map((f) => [f.name, text(form, f.name)]));
  if (!value.name) return { error: "Business name can't be empty." };
  if (!value.email.includes("@")) return { error: "That email doesn't look right." };
  return save("business", value);
}

export async function saveSocial(_prev: SettingsState, form: FormData): Promise<SettingsState> {
  const value = Object.fromEntries(SOCIAL_FIELDS.map((f) => [f.name, text(form, f.name)]));
  return save("social", value);
}

export async function saveHours(_prev: SettingsState, form: FormData): Promise<SettingsState> {
  // Parallel `day`/`value` arrays, which is how repeated form fields arrive.
  const days = form.getAll("day").map((d) => String(d).trim());
  const vals = form.getAll("value").map((v) => String(v).trim());

  const value = days
    .map((day, i) => ({ day, value: vals[i] ?? "" }))
    // A blank row is how you delete one, so drop rather than reject.
    .filter((h) => h.day && h.value);

  if (value.length === 0) return { error: "Keep at least one row of hours." };
  return save("hours", value);
}

/**
 * Structured opening hours for the LocalBusiness schema.
 *
 * Validated harder than the other groups because this is the one nobody
 * proof-reads — it renders into JSON-LD, not onto a page a human looks at, so a
 * bad value gets published to search engines and sits there.
 */
export async function saveOpeningHours(
  _prev: SettingsState,
  form: FormData,
): Promise<SettingsState> {
  const { value, error } = parseOpeningHours(form);
  if (error) return { error };
  return save("openingHours", value);
}
