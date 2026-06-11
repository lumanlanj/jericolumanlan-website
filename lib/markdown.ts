import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

export type MarkdownFile = {
  slug: string;
  data: Record<string, unknown>;
  content: string;
};

/**
 * Read and front-matter-parse every `.md` file in a content directory (resolved
 * relative to the project root). A missing directory yields [] so the site
 * builds before any content exists. Callers handle validation and mapping.
 */
export async function readMarkdownDir(
  ...segments: string[]
): Promise<MarkdownFile[]> {
  const dir = path.join(process.cwd(), ...segments);
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const out: MarkdownFile[] = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    out.push({ slug: file.replace(/\.md$/, ""), data, content });
  }
  return out;
}
