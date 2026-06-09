import { Redis } from "@upstash/redis";

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
  visits: (vid: string) => `v:${vid}`,
  returning: "c:returning",
  recent: "recent:events",
} as const;

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
