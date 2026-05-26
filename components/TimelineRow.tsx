import { formatDistanceToNow, parseISO } from "date-fns";
import type { TimelineItem } from "@/lib/types";
import SourceBadge from "./SourceBadge";

export default function TimelineRow({ item }: { item: TimelineItem }) {
  const isExternal = !item.url.startsWith("/");
  const date = parseISO(item.timestamp);
  const relative = formatDistanceToNow(date, { addSuffix: true });
  const absolute = item.timestamp.slice(0, 10);

  return (
    <li className="py-3 border-b border-(--color-border) last:border-b-0">
      <a
        href={item.url}
        target={isExternal ? "_blank" : "_self"}
        rel={isExternal ? "noopener" : undefined}
        className="group flex items-baseline gap-3 no-underline"
      >
        <SourceBadge source={item.source} />
        <span className="text-(--color-ink) group-hover:opacity-60 transition flex-1 leading-snug">
          {item.title}
        </span>
        <time
          dateTime={item.timestamp}
          title={absolute}
          className="text-[12px] text-(--color-muted) tabular-nums whitespace-nowrap"
        >
          {relative}
        </time>
      </a>
    </li>
  );
}
