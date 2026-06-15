import { NextRequest } from "next/server";
import {
  redis,
  KEYS,
  RECENT_MAX,
  lastCompleteWeekDaysET,
} from "@/lib/analytics-redis";

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
      uniqueVisitors7d: 0,
      returningVisitors: 0,
      resumeDownloads: 0,
      scrollBottoms: 0,
      recent: [],
      sources: [],
    });
  }

  // Unique visitors over the last complete Mon–Sun week = cardinality of the
  // union of that week's seven per-day HLLs (PFCOUNT merges multiple keys).
  const weekKeys = lastCompleteWeekDaysET().map(KEYS.uniqueHLLDay);

  const [
    pageviews,
    returning,
    resume,
    scroll,
    unique,
    unique7d,
    recentRaw,
    sourcesRaw,
  ] = await Promise.all([
    redis.get<number>(KEYS.count("pageview")),
    redis.get<number>(KEYS.returning),
    redis.get<number>(KEYS.count("resume_download")),
    redis.get<number>(KEYS.count("scroll_bottom")),
    redis.pfcount(KEYS.uniqueHLL),
    redis.pfcount(...(weekKeys as [string, ...string[]])),
    redis.lrange(KEYS.recent, 0, RECENT_MAX - 1),
    redis.hgetall<Record<string, string | number>>(KEYS.sources),
  ]);

  // First-visit counts per traffic source, biggest first.
  const sources = Object.entries(sourcesRaw ?? {})
    .map(([source, count]) => ({ source, count: Number(count) || 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

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
      uniqueVisitors7d: unique7d ?? 0,
      returningVisitors: returning ?? 0,
      resumeDownloads: resume ?? 0,
      scrollBottoms: scroll ?? 0,
      recent,
      sources,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
