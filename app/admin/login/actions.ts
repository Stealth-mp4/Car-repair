"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  cookieOptions,
  createSession,
  credentialsValid,
  readConfig,
} from "@/lib/admin/auth";

export type LoginState = { error?: string };

/**
 * Throttle. In-process and per-instance, so it resets on redeploy and doesn't
 * span serverless instances — it slows a casual guessing loop, it is not a
 * real rate limiter.
 *
 * ponytail: in-memory attempt counter; move to Redis/Upstash (or drop entirely)
 * once real per-user auth lands, since a shared password is what makes
 * brute-force worth defending against here.
 */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 5 * 60 * 1000;

function throttled(key: string): boolean {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (Date.now() > rec.until) {
    attempts.delete(key);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const rec = attempts.get(key);
  const count = rec && Date.now() <= rec.until ? rec.count + 1 : 1;
  attempts.set(key, { count, until: Date.now() + LOCKOUT_MS });
}

/** Only same-origin console paths — an open redirect here would be a real bug. */
function safeNext(next: FormDataEntryValue | null): string {
  const path = typeof next === "string" ? next : "";
  return path.startsWith("/admin") && !path.startsWith("//") ? path : "/admin";
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const cfg = readConfig();
  if (!cfg) {
    return { error: "Console is not configured. See README-admin.md." };
  }

  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  const destination = safeNext(formData.get("next"));

  if (throttled(user)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  if (!credentialsValid(cfg, user, password)) {
    recordFailure(user);
    // One message for both cases — saying "no such user" would confirm which
    // half was right.
    return { error: "That username and password don't match." };
  }

  attempts.delete(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSession(cfg), cookieOptions);
  redirect(destination);
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
