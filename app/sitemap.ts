import type { MetadataRoute } from "next";
import { services } from "@/lib/site";
import { getShop } from "@/lib/shop";
import { builds } from "@/lib/builds";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { business } = await getShop();
  const base = business.url;

  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/gallery",
    "/tesla",
    "/financing",
    "/quote",
    "/services",
    "/promos",
  ].map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" as const, priority: 0.7 }));

  const serviceRoutes = services.map((s) => ({
    url: `${base}${s.href}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const buildRoutes = builds.map((b) => ({
    url: `${base}/gallery/${b.slug}`,
    lastModified: new Date(b.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...buildRoutes];
}
