import { Fragment } from "react";
import type { TickerItem } from "@/lib/ticker";

/**
 * Fixed top "activity ticker" — a stock-ticker strip of recent GitHub activity
 * and posts (last 7 days), pinned above the nav. Server-rendered and animated
 * purely in CSS (seamless -50% scroll, pause on hover, off under reduced-motion),
 * so there's no client JS, no GitHub rate-limit, and no hydration drift.
 */

function Icon({ name }: { name: TickerItem["icon"] }) {
  switch (name) {
    case "commit":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="8" cy="8" r="2.5" />
          <path d="M0.8 8h4.7M10.5 8h4.7" />
        </svg>
      );
    case "repo":
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M3.5 1A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15H13a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H4a.5.5 0 0 1 0-1h9a.5.5 0 0 0 .5-.5v-9A1.5 1.5 0 0 0 12 1H3.5z" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1.2l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.9 4.2 13l.7-4.3-3.1-3 4.3-.6L8 1.2z" />
        </svg>
      );
    case "pr":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <circle cx="4" cy="4" r="1.7" />
          <circle cx="4" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <path d="M4 5.7v4.6M12 10.3V8A2.5 2.5 0 0 0 9.5 5.5H7M9 3.5 7 5.5 9 7.5" />
        </svg>
      );
    case "post":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M10.8 1.7l3.5 3.5L5 14.5l-3.6.6.6-3.6 8.8-9.8zM9 3.5 12.5 7" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0l1.1 5L14 4.2l-3.3 3.8L14 11.8 9.1 11 8 16l-1.1-5L2 11.8l3.3-3.8L2 4.2 6.9 5 8 0z" />
        </svg>
      );
  }
}

function Row({ item, k }: { item: TickerItem; k: string }) {
  const external = !item.url.startsWith("#");
  return (
    <Fragment key={k}>
      <a
        className="tick-item"
        href={item.url}
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
      >
        <span className="tick-ico">
          <Icon name={item.icon} />
        </span>
        <span className="tick-verb">{item.verb}</span>
        <span className="tick-detail">{item.detail}</span>
        {item.time ? <span className="tick-time">{item.time}</span> : null}
      </a>
      <span className="tick-sep" aria-hidden="true">
        ◆
      </span>
    </Fragment>
  );
}

export default function ActivityTicker({ items }: { items: TickerItem[] }) {
  if (!items.length) return null;

  // Duration scales with item count; the track is rendered twice for a seamless
  // -50% loop.
  const durationSeconds = Math.max(26, items.length * 7);

  return (
    <div className="ticker" id="ticker" aria-label="Recent activity — past week">
      <span className="ticker-label">
        <span className="dot" aria-hidden="true" />
        <span className="lbl-txt">Latest</span>
      </span>
      <div className="ticker-viewport">
        <span className="ticker-edge l" aria-hidden="true" />
        <div
          className="ticker-track"
          style={{ "--ticker-dur": `${durationSeconds}s` } as React.CSSProperties}
        >
          {items.map((item, i) => (
            <Row item={item} k={`a${i}`} key={`a${i}`} />
          ))}
          {items.map((item, i) => (
            <Row item={item} k={`b${i}`} key={`b${i}`} />
          ))}
        </div>
        <span className="ticker-edge r" aria-hidden="true" />
      </div>
    </div>
  );
}
