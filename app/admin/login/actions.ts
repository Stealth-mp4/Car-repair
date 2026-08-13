"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

/** `email` is echoed back so a failed attempt doesn't clear the field. */
export type LoginState = { error?: string; email?: string };

/** Only same-origin console paths — an open redirect here would be a real bug. */
function safeNext(next: FormDataEntryValue | null): string {
  const path = typeof next === "string" ? next : "";
  return path.startsWith("/admin") && !path.startsWith("//") ? path : "/admin";
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const destination = safeNext(formData.get("next"));

  const db = await supabaseServer();
  const { data, error } = await db.auth.signInWithPassword({ email, password });

  // One message for both cases — "no such account" would confirm which half
  // was right. Supabase rate-limits these endpoints itself, which is why the
  // old in-memory attempt counter is gone rather than ported.
  if (error || !data.user) {
    return { error: "That email and password don't match.", email };
  }

  // A valid login is not the same as being staff. Someone with a customer
  // account has real credentials here and must not land in the console.
  const { data: staff } = await db
    .from("staff")
    .select("id")
    .eq("userId", data.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!staff) {
    await db.auth.signOut();
    return { error: "That account doesn't have console access.", email };
  }

  redirect(destination);
}

export async function signOut() {
  const db = await supabaseServer();
  await db.auth.signOut();
  redirect("/admin/login");
}
