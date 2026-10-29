import type { MetadataRoute } from "next";
import { readLogEntries } from "@/lib/log";

// Generated at build time. Log posts are added via commit (which redeploys), so
// a build-time sitemap stays current; it scales automatically as posts land in
// content/log/. Submit https://jericolumanlan.com/sitemap.xml in Search Console.
const SITE_URL = "https://jericolumanlan.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await readLogEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/log`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/design`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const logRoutes: MetadataRoute.Sitemap = entries.map((e) => ({
    url: `${SITE_URL}/log/${e.slug}`,
    lastModified: new Date(e.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...logRoutes];
}
