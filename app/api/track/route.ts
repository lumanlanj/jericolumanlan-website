import { NextRequest } from "next/server";
import {
  redis,
  KEYS,
  ALLOWED_EVENTS,
  RECENT_MAX,
  VISIT_TTL_SECONDS,
} from "@/lib/analytics-redis";

// First-party event ingest. The site POSTs anonymous events here:
//   { event: "resume_download" | "scroll_bottom" | "pageview", vid: "<uuid>", path: "/" }
// No identity is stored — `vid` is a random per-browser token used only to
// distinguish unique vs returning visitors. Coarse country comes from Vercel's
// edge header. Always returns 204 quickly (fire-and-forget from the client).
export async function POST(req: NextRequest) {
  // No store configured yet → accept and drop, so the site works pre-Upstash.
  if (!redis) return new Response(null, { status: 204 });

  let body: { event?: string; vid?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const event = String(body.event ?? "");
  if (!ALLOWED_EVENTS.has(event)) return new Response(null, { status: 204 });

  const vid = (body.vid ?? "").slice(0, 64);
  const path = (body.path ?? "/").slice(0, 256);
  const country = req.headers.get("x-vercel-ip-country") ?? "??";
  const day = new Date().toISOString().slice(0, 10);

  try {
    const p = redis.pipeline();
    p.incr(KEYS.count(event));
    p.incr(KEYS.countDay(event, day));
    p.lpush(
      KEYS.recent,
      JSON.stringify({ event, path, country, ts: Date.now() }),
    );
    p.ltrim(KEYS.recent, 0, RECENT_MAX - 1);

    // Visitor uniqueness + returning detection (pageviews only).
    if (event === "pageview" && vid) {
      p.pfadd(KEYS.uniqueHLL, vid);
      p.incr(KEYS.visits(vid));
      p.expire(KEYS.visits(vid), VISIT_TTL_SECONDS);
    }
    const results = await p.exec();

    // If this pageview's visit count just became 2, it's a newly-returning
    // visitor — bump the returning counter exactly once.
    if (event === "pageview" && vid) {
      const visitCount = Number(results[results.length - 2]); // incr v:<vid>
      if (visitCount === 2) await redis.incr(KEYS.returning);
    }
  } catch {
    // Never fail the client on a tracking hiccup.
  }
  return new Response(null, { status: 204 });
}
