/**
 * Where to send someone after they sign in or sign up. `?next=` comes from the
 * URL, so it's untrusted: anything that isn't a single-slash site-relative path
 * ("//evil.com" and "https://…" both fail this) falls back to the dashboard,
 * which is what stops the auth pages being an open redirect.
 */
export const safeNext = (
  next: string | null | undefined,
  /** where to land when `next` is missing or untrustworthy */
  fallback = "/account",
): string => (next && /^\/(?!\/)/.test(next) ? next : fallback);
