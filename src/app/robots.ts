import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account and admin areas hold nothing useful to a crawler and would
      // otherwise waste crawl budget on redirect chains to the sign-in page.
      disallow: ["/admin", "/dashboard", "/login", "/signup", "/api/", "/search"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
