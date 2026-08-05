import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSection, sections } from "@/lib/admin/sections";
import DataTable from "@/components/admin/DataTable";

type Params = Promise<{ section: string }>;

/**
 * Pre-render every table section. `/admin/settings` and `/admin/appointments`
 * have their own static routes (a settings panel and a calendar/list toggle),
 * so they must not also be generated here.
 */
const OWN_ROUTE = new Set(["settings", "appointments"]);

export function generateStaticParams() {
  return sections
    .filter((s) => s.table && !OWN_ROUTE.has(s.slug))
    .map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { section } = await params;
  return { title: getSection(section)?.table?.title ?? "Not found" };
}

export default async function SectionPage({ params }: { params: Params }) {
  const { section } = await params;
  const def = getSection(section);
  if (!def?.table) notFound();
  return <DataTable slug={def.slug} />;
}
