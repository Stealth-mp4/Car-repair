/**
 * lib/admin/auth.ts — console session handling.
 *
 * A signed, httpOnly cookie holding a short-lived JWT. Shared by the login
 * action (Node runtime) and the middleware gate (Edge runtime), so everything
 * here uses Web Crypto via `jose` and nothing from `node:*`.
 *
 * SCOPE, HONESTLY: this replaces the browser's Basic-auth prompt with a real
 * login screen and a real sign-out. It does NOT change the trust model — there
 * is still ONE shared credential, no per-user accounts, no roles, and no audit
 * of who did what. Swap for Auth.js / Clerk / Supabase Auth when the client's
 * staff need individual logins. See README-admin.md.
 */

// Subpath imports, not the `jose` barrel: the barrel pulls in the JWE deflate
// module, whose DecompressionStream isn't available in the Edge runtime and
// warns at build time. Only HS256 JWS is used here, so it's never needed.
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const SESSION_COOKIE = "iq_admin_session";
export const LOGIN_PATH = "/admin/login";

/** Eight hours — one shop shift. Re-login the next day is the intent. */
const SESSION_SECONDS = 8 * 60 * 60;

export type Config = { user: string; password: string; secret: Uint8Array };

/**
 * Seeded development login, so the console opens with zero setup while a real
 * auth flow is still pending.
 *
 * Applied ONLY when NODE_ENV !== "production". A production build with no env
 * vars set still fails closed — hardcoded credentials that ship are how admin
 * panels get found and opened, and git history keeps them forever.
 *
 * Env vars override this in every environment, so you can point dev at
 * different credentials without touching code.
 */
export const DEV_SEED = {
  user: "admin",
  password: "iqballaz",
  secret: "dev-only-session-key-not-used-in-production",
} as const;

const seed = () => (process.env.NODE_ENV === "production" ? null : DEV_SEED);

/** True when the console is running on the seeded dev login, not env vars. */
export function usingDevSeed(): boolean {
  return seed() !== null && !process.env.ADMIN_USER && !process.env.ADMIN_PASSWORD;
}

/**
 * Resolves credentials: env vars first, dev seed second. Returns null only
 * when neither is available (i.e. an unconfigured production build), so every
 * caller fails closed rather than guessing a default.
 */
export function readConfig(): Config | null {
  const fallback = seed();
  const user = process.env.ADMIN_USER || fallback?.user;
  const password = process.env.ADMIN_PASSWORD || fallback?.password;
  const secret = process.env.SESSION_SECRET || fallback?.secret;
  if (!user || !password || !secret) return null;
  return { user, password, secret: new TextEncoder().encode(secret) };
}

/** Constant-time compare — a plain `===` leaks the secret's prefix. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function credentialsValid(cfg: Config, user: string, password: string): boolean {
  // Both compared, and neither short-circuited, so timing reveals nothing.
  const userOk = safeEqual(user, cfg.user);
  const passOk = safeEqual(password, cfg.password);
  return userOk && passOk;
}

export async function createSession(cfg: Config): Promise<string> {
  return new SignJWT({ sub: cfg.user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(cfg.secret);
}

/** True when the token is well-formed, correctly signed, and unexpired. */
export async function sessionValid(
  token: string | undefined,
  cfg: Config,
): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, cfg.secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

/** Cookie attributes shared by set and clear, so they can't drift apart. */
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_SECONDS,
};
