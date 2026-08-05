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
 * Seeded demo login. Applies in EVERY environment, including deployed
 * production builds, so a shared demo link just works with no env setup.
 *
 * ponytail: hardcoded shared credential, deliberate for the demo phase.
 * To lock the console down later, either set ADMIN_USER / ADMIN_PASSWORD /
 * SESSION_SECRET in the host (they override this with no code change), or
 * delete DEV_SEED and have readConfig() return null when they're unset.
 *
 * `secret` is the worse half of this: it signs the session cookie, so anyone
 * who can read this file can forge a valid session WITHOUT the password —
 * changing only ADMIN_PASSWORD does not close that. SESSION_SECRET must be set
 * in the host too. It can't be randomised per process as a stopgap: on
 * serverless hosting each instance would sign with a different key and
 * sessions would fail across instances.
 */
export const DEV_SEED = {
  user: "admin",
  password: "iqballaz",
  secret: "demo-session-key-replace-before-real-launch",
} as const;

/** True when the console is running on the seeded login rather than env vars. */
export function usingDevSeed(): boolean {
  return !process.env.ADMIN_USER && !process.env.ADMIN_PASSWORD;
}

/**
 * Resolves credentials: env vars first, seeded demo login second. Never returns
 * null while DEV_SEED exists — the null branch is kept so callers stay
 * fail-closed if the seed is removed later.
 */
export function readConfig(): Config | null {
  const user = process.env.ADMIN_USER || DEV_SEED.user;
  const password = process.env.ADMIN_PASSWORD || DEV_SEED.password;
  const secret = process.env.SESSION_SECRET || DEV_SEED.secret;
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
