import { NextRequest } from "next/server";
import { redis, KEYS, RECENT_MAX } from "@/lib/analytics-redis";

// First-party stats read endpoint, polled by the SiteBar menu-bar app.
// Token-protected (?key=) so the counts aren't publicly scrapeable. Returns
// totals + unique/returning visitors + a recent anonymous event feed.
type RecentEvent = { event: string; path: string; country: string; ts: number };

export async function GET(req: NextRequest) {
  const expected = process.env.STATS_TOKEN;
  const provided = req.nextUrl.searchParams.get("key");
  // If a token is configured it must match. (No token set → open, for local dev.)
  if (expected && provided !== expected) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!redis) {
    return Response.json({
      configured: false,
      pageviews: 0,
      uniqueVisitors: 0,
      returningVisitors: 0,
      resumeDownloads: 0,
      scrollBottoms: 0,
      recent: [],
    });
  }

  const [pageviews, returning, resume, scroll, unique, recentRaw] =
    await Promise.all([
      redis.get<number>(KEYS.count("pageview")),
      redis.get<number>(KEYS.returning),
      redis.get<number>(KEYS.count("resume_download")),
      redis.get<number>(KEYS.count("scroll_bottom")),
      redis.pfcount(KEYS.uniqueHLL),
      redis.lrange(KEYS.recent, 0, RECENT_MAX - 1),
    ]);

  // Upstash auto-deserializes JSON, so entries may already be objects.
  const recent: RecentEvent[] = (recentRaw ?? [])
    .map((r) => {
      if (typeof r === "string") {
        try {
          return JSON.parse(r) as RecentEvent;
        } catch {
          return null;
        }
      }
      return r as unknown as RecentEvent;
    })
    .filter((r): r is RecentEvent => !!r);

  return Response.json(
    {
      configured: true,
      pageviews: pageviews ?? 0,
      uniqueVisitors: unique ?? 0,
      returningVisitors: returning ?? 0,
      resumeDownloads: resume ?? 0,
      scrollBottoms: scroll ?? 0,
      recent,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
