import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { safeNext } from "@/lib/account/redirect";

/**
 * GET /auth/confirm — the landing point for every link Supabase emails.
 *
 * It accepts BOTH shapes Supabase can send, because which one arrives depends
 * on a template setting in a dashboard this code can't see:
 *
 *   ?token_hash=…&type=recovery   the `{{ .TokenHash }}` template. Works in any
 *                                 browser, including one that didn't request
 *                                 the reset — the token is the proof.
 *   ?code=…                       the default `{{ .ConfirmationURL }}`, i.e.
 *                                 PKCE. Only works in the browser that asked,
 *                                 because it needs that browser's verifier
 *                                 cookie.
 *
 * Handling both means a misconfigured template degrades to "the link only works
 * on the same device" instead of a dead end.
 *
 * This is a Route Handler rather than a page for one reason: it must WRITE the
 * session cookie, and Server Components can't set cookies.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  // Untrusted: it arrives in a URL anyone can hand-craft. Same-origin paths
  // only, or this route is an open redirect wearing a password-reset hat.
  const next = safeNext(searchParams.get("next"), "/auth/reset");

  const db = await supabaseServer();

  const { error } = tokenHash && type
    ? await db.auth.verifyOtp({ type, token_hash: tokenHash })
    : code
      ? await db.auth.exchangeCodeForSession(code)
      : { error: { message: "That link is missing its token." } };

  if (error) {
    console.error("[auth/confirm]", error.message);
    // No detail in the URL — "expired" and "already used" are both just a link
    // that no longer works, and the page says so in one sentence.
    return NextResponse.redirect(new URL("/auth/reset?expired=1", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
