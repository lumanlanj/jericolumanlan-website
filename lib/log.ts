import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { LogEntry, TimelineItem } from "./types";

const LOG_DIR = path.join(process.cwd(), "content", "log");

function normalizeDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function excerptOf(body: string, maxChars = 240): string {
  const stripped = body.replace(/\s+/g, " ").trim();
  return stripped.length > maxChars ? stripped.slice(0, maxChars - 1) + "…" : stripped;
}

export async function readLogEntries(): Promise<LogEntry[]> {
  let files: string[];
  try {
    files = await fs.readdir(LOG_DIR);
  } catch {
    return [];
  }

  const entries: LogEntry[] = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const raw = await fs.readFile(path.join(LOG_DIR, file), "utf8");
    const { data, content } = matter(raw);

    // Privacy gate: only entries with explicit public:true surface
    if (data.public !== true) continue;

    if (!data.title || !data.date) continue;

    const slug = file.replace(/\.md$/, "");
    entries.push({
      slug,
      title: String(data.title),
      date: normalizeDate(data.date),
      public: true,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      body: content,
      excerpt: excerptOf(content),
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
