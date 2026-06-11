import type { TimelineItem } from "./types";
import { fetchRssFeed } from "./rss";

const MEDIUM_FEED = "https://jericolumanlan.medium.com/feed";

export function fetchMedium(): Promise<TimelineItem[]> {
  return fetchRssFeed("medium", MEDIUM_FEED);
}
