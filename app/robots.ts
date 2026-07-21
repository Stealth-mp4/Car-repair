import type { MetadataRoute } from "next";
import { business } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/passport", "/passport/*"] },
    sitemap: `${business.url}/sitemap.xml`,
  };
}
