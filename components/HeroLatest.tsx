"use client";

import { useEffect, useState } from "react";

export type LatestItem = { type: string; title: string; url: string; date: string };

const WINDOW_DAYS = 7;

function daysSince(dateStr: string): number {
  const then = new Date(dateStr + "T12:00:00").getTime();
  if (Number.isNaN(then)) return Infinity;
  return Math.floor((Date.now() - then) / 86400000);
}

const rel = (d: number) => (d <= 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`);

/**
 * Hero "Latest" strip — a 7-day recency signal under the lede. Shows a pill per
 * item published within the last week (newest first); renders nothing when none
 * are fresh, so it self-expires as content ages. Recency is computed on the
 * client (Date.now), so it's empty on first paint and fills after mount — which
 * also avoids any SSR/CSR date mismatch.
 */
export default function HeroLatest({ items }: { items: LatestItem[] }) {
  const [fresh, setFresh] = useState<(LatestItem & { _days: number })[]>([]);

  useEffect(() => {
    setFresh(
      items
        .map((it) => ({ ...it, _days: daysSince(it.date) }))
        .filter((it) => it._days <= WINDOW_DAYS)
        .sort((a, b) => a._days - b._days)
    );
  }, [items]);

  if (!fresh.length) return null;

  return (
    <div className="hero-latest-list">
      {fresh.map((it) => {
        const external = /^https?:/i.test(it.url);
        return (
          <a
            key={it.url + it.date}
            className="hero-latest"
            href={it.url || "#writing"}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener" : undefined}
          >
            <span className="hl-tag">
              <span className="hl-pulse" aria-hidden="true"></span>
              {it.type}
            </span>
            <span className="hl-body">
              <span className="hl-time">
                <time dateTime={it.date}>{rel(it._days)}</time>
              </span>
              <span className="hl-title">{it.title}</span>
              <span className="hl-arrow" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
