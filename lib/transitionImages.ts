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
 * Route a local image through Next's image optimizer so the loaders download a
 * small, appropriately-sized variant instead of the multi-MB original. The
 * loaders show the frame at a small height, so this is visually identical but
 * ~10× lighter. GIFs are animated and can't be optimized — they pass through.
 *
 * `width` must be one of Next's default deviceSizes (e.g. 640, 1200) and the
 * quality MUST be 75: in production Next only allows the qualities listed in
 * `images.qualities` (default `[75]`) and returns HTTP 400 for anything else —
 * which silently broke every loader frame on Vercel while passing in dev.
 */
export function loaderSrc(src: string, width: number): string {
  if (src.toLowerCase().endsWith(".gif")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
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
