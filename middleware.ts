import { NextRequest, NextResponse } from "next/server";
import { clientIp, isOwnerIp, OWNER_COOKIE } from "@/lib/owner-ip";

// Keep Clarity / Vercel Analytics off for OWNER_IPS without making the root
// layout dynamic (headers() in layout would force that). Cookie is synced to
// the current request IP on every navigation — set when matched, cleared
// otherwise — so a café visit after home Wi‑Fi does not stay excluded.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const owner = isOwnerIp(clientIp(req.headers));
  if (owner) {
    res.cookies.set(OWNER_COOKIE, "1", {
      path: "/",
      sameSite: "lax",
      // Short TTL; middleware refreshes it on each request while still on-network.
      maxAge: 60 * 60,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });
  } else if (req.cookies.get(OWNER_COOKIE)) {
    res.cookies.set(OWNER_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });
  }
  return res;
}

export const config = {
  // Skip Next internals and static assets — no analytics init there anyway.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
