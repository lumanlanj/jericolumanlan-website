import { NextRequest, NextResponse } from "next/server";
import { redis, KEYS, RECENT_MAX } from "@/lib/analytics-redis";

const RESUME_PATH = "/Jerico-Lumanlan-Resume.pdf";

// Tracked resume share links: give a specific recipient a link like
//   https://jericolumanlan.com/r/stripe-jane
// A hit logs which slug was opened (so you know which link you sent was used),
// counts it toward the resume-download total, then redirects to the PDF.
// This is logged server-side (trusted) rather than via /api/track.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const clean = slug.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || "unknown";

  if (redis) {
    const country = req.headers.get("x-vercel-ip-country") ?? "??";
    try {
      const p = redis.pipeline();
      p.incr(KEYS.count("resume_link"));
      p.incr(KEYS.count(`resume_link:${clean}`));
      p.incr(KEYS.count("resume_download")); // tracked opens count as downloads
      p.lpush(
        KEYS.recent,
        JSON.stringify({
          event: `resume_link:${clean}`,
          path: `/r/${clean}`,
          country,
          ts: Date.now(),
        }),
      );
      p.ltrim(KEYS.recent, 0, RECENT_MAX - 1);
      await p.exec();
    } catch {
      /* never block the redirect on a tracking hiccup */
    }
  }

  return NextResponse.redirect(new URL(RESUME_PATH, req.nextUrl.origin), 302);
}
