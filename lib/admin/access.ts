/**
 * lib/admin/access.ts — who can see which console section.
 *
 * This is the UI half of access control. The enforcing half is RLS, in
 * supabase/migrations/0002_roles.sql, and the two are deliberately written to
 * mirror each other section-for-table. Hiding a sidebar link is a courtesy;
 * the database is what actually says no.
 *
 * When you change a row here, change the matching policy there. A section
 * visible in the sidebar whose table denies reads renders an empty page, which
 * looks like a bug rather than a permission.
 */

export type Access = "Super Admin" | "Manager" | "Technician" | "Front desk";

const ALL: Access[] = ["Super Admin", "Manager", "Technician", "Front desk"];
const OFFICE: Access[] = ["Super Admin", "Manager", "Front desk"];
const SHOP: Access[] = ["Super Admin", "Manager", "Technician"];
const BOOKS: Access[] = ["Super Admin", "Manager"];
const OWNER: Access[] = ["Super Admin"];

/**
 * Section slug -> roles that may open it. "" is the dashboard.
 *
 * Anything not listed is owner-only. Fail closed: a section added later is
 * invisible until somebody makes a decision about it, rather than being
 * exposed to the whole shop by omission.
 */
export const SECTION_ACCESS: Record<string, Access[]> = {
  "": ALL,
  appointments: ALL,
  projects: ALL,
  vehicles: ALL,

  // Read-only for technicians (see READ_ONLY below) — they need owner names on
  // the cars they work on, and the picker in the vehicle form needs a list.
  customers: ALL,
  messages: OFFICE,
  reviews: OFFICE,
  invoices: OFFICE,

  inventory: SHOP,

  services: BOOKS,
  promos: BOOKS,
  payments: BOOKS,
  finance: BOOKS,
  activity: BOOKS,

  users: OWNER,
  staff: OWNER,
  settings: OWNER,
};

export function canSee(access: Access | null | undefined, slug: string): boolean {
  if (!access) return false;
  return (SECTION_ACCESS[slug] ?? OWNER).includes(access);
}

/**
 * Sections a role may open but not change. Mirrors 0008_customers_readonly.sql,
 * where `customers` carries a read policy for everyone and a write policy for
 * the office only.
 *
 * Kept as its own map rather than a third access tier: "can open" and "can
 * change" are different questions, and a tier list can only answer one of them.
 */
const READ_ONLY: Partial<Record<Access, string[]>> = {
  Technician: ["customers"],
};

/**
 * Whether a role may create, edit or delete in a section. Hides the New button,
 * the row actions, and the form's foreign-key picker — the database refuses the
 * write regardless, this just stops offering it.
 */
export function canEdit(access: Access | null | undefined, slug: string): boolean {
  if (!canSee(access, slug)) return false;
  return !READ_ONLY[access!]?.includes(slug);
}

/**
 * True when the role may see money. The dashboard's revenue tile and chart read
 * the payments table — without this they'd render a confident "$0" to a
 * technician instead of not being there at all.
 */
export const seesMoney = (access: Access | null | undefined) =>
  canSee(access, "payments");
