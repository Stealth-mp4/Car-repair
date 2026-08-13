/**
 * Password rules, in one import-free file so `node --test` can load it and both
 * the reset flow and the console's own change-password form use the same check.
 *
 * Minimum length only. No composition rules (one symbol, one digit, …): they
 * push people toward "Password1!" and NIST stopped recommending them years ago.
 * Length is the part that actually costs an attacker something.
 */

export const MIN_PASSWORD_LENGTH = 10;

/** Returns an error message, or null when the pair is acceptable. */
export function validatePassword(next: string, confirm: string): string | null {
  if (next.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (next !== confirm) return "The two new passwords don't match.";
  return null;
}
