import type { LogEntry, TimelineItem } from "./types";
import { readMarkdownDir } from "./markdown";
import { excerpt, normalizeDate } from "./text";

export async function readLogEntries(): Promise<LogEntry[]> {
  const files = await readMarkdownDir("content", "log");

  const entries: LogEntry[] = [];
  for (const { slug, data, content } of files) {
    // Privacy gate: only entries with explicit public:true surface
    if (data.public !== true) continue;
    if (!data.title || !data.date) continue;

    entries.push({
      slug,
      title: String(data.title),
      date: normalizeDate(data.date),
      public: true,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      body: content,
      excerpt: excerpt(content),
    });
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function logTimelineItems(): Promise<TimelineItem[]> {
  const entries = await readLogEntries();
  return entries.map((e) => ({
    id: `log:${e.slug}`,
    source: "log",
    type: "log_entry",
    title: e.title,
    excerpt: e.excerpt,
    url: `/log/${e.slug}`,
    timestamp: new Date(e.date).toISOString(),
  }));
}
