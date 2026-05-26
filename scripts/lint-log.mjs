#!/usr/bin/env node
// Fails the build if any content/log/*.md file lacks an explicit `public:` flag in frontmatter.
// Default-deny is enforced in code, but this catches "I meant public:true but forgot to add it"
// at PR time instead of post-merge.

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const LOG_DIR = path.join(process.cwd(), "content", "log");

async function main() {
  let files;
  try {
    files = await fs.readdir(LOG_DIR);
  } catch {
    console.log("[lint-log] no content/log dir — nothing to lint");
    return;
  }

  const errors = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const full = path.join(LOG_DIR, file);
    const raw = await fs.readFile(full, "utf8");
    const { data } = matter(raw);

    if (!("public" in data)) {
      errors.push(`${file}: missing required frontmatter key "public" (true or false)`);
      continue;
    }
    if (typeof data.public !== "boolean") {
      errors.push(
        `${file}: frontmatter "public" must be a boolean, got ${typeof data.public}`
      );
    }
    if (!data.title) errors.push(`${file}: missing required frontmatter key "title"`);
    if (!data.date) errors.push(`${file}: missing required frontmatter key "date"`);
  }

  if (errors.length > 0) {
    console.error("Log frontmatter lint failed:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`[lint-log] OK — ${files.filter((f) => f.endsWith(".md")).length} entries checked`);
}

main().catch((e) => {
  console.error("[lint-log] unexpected:", e);
  process.exit(1);
});
