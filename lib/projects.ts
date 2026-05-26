import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function normalizeDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

export async function readProjects(): Promise<Project[]> {
  let files: string[];
  try {
    files = await fs.readdir(PROJECTS_DIR);
  } catch {
    return [];
  }

  const projects: Project[] = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const raw = await fs.readFile(path.join(PROJECTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    if (!data.title || !data.description || !data.status || !data.date) continue;

    projects.push({
      slug: file.replace(/\.md$/, ""),
      title: String(data.title),
      description: String(data.description),
      status: data.status as Project["status"],
      links: Array.isArray(data.links) ? data.links : undefined,
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
