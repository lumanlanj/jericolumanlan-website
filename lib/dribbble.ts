import { promises as fs } from "fs";
import path from "path";

export type Shot = {
  id: number;
  title: string;
  url: string;
  publishedAt: string | null;
  image: string | null;
  video: string | null;
};

// Reads the static shots synced by scripts/sync-dribbble.mjs.
// Re-run that script to refresh after posting new work on Dribbble.
export async function readShots(): Promise<Shot[]> {
  try {
    const file = path.join(process.cwd(), "content", "dribbble.json");
    const raw = await fs.readFile(file, "utf8");
    const shots = JSON.parse(raw) as Shot[];
    // Keep only shots that actually have media.
    return shots.filter((s) => s.image || s.video);
  } catch {
    return [];
  }
}
