// First-party, anonymous client tracking. A random per-browser id (no identity)
// is stored in localStorage so the backend can tell unique vs returning
// visitors. Events are sent fire-and-forget via sendBeacon (survives page
// unload), falling back to fetch+keepalive.

const VID_KEY = "sb_vid";

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

export function trackEvent(event: string): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    event,
    vid: getVisitorId(),
    path: window.location.pathname,
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
