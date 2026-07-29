/**
 * Pre-generates small static JPEG thumbnails for every image the page loaders
 * can show, written to /public/_loader/. The loaders reference these directly
 * (see lib/transitionImages.ts → loaderSrc), so on a cold first visit the frames
 * are plain static files — served instantly, CDN-cached, never routed through
 * the on-demand Next image optimizer (which has cold-start latency and rejected
 * non-default qualities with a 400 in production).
 *
 * Runs as part of `dev` and `build` (see package.json). Incremental: an image is
 * only re-encoded when its source is newer than the existing thumbnail, so it
 * adds no meaningful time to rebuilds and produces no git churn.
 */
import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const OUT = join(PUBLIC, "_loader");
const MANIFEST = join(ROOT, "lib", "loaderManifest.json");

const WIDTH = 1000;   // loader shows frames ~500px tall; 1000px wide is ample
const QUALITY = 72;   // dimmed, fast-moving frames — quality is not critical

const SOURCE_DIRS = [
  join(PUBLIC, "images", "portrait"),
  join(PUBLIC, "images", "moments"),
  join(PUBLIC, "projects"),
];

const RASTER = new Set([".jpg", ".jpeg", ".png"]);

/** Recursively collect raster image files under a directory. */
function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (RASTER.has(extname(name).toLowerCase())) acc.push(full);
  }
  return acc;
}

/** Mirror of loaderSrc()'s mapping: /a/b/c.jpg → a__b__c.jpg (always .jpg). */
function thumbName(absPath) {
  const rel = relative(PUBLIC, absPath); // e.g. projects/Cafe_Del_Mar/1.jpg
  return rel.replace(/\.[^.]+$/, ".jpg").replace(/[\\/]/g, "__");
}

mkdirSync(OUT, { recursive: true });

const sources = SOURCE_DIRS.flatMap((d) => walk(d));
let made = 0;
let skipped = 0;

/** key (thumb filename) → [width, height] of the generated thumbnail. Lets the
 *  loaders reserve each frame's exact aspect ratio before the image decodes, so
 *  the marquee track width is stable from first paint (no layout-shift stutter). */
const manifest = {};

await Promise.all(
  sources.map(async (src) => {
    const name = thumbName(src);
    const dest = join(OUT, name);
    try {
      if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) {
        skipped++;
        const meta = await sharp(dest).metadata();
        manifest[name] = [meta.width, meta.height];
        return;
      }
      const info = await sharp(src)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(dest);
      manifest[name] = [info.width, info.height];
      made++;
    } catch (err) {
      console.warn(`[loader-thumbs] skip ${src}: ${err.message}`);
    }
  })
);

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0) + "\n");

console.log(`[loader-thumbs] ${made} generated, ${skipped} up-to-date → public/_loader/ (${Object.keys(manifest).length} in manifest)`);
