import { Redis } from "@upstash/redis";
import { sanitizeSourceLabel } from "./text";

// Single Redis client for first-party event tracking, or null when no store is
// configured — so the site builds and runs fine before Upstash is provisioned.
// Reads both the Upstash-native env names and Vercel KV marketplace names.
function makeClient(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const redis: Redis | null = makeClient();

// Keys. Counters are plain INCR; uniques use a HyperLogLog (bounded memory);
// per-visitor visit counts drive returning-visitor detection.
export const KEYS = {
  count: (event: string) => `c:${event}`,
  countDay: (event: string, day: string) => `c:${event}:${day}`,
  uniqueHLL: "hll:visitors",
  // Per-day visitor HyperLogLog, keyed by ET calendar date (YYYY-MM-DD). Lets the
  // stats endpoint merge any date range (e.g. a Mon–Sun week) via PFCOUNT of the
  // day keys. Forward-looking: only days recorded after this shipped have data.
  uniqueHLLDay: (day: string) => `hll:visitors:${day}`,
  visits: (vid: string) => `v:${vid}`,
  returning: "c:returning",
  recent: "recent:events",
  sources: "h:sources", // hash: source label → first-visit count
} as const;

// HLL day keys expire well after any window we report on, to bound memory.
export const HLL_DAY_TTL_SECONDS = 60 * 60 * 24 * 70; // 70 days

// Today's calendar date in America/New_York (Jerico's timezone) as YYYY-MM-DD.
// en-CA formats as ISO date. Used to key the per-day visitor HLL consistently
// with the Mon–Sun week math below.
export function etDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// The seven ET calendar dates (YYYY-MM-DD, Mon→Sun) of the most recently
// *completed* Monday–Sunday week. On a Monday this is the week that just ended
// (e.g. 2026-06-15 → 2026-06-08 … 2026-06-14).
export function lastCompleteWeekDaysET(now: Date = new Date()): string[] {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const get = (t: string) => parts.find((x) => x.type === t)!.value;
  const y = +get("year"), m = +get("month"), d = +get("day");
  const dow = ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[get("weekday")];
  // Noon-UTC anchor on the ET date → whole-day arithmetic is DST-safe.
  const anchor = new Date(Date.UTC(y, m - 1, d, 12));
  const sinceMon = (dow + 6) % 7; // Mon→0 … Sun→6
  const mon = new Date(anchor);
  mon.setUTCDate(anchor.getUTCDate() - sinceMon - 7);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setUTCDate(mon.getUTCDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

// The last `n` ET calendar dates (YYYY-MM-DD, oldest→newest) ending *today*
// (inclusive) — a rolling window. n=7 → today plus the previous six days, so
// "the past week" reflects current traffic instead of lagging behind a
// completed Mon–Sun week. DST-safe via a noon-UTC anchor on the ET date.
export function lastNDaysET(n: number, now: Date = new Date()): string[] {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((x) => x.type === t)!.value;
  const y = +get("year"), m = +get("month"), d = +get("day");
  // Noon-UTC anchor on today's ET date → whole-day arithmetic is DST-safe.
  const anchor = new Date(Date.UTC(y, m - 1, d, 12));
  return Array.from({ length: n }, (_, i) => {
    const x = new Date(anchor);
    x.setUTCDate(anchor.getUTCDate() - (n - 1 - i));
    return x.toISOString().slice(0, 10);
  });
}

// Normalize a client-supplied source label to a safe, bounded token before it
// becomes a Redis hash field. Anything empty/garbage collapses to "direct".
export const cleanSource = sanitizeSourceLabel;

// Events the tracker is allowed to record. Anything else is dropped so a bad
// or spoofed payload can't pollute the counters. `resume_link:*` (tracked
// share links) is matched by prefix in the route.
export const ALLOWED_EVENTS = new Set([
  "pageview",
  "scroll_bottom",
  "resume_download",
]);

export const RECENT_MAX = 50;
export const VISIT_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

// Owner IPs/prefixes excluded from analytics server-side (comma-separated
// OWNER_IPS env var). Unlike the per-browser /optout localStorage flag, this
// drops events from every browser, device, and incognito session on these
// networks — no per-device setup. Entries may be a full IPv4/IPv6 address OR an
// IPv6 /64 network prefix (first four hextets, e.g. "2600:4040:5c78:d900"),
// which matches all devices on that network even as the rotating /128 suffix
// changes. IPs can drift (mobile/travel/ISP), so this complements /optout
// rather than replacing it.
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
