import type { TimelineItem } from "./types";

// Normalize a title for cross-post matching: lowercase, collapse whitespace,
// strip surrounding punctuation. Conservative — only exact (normalized) matches
// are treated as the same piece, so genuinely distinct posts are never dropped.
function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^[\s"'“”‘’.,:;–—-]+|[\s"'“”‘’.,:;–—-]+$/g, "")
    .trim();
}

/**
 * Merge writing sources newest-first, de-duplicating cross-posts: when the same
 * title appears on both Substack and Medium, the Substack copy wins and the
 * Medium one is dropped.
 */
export function mergeWriting(
  medium: TimelineItem[],
  substack: TimelineItem[]
): TimelineItem[] {
  const substackTitles = new Set(substack.map((i) => normalizeTitle(i.title)));
  const dedupedMedium = medium.filter(
    (i) => !substackTitles.has(normalizeTitle(i.title))
  );
  return [...substack, ...dedupedMedium].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );
}
