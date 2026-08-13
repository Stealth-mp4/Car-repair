import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate on /admin, plus Supabase session refresh.
 *
 * Two jobs, and the refresh is the non-obvious one: access tokens are
 * short-lived, and Server Components can't set cookies. Without a rotation
 * here, a console tab left open would quietly fall out of its session and start
 * rendering empty tables instead of redirecting to login.
 *
 * WHAT THIS CHECKS: that the request carries a valid Supabase session. It does
 * NOT check staff membership — that needs a database round trip, and doing one
 * in middleware costs it on every asset request. The console layout checks it
 * once per page instead, and RLS enforces it on every query regardless, so a
 * signed-in non-staff user reaches a redirect, never data.
 */

export const config = {
  matcher: [
    // Everything except Next internals and static files — the session needs
    // refreshing on ordinary page loads too, not only on /admin.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|woff2?)$).*)",
  ],
};

export const LOGIN_PATH = "/admin/login";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Written to BOTH the request (so anything later in this pass sees
          // the fresh token) and the response (so the browser keeps it).
          for (const { name, value } of cookiesToSet) {
            req.cookies.set(name, value);
          }
          res = NextResponse.next({ request: req });
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Must run, and must be getUser(): this call is what performs the refresh,
  // and it verifies the token rather than decoding it. Removing it turns the
  // gate below into a check of whether a cookie merely EXISTS.
  const { data: { user } } = await db.auth.getUser();

  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return res;

  if (pathname === LOGIN_PATH) {
    // Already signed in? Skip the form.
    if (user) return NextResponse.redirect(new URL("/admin", req.url));
    return res;
  }

  if (user) return res;

  // Remember where they were headed so login can send them back.
  const login = new URL(LOGIN_PATH, req.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}
