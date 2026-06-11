import type { TimelineItem } from "./types";
import { fetchRssFeed } from "./rss";

// Set NEXT_PUBLIC_SUBSTACK_URL (or replace the fallback) with your publication's
// base URL, e.g. "https://jericolumanlan.substack.com". We append "/feed".
const SUBSTACK_BASE =
  process.env.SUBSTACK_URL ??
  process.env.NEXT_PUBLIC_SUBSTACK_URL ??
  "https://producthousebyjerico.substack.com";

const SUBSTACK_FEED = `${SUBSTACK_BASE.replace(/\/$/, "")}/feed`;

export function fetchSubstack(): Promise<TimelineItem[]> {
  return fetchRssFeed("substack", SUBSTACK_FEED);
}
