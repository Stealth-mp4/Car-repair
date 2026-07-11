import type { MetadataRoute } from "next";
import { business, services } from "@/lib/site";
import { builds } from "@/lib/builds";

export default function sitemap(): MetadataRoute.Sitemap {
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
