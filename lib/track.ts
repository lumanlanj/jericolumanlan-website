import { sanitizeSourceLabel } from "./text";

// First-party, anonymous client tracking. A random per-browser id (no identity)
// is stored in localStorage so the backend can tell unique vs returning
// visitors. Events are sent fire-and-forget via sendBeacon (survives page
// unload), falling back to fetch+keepalive.

const VID_KEY = "sb_vid";
const OPTOUT_KEY = "sb_optout";

// Owner opt-out: when set, this browser is excluded from ALL analytics
// (first-party events, Clarity, and Vercel). Toggle it on the /optout page.
// Persists in localStorage until site data is cleared. Set once per browser.
export function isOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OPTOUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setOptedOut(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (value) localStorage.setItem(OPTOUT_KEY, "1");
    else localStorage.removeItem(OPTOUT_KEY);
  } catch {
    /* storage blocked */
  }
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id) {
      id =
        crypto.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return ""; // private mode / storage blocked → still counts as a pageview
  }
}

// Best-effort traffic source for a pageview. Prefers an explicit `utm_source`
// (set on links we post — reliable even when the browser strips the referrer,
// e.g. in-app social browsers), then falls back to a normalized referrer host.
// No referrer and no UTM → "direct". Same-site navigation also counts as direct.
function detectSource(): string {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) return sanitizeSourceLabel(utm);
    const ref = document.referrer;
    if (!ref) return "direct";
    const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    if (host === window.location.hostname) return "direct"; // internal nav
    if (/(^|\.)linkedin\.com$/.test(host) || host === "lnkd.in") return "linkedin";
    if (host === "x.com" || /(^|\.)twitter\.com$/.test(host) || host === "t.co") return "x";
    if (/(^|\.)google\./.test(host)) return "google";
    if (/(^|\.)facebook\.com$/.test(host) || host === "fb.com" || host === "fb.me") return "facebook";
    if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
    if (/(^|\.)reddit\.com$/.test(host)) return "reddit";
    if (/(^|\.)github\.com$/.test(host)) return "github";
    if (/(^|\.)bing\.com$/.test(host)) return "bing";
    if (/(^|\.)duckduckgo\.com$/.test(host)) return "duckduckgo";
    if (/(^|\.)substack\.com$/.test(host)) return "substack";
    if (/(^|\.)medium\.com$/.test(host)) return "medium";
    if (host === "news.ycombinator.com") return "hackernews";
    return host.slice(0, 32); // unknown site → show its bare domain
  } catch {
    return "direct";
  }
}

export function trackEvent(event: string): void {
  if (typeof window === "undefined") return;
  if (isOptedOut()) return; // owner-excluded browser
  const payload = JSON.stringify({
    event,
    vid: getVisitorId(),
    path: window.location.pathname,
    // Only pageviews carry a source; the backend attributes it on first visit.
    source: event === "pageview" ? detectSource() : undefined,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", payload);
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  // Keepalive lets the request outlive a navigation (e.g. resume download).
  fetch("/api/track", {
    method: "POST",
    body: payload,
    keepalive: true,
    headers: { "Content-Type": "application/json" },
  }).catch(() => {});
}
