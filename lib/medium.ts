import Parser from "rss-parser";
import type { TimelineItem } from "./types";

const MEDIUM_FEED = "https://jericolumanlan.medium.com/feed";

const parser = new Parser({
  timeout: 5000,
  headers: { "User-Agent": "jericolumanlan-website/1.0" },
});

function excerptFromHtml(html: string | undefined, maxChars = 240): string {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;
}

export async function fetchMedium(): Promise<TimelineItem[]> {
  try {
    const feed = await parser.parseURL(MEDIUM_FEED);
    return (feed.items ?? [])
      .filter((item) => item.link && item.title && item.isoDate)
      .map((item) => {
        const raw =
          (item as { "content:encoded"?: string })["content:encoded"] ||
          item.content ||
          item.contentSnippet ||
          "";
        return {
          id: `medium:${item.guid ?? item.link}`,
          source: "medium" as const,
          type: "post" as const,
          title: item.title!,
          excerpt: excerptFromHtml(raw),
          url: item.link!,
          timestamp: new Date(item.isoDate!).toISOString(),
        };
      });
  } catch (err) {
    console.error("[medium] fetch failed:", (err as Error).message);
    return [];
  }
}
