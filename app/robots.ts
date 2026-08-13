import type { MetadataRoute } from "next";
import { getShop } from "@/lib/shop";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { business } = await getShop();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/passport", "/passport/*", "/admin", "/admin/*"],
    },
    sitemap: `${business.url}/sitemap.xml`,
  };
}
