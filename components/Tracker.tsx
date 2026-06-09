"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track";

// Records a pageview on every route change, and a one-per-page scroll_bottom
// when the visitor reaches (near) the end of the page. Mounted once in the root
// layout, so it covers every page.
export default function Tracker() {
  const pathname = usePathname();

  // Pageview per path.
  useEffect(() => {
    trackEvent("pageview");
  }, [pathname]);

  // Scroll-to-bottom, deduped per path per session.
  useEffect(() => {
    const sentinelKey = `sb_bottom:${pathname}`;
    let fired = false;
    try {
      fired = sessionStorage.getItem(sentinelKey) === "1";
    } catch {
      /* storage blocked — we'll just allow a re-fire, harmless */
    }
    if (fired) return;

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const full = document.documentElement.scrollHeight;
      // within 64px of the bottom counts as "reached the bottom"
      if (scrolled >= full - 64) {
        trackEvent("scroll_bottom");
        try {
          sessionStorage.setItem(sentinelKey, "1");
        } catch {
          /* ignore */
        }
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // catch short pages already at the bottom
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
