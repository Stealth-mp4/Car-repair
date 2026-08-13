import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSection } from "@/lib/admin/sections";
import { canSee } from "@/lib/admin/access";
import { currentStaff } from "@/lib/supabase/server";
import DataTable from "@/components/admin/DataTable";

type Params = Promise<{ section: string }>;

/**
 * Never prerendered. These pages used to be built with `generateStaticParams`,
 * which baked the build-time store contents — the seed fixtures — into static
 * HTML. Every visit served those rows first and swapped in the real ones after
 * hydration, so /admin/customers visibly flashed invented people.
 *
 * Nothing here is cacheable anyway: the rows are per-shop, live, and filtered
 * by the viewer's role.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { section } = await params;
  return { title: getSection(section)?.table?.title ?? "Not found" };
}

export default async function SectionPage({ params }: { params: Params }) {
  const { section } = await params;
  const def = getSection(section);
  if (!def?.table) notFound();

  // Hiding the sidebar link isn't a guard — someone can type the URL, or
  // follow a bookmark from before their role changed. Quiet redirect rather
  // than an explanation, so the section reads as simply not theirs.
  const me = await currentStaff();
  if (!canSee(me?.access, def.slug)) redirect("/admin");

  return <DataTable slug={def.slug} />;
}
