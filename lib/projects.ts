import type { Project } from "./types";
import { readMarkdownDir } from "./markdown";
import { normalizeDate } from "./text";

export async function readProjects(): Promise<Project[]> {
  const files = await readMarkdownDir("content", "projects");

  const projects: Project[] = [];
  for (const { slug, data, content } of files) {
    if (!data.title || !data.description || !data.status || !data.date) continue;

    projects.push({
      slug,
      title: String(data.title),
      description: String(data.description),
      highlights: Array.isArray(data.highlights)
        ? data.highlights.map(String)
        : undefined,
      status: data.status as Project["status"],
      links: Array.isArray(data.links)
        ? (data.links as Project["links"])
        : undefined,
      order: typeof data.order === "number" ? data.order : undefined,
      date: normalizeDate(data.date),
      body: content,
    });
  }

  return projects.sort((a, b) => {
    const ao = a.order ?? 999;
    const bo = b.order ?? 999;
    if (ao !== bo) return ao - bo;
    return b.date.localeCompare(a.date);
  });
}
