import Parser from "rss-parser";
import type { TimelineItem } from "./types";

// Set NEXT_PUBLIC_SUBSTACK_URL (or replace the fallback) with your publication's
// base URL, e.g. "https://jericolumanlan.substack.com". We append "/feed".
const SUBSTACK_BASE =
  process.env.SUBSTACK_URL ??
  process.env.NEXT_PUBLIC_SUBSTACK_URL ??
  "https://producthousebyjerico.substack.com";

const SUBSTACK_FEED = `${SUBSTACK_BASE.replace(/\/$/, "")}/feed`;

const parser = new Parser({
  timeout: 5000,
  headers: { "User-Agent": "jericolumanlan-website/1.0" },
});

function excerptFromHtml(html: string | undefined, maxChars = 240): string {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;
}

export async function fetchSubstack(): Promise<TimelineItem[]> {
  try {
    const feed = await parser.parseURL(SUBSTACK_FEED);
    return (feed.items ?? [])
      .filter((item) => item.link && item.title && item.isoDate)
      .map((item) => {
        const raw =
          (item as { "content:encoded"?: string })["content:encoded"] ||
          item.content ||
          item.contentSnippet ||
          "";
        return {
          id: `substack:${item.guid ?? item.link}`,
          source: "substack" as const,
          type: "post" as const,
          title: item.title!,
          excerpt: excerptFromHtml(raw),
          url: item.link!,
          timestamp: new Date(item.isoDate!).toISOString(),
        };
      });
  } catch (err) {
    console.error("[substack] fetch failed:", (err as Error).message);
    return [];
  }
}
