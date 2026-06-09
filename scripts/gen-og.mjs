// Regenerates the social-preview image (public/og.png) by screenshotting the
// live hero — so the OG card always matches the actual WebGL orb + headline.
// Used by the og-image GitHub Action on hero changes, and runnable locally via
// `npm run og:gen` (start the site first, e.g. `npm run dev`).
//
// Env:
//   OG_URL    page to capture                (default http://localhost:3000/)
//   OG_OUT    output path                     (default public/og.png)
//   OG_HEADED "1" → headed browser (CI uses this under xvfb for reliable WebGL)
//
// Output is 1200x630 @2x = 2400x1260, matching the OG dimensions declared in
// app/layout.tsx.

import { chromium } from "playwright";

const URL = process.env.OG_URL || "http://localhost:3000/";
const OUT = process.env.OG_OUT || "public/og.png";
const HEADED = process.env.OG_HEADED === "1";

const browser = await chromium.launch({
  headless: !HEADED,
  // Help software WebGL render the orb on headless / CI machines.
  args: [
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
// Don't count this capture visit in analytics.
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("sb_optout", "1");
  } catch {}
});

const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
// Let the orb render and the one-time orb-hint slide in and leave (~3.6s).
await page.waitForTimeout(5500);
await page.screenshot({
  path: OUT,
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});

await browser.close();
console.log(`OG image written to ${OUT} from ${URL}`);
