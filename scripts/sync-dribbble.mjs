// Sync Dribbble shots into the site as static assets.
// Scrapes the PUBLIC profile (no auth/OAuth needed), downloads each shot's
// media (still image + MP4 animation where present) into public/dribbble/,
// and writes metadata to content/dribbble.json.
//
// Re-run whenever you post new work:  node scripts/sync-dribbble.mjs
//
// Run with the repo root as cwd.

import { promises as fs } from "fs";
import path from "path";

const USERNAME = "jericol";

// Shots to never include (by exact title), even if present on the profile.
const EXCLUDE_TITLES = new Set([
  "Corporate Website Redesign",
  "WorkOf Enterprise Landing Page",
  "Uniform",
  "Portfolio Redesign",
  "Mobile: City Cards",
  "Personal Portfolio | Jerico Lumanlan",
  "Champions League | Score Board",
]);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const OUT_DIR = path.join(process.cwd(), "public", "dribbble");
const DATA_FILE = path.join(process.cwd(), "content", "dribbble.json");

async function getPage(page) {
  const res = await fetch(`https://dribbble.com/${USERNAME}?page=${page}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`profile page ${page} -> HTTP ${res.status}`);
  return res.text();
}

// Pull the authoritative shot list (id, title, path) from the embedded JSON.
function parseShotMeta(html) {
  const out = [];
  const re =
    /\{"id":(\d+),"title":"((?:[^"\\]|\\.)*)","path":"(\/shots\/[^"]+)"[^}]*?(?:"published_at":"([^"]*)")?[^}]*\}/g;
  let m;
  while ((m = re.exec(html))) {
    let title;
    try {
      title = JSON.parse(`"${m[2]}"`);
    } catch {
      title = m[2];
    }
    out.push({ id: Number(m[1]), title, path: m[3], publishedAt: m[4] || null });
  }
  return out;
}

// For a given shot id, find its media inside that shot's <li> card.
function mediaForShot(html, shotId) {
  // Each card is delimited by data-thumbnail-id="<id>".
  const marker = `data-thumbnail-id="${shotId}"`;
  const start = html.indexOf(marker);
  if (start === -1) return null;
  // Card runs until the next thumbnail marker (or +8k chars).
  const nextMarker = html.indexOf('data-thumbnail-id="', start + marker.length);
  const block = html.slice(start, nextMarker === -1 ? start + 8000 : nextMarker);

  const all = [...block.matchAll(/https:\/\/cdn\.dribbble\.com\/[^"'\\ )]+/g)].map(
    (x) => x[0].replace(/&amp;/g, "&")
  );
  const clean = (u) => u.split("?")[0];

  const mp4Large = all.find((u) => /\/large-[a-f0-9]+\.mp4/.test(u));
  const mp4Small = all.find((u) => /\/small-[a-f0-9]+\.mp4/.test(u));
  const original = all.find((u) => /\/original-[a-f0-9]+\.(png|jpg|jpeg|gif)/.test(u));
  const still = all.find((u) => /\/still-[a-f0-9]+\.(png|jpg|jpeg|gif)/.test(u));
  const anyImg = all.find((u) => /\.(png|jpg|jpeg|gif|webp)$/.test(clean(u)));

  const video = mp4Large || mp4Small || null;
  const poster = clean(original || still || anyImg || "");
  return { video: video ? clean(video) : null, image: poster || null };
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  return buf.length;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  // Collect across pages until a page yields no new shots.
  const seen = new Map();
  for (let p = 1; p <= 10; p++) {
    let html;
    try {
      html = await getPage(p);
    } catch (e) {
      console.warn(`page ${p}: ${e.message}`);
      break;
    }
    const metas = parseShotMeta(html);
    let added = 0;
    for (const meta of metas) {
      if (seen.has(meta.id)) continue;
      if (EXCLUDE_TITLES.has(meta.title)) continue;
      const media = mediaForShot(html, meta.id);
      if (!media || (!media.image && !media.video)) continue;
      seen.set(meta.id, { ...meta, ...media });
      added++;
    }
    console.log(`page ${p}: ${metas.length} listed, ${added} new (total ${seen.size})`);
    if (added === 0) break;
  }

  const shots = [...seen.values()];
  console.log(`\nDownloading media for ${shots.length} shots…`);

  const records = [];
  for (const s of shots) {
    const rec = {
      id: s.id,
      title: s.title,
      url: `https://dribbble.com${s.path}`,
      publishedAt: s.publishedAt,
      image: null,
      video: null,
    };
    try {
      if (s.image) {
        const ext = (s.image.match(/\.([a-z0-9]+)$/i)?.[1] || "png").toLowerCase();
        const file = `${s.id}.${ext}`;
        await download(s.image, path.join(OUT_DIR, file));
        rec.image = `/dribbble/${file}`;
      }
      if (s.video) {
        const file = `${s.id}.mp4`;
        await download(s.video, path.join(OUT_DIR, file));
        rec.video = `/dribbble/${file}`;
      }
      console.log(`  ✓ ${s.title}${rec.video ? " (animated)" : ""}`);
      records.push(rec);
    } catch (e) {
      console.warn(`  ✗ ${s.title}: ${e.message}`);
    }
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2) + "\n");
  console.log(`\nWrote ${records.length} shots -> ${path.relative(process.cwd(), DATA_FILE)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
