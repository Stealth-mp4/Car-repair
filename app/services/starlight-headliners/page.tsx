import type { Metadata } from "next";
import ServiceLanding from "@/components/sections/ServiceLanding";
import { getServicePage } from "@/lib/servicePages";

const content = getServicePage("starlight-headliners")!;

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function StarlightHeadlinersPage() {
  return <ServiceLanding content={content} />;
}
