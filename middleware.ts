import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, SESSION_COOKIE, readConfig, sessionValid } from "@/lib/admin/auth";

/**
 * Gate on /admin. Checks the signed session cookie and redirects to the login
 * screen when it's missing, forged, or expired — no browser Basic-auth prompt.
 *
 * The login route itself is excluded (it's where unauthenticated users are
 * sent), as is logout (which must stay reachable to clear a stale cookie).
 *
 * Fails closed: with ADMIN_USER / ADMIN_PASSWORD / SESSION_SECRET unset, the
 * console is unreachable rather than open — the login page then renders setup
 * instructions instead of a form. See README-admin.md.
 */

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

const PUBLIC_PATHS = new Set([LOGIN_PATH, "/api/admin/logout"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cfg = readConfig();

  if (!cfg) {
    if (pathname === LOGIN_PATH) return NextResponse.next();
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  const authed = await sessionValid(req.cookies.get(SESSION_COOKIE)?.value, cfg);

  if (PUBLIC_PATHS.has(pathname)) {
    // Already signed in? Skip the login form.
    if (pathname === LOGIN_PATH && authed) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (authed) return NextResponse.next();

  // Remember where they were headed so login can send them back.
  const login = new URL(LOGIN_PATH, req.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}
