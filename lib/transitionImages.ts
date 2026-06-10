import { projects, archivePhotos, portraits } from "@/lib/data";

const heroes = portraits;

/** Work covers (grid + next-project cards). */
const covers = projects.map((p) => p.thumbnail);

/** All in-order work-detail images (skips gifs — they don't size predictably). */
const details = projects
  .flatMap((p) => p.images ?? [])
  .filter((src) => !src.toLowerCase().endsWith(".gif"));

/**
 * One mixed pool spanning the whole site: heroes, work covers, work-detail
 * shots and archive photos. Used by the page-transition "gif" so every frame
 * keeps its own aspect ratio (portrait stays portrait, landscape stays wide).
 */
export const transitionImages: string[] = [
  ...heroes,
  ...covers,
  ...details,
  ...archivePhotos,
];

/**
 * Maps a source image to its pre-generated static loader thumbnail in
 * /public/_loader/ (built by scripts/generate-loader-thumbs.mjs). These are
 * plain static files: served instantly and CDN-cached, with none of the
 * on-demand image-optimizer's cold-start latency or production quality
 * restrictions that previously left the loader frames blank on first visit.
 *
 * The flattening mirrors the generator exactly: `/a/b/c.jpg` → `/_loader/a__b__c.jpg`
 * (extension normalised to .jpg). GIFs are animated — they pass through untouched.
 *
 * `width` is accepted for call-site compatibility but unused: a single thumbnail
 * size covers both loaders.
 */
export function loaderSrc(src: string, _width?: number): string {
  if (src.toLowerCase().endsWith(".gif")) return src;
  const flat = src.replace(/^\//, "").replace(/\.[^.]+$/, ".jpg").replace(/\//g, "__");
  return `/_loader/${flat}`;
}

/** Fisher–Yates shuffle returning a new array (doesn't mutate the source). */
function shuffled<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Picks `count` random transition frames with at least one portrait of Jesse
 * guaranteed, inserted at a random position so it isn't always first.
 */
export function pickFrames(count: number): string[] {
  const portrait = portraits[Math.floor(Math.random() * portraits.length)];
  const rest = shuffled(transitionImages.filter((s) => s !== portrait)).slice(0, Math.max(0, count - 1));
  const out = [...rest];
  out.splice(Math.floor(Math.random() * (out.length + 1)), 0, portrait);
  return out;
}
