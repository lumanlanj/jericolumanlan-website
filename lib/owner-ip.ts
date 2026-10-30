// Owner-network detection shared by Edge middleware and /api/track.
// Kept free of Redis / Node-only imports so middleware can bundle it.

// Cookie set by middleware when the request IP matches OWNER_IPS. Non-httpOnly
// so client analytics (Clarity, Vercel) can skip init without headers() in the
// root layout (which would force the whole site dynamic).
export const OWNER_COOKIE = "sb_owner";

// Owner IPs/prefixes excluded from analytics (comma-separated OWNER_IPS env
// var). Entries may be a full IPv4/IPv6 address OR an IPv6 /64 network prefix
// (first four hextets, e.g. "2600:4040:5c78:d900"), which matches all devices
// on that network even as the rotating /128 suffix changes.
export const OWNER_IPS = new Set(
  (process.env.OWNER_IPS ?? "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean),
);

// Best-effort client IP from the edge headers Vercel sets. x-forwarded-for is a
// comma-separated chain; the first entry is the original client.
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "";
}

// True if the IP is the owner's: exact match, or its IPv6 /64 prefix (first
// four hextets) matches a prefix entry. Compressed "::" forms are skipped for
// the prefix check — Vercel delivers fully-expanded addresses here.
export function isOwnerIp(ip: string): boolean {
  if (!ip || OWNER_IPS.size === 0) return false;
  if (OWNER_IPS.has(ip)) return true;
  if (ip.includes(":")) {
    const groups = ip.split(":");
    if (groups.length >= 4 && !groups.slice(0, 4).some((g) => g === "")) {
      return OWNER_IPS.has(groups.slice(0, 4).join(":"));
    }
  }
  return false;
}
