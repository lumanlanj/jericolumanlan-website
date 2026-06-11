import Parser from "rss-parser";
import type { Source, TimelineItem } from "./types";
import { excerptFromHtml } from "./text";

const parser = new Parser({
  timeout: 5000,
  headers: { "User-Agent": "jericolumanlan-website/1.0" },
});

// Sources backed by an RSS/Atom feed of written posts.
type FeedSource = Extract<Source, "medium" | "substack">;

/**
 * Fetch an RSS/Atom feed and map each item to a `post` TimelineItem. Network or
 * parse failures are logged and swallowed (returns []) so a single dead feed
 * never breaks the page that aggregates it.
 */
export async function fetchRssFeed(
  source: FeedSource,
  feedUrl: string
): Promise<TimelineItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items ?? [])
      .filter((item) => item.link && item.title && item.isoDate)
      .map((item) => {
        const raw =
          (item as { "content:encoded"?: string })["content:encoded"] ||
          item.content ||
          item.contentSnippet ||
          "";
        return {
          id: `${source}:${item.guid ?? item.link}`,
          source,
          type: "post" as const,
          title: item.title!,
          excerpt: excerptFromHtml(raw),
          url: item.link!,
          timestamp: new Date(item.isoDate!).toISOString(),
        };
      });
  } catch (err) {
    console.error(`[${source}] fetch failed:`, (err as Error).message);
    return [];
  }
}
