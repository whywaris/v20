import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/auth/", "/login", "/account", "/saved", "/ask", "/*?*page="],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
