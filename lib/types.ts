export type Source = "medium" | "github" | "log";

export type ItemType =
  | "post"
  | "release"
  | "commit_batch"
  | "repo"
  | "log_entry";

export type TimelineItem = {
  id: string;
  source: Source;
  type: ItemType;
  title: string;
  excerpt?: string;
  url: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

export type LogEntry = {
  slug: string;
  title: string;
  date: string;
  public: boolean;
  tags?: string[];
  body: string;
  excerpt: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  status: "live" | "wip" | "archived";
  links?: { label: string; url: string }[];
  order?: number;
  date: string;
  body: string;
};
