/**
 * lib/account/name.ts — splitting and rejoining `customers.name`.
 *
 * One column, because that's what the shop types at intake and what the console
 * shows. The dashboard greets people by first name and its profile form edits
 * the two halves separately, so the split happens here rather than in the
 * schema — and it has to survive the names a single column actually holds:
 * "Cher", "Ana Maria Delgado Ruiz", a stray double space.
 *
 * Import-free so `node --test` can load it.
 */

/** "Marcus" out of "Marcus Delgado". "Cher" out of "Cher". */
export const firstName = (customer: { name: string }): string =>
  customer.name.trim().split(/\s+/)[0] ?? "";

/**
 * Everything after the first word, joined — "Delgado Ruiz", not just "Delgado".
 * Empty for a one-word name, which is a real case and not an error.
 */
export const lastName = (customer: { name: string }): string =>
  customer.name.trim().split(/\s+/).slice(1).join(" ");

/**
 * The inverse. Filters before joining so a blank surname doesn't store a name
 * with a trailing space — which would then read back as a first name with an
 * invisible extra word.
 */
export const fullName = (first: string, last: string): string =>
  [first.trim(), last.trim()].filter(Boolean).join(" ");
