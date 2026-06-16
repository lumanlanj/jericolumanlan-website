import type { TimelineItem } from "./types";
import type { GhActivity } from "./githubEvents";

// Merges live GitHub activity + recent posts into the ticker feed, capped to the
// last 7 days, newest-first. Pure mapping — the GitHub fetch happens in
// lib/githubEvents (cached) and the writing feeds in the page, so this stays
// testable and the client ticker can be pure CSS.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type TickerItem = {
  icon: "commit" | "repo" | "star" | "pr" | "post" | "spark";
  verb: string;
  detail: string;
  url: string;
  time: string; // relative ("24m ago"), empty when not applicable
};

// Relative time, matching the prototype: minutes under an hour, hours under a
// day, then days.
function rel(ts: number, now: number): string {
  const d = now - ts;
  const m = Math.floor(d / 60000);
  const h = Math.floor(d / 3600000);
  const dy = Math.floor(d / 86400000);
  if (h < 1) return `${Math.max(1, m)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${dy}d ago`;
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

type Row = { ts: number; icon: TickerItem["icon"]; verb: string; detail: string; url: string };

export function buildTickerItems(
  writing: TimelineItem[],
  github: GhActivity[],
  now: number = Date.now(),
): TickerItem[] {
  const gh: Row[] = github.filter((it) => !Number.isNaN(it.ts) && now - it.ts <= WEEK_MS);

  const posts: Row[] = writing
    .map((p) => ({
      ts: new Date(p.timestamp).getTime(),
      icon: "post" as const,
      verb: "New post",
      detail: p.title,
      url: p.url,
    }))
    .filter((p) => !Number.isNaN(p.ts) && now - p.ts <= WEEK_MS);

  const merged = [...gh, ...posts].sort((a, b) => b.ts - a.ts);

  // Nothing fresh this week → a single self-deprecating fallback that points to
  // The Lab, so the strip is never empty/awkward.
  if (merged.length === 0) {
    return [
      {
        icon: "spark",
        verb: "Quiet week —",
        detail: "see what I'm building in The Lab",
        url: "#lab",
        time: "",
      },
    ];
  }

  return merged.map((it) => ({
    icon: it.icon,
    verb: it.verb,
    detail: trunc(it.detail, 58),
    url: it.url,
    time: rel(it.ts, now),
  }));
}
