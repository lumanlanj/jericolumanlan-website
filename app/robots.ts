import type { MetadataRoute } from "next";

const SITE_URL = "https://jericolumanlan.com";

// Allow everything except utility routes: /optout (tracking opt-out UI) and /r/*
// (the résumé-download redirect/tracker). Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/optout", "/r/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
