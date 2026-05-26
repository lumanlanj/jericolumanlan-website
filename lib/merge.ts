import type { TimelineItem } from "./types";

export const HOMEPAGE_PAGE_SIZE = 20;

export function mergeTimeline(
  sources: TimelineItem[][],
  limit: number = HOMEPAGE_PAGE_SIZE,
  cursor?: string
): { items: TimelineItem[]; nextCursor: string | null } {
  const all = sources.flat().sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const start = cursor ? all.findIndex((item) => item.id === cursor) + 1 : 0;
  const slice = all.slice(start, start + limit);
  const nextCursor = start + limit < all.length ? slice[slice.length - 1].id : null;

  return { items: slice, nextCursor };
}
