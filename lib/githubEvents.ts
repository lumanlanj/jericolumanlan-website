// Live GitHub activity for the ticker — the public events API, no auth required.
// Fetched server-side and cached for 5 minutes (Next Data Cache) so we stay well
// under GitHub's ~60 req/hr unauthenticated limit (≈12 calls/hr regardless of
// traffic) while staying current. This is the same data source the design
// prototype used, but moved off the visitor's browser onto the server.

const GH_USER = "lumanlanj";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const EVENTS_URL = `https://api.github.com/users/${GH_USER}/events/public?per_page=40`;
const CACHE_SECONDS = 300;

export type GhActivity = {
  ts: number;
  icon: "commit" | "repo" | "star" | "pr" | "spark";
  verb: string;
  detail: string;
  url: string;
};

type GhEvent = {
  type: string;
  created_at: string;
  repo?: { name?: string };
  payload?: {
    commits?: unknown[];
    ref_type?: string;
    action?: string;
    pull_request?: { merged?: boolean };
    release?: { tag_name?: string };
  };
};

// Map a raw GitHub event to a ticker row, or null to skip it. Mirrors the
// prototype's event handling (push / create / public / star / fork / PR / release).
function mapEvent(ev: GhEvent, now: number): GhActivity | null {
  const ts = new Date(ev.created_at).getTime();
  if (Number.isNaN(ts) || now - ts > WEEK_MS) return null;

  const full = ev.repo?.name ?? "";
  const repo = full ? full.split("/").pop() ?? full : "";
  const url = full ? `https://github.com/${full}` : `https://github.com/${GH_USER}`;

  switch (ev.type) {
    case "PushEvent": {
      const n = ev.payload?.commits?.length ?? 1;
      return { ts, icon: "commit", verb: "Pushed", detail: `${n} commit${n !== 1 ? "s" : ""} → ${repo}`, url };
    }
    case "CreateEvent":
      if (ev.payload?.ref_type === "repository") {
        return { ts, icon: "repo", verb: "Created", detail: repo, url };
      }
      return null;
    case "PublicEvent":
      return { ts, icon: "repo", verb: "Open-sourced", detail: repo, url };
    case "WatchEvent":
      return { ts, icon: "star", verb: "Starred", detail: repo, url };
    case "ForkEvent":
      return { ts, icon: "repo", verb: "Forked", detail: repo, url };
    case "PullRequestEvent": {
      const merged = ev.payload?.action === "closed" && ev.payload?.pull_request?.merged;
      return { ts, icon: "pr", verb: merged ? "Merged PR →" : "Opened PR →", detail: repo, url };
    }
    case "ReleaseEvent": {
      const tag = ev.payload?.release?.tag_name;
      return { ts, icon: "spark", verb: "Released", detail: (tag ? `${tag} · ` : "") + repo, url };
    }
    default:
      return null;
  }
}

export async function fetchGitHubEvents(now: number = Date.now()): Promise<GhActivity[]> {
  try {
    const res = await fetch(EVENTS_URL, {
      // GitHub rejects requests without a User-Agent; Accept pins the API version.
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "jericolumanlan.com",
      },
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) {
      console.warn("[github-events] non-OK status:", res.status);
      return [];
    }
    const events: unknown = await res.json();
    if (!Array.isArray(events)) return [];
    return (events as GhEvent[])
      .map((e) => mapEvent(e, now))
      .filter((x): x is GhActivity => x !== null);
  } catch (err) {
    console.error("[github-events] fetch failed:", (err as Error).message);
    return [];
  }
}
