import { projects, archivePhotos } from "@/lib/data";

/** Hero portraits used on the homepage carousel + about slideshow. */
export const heroPortraits = Array.from({ length: 8 }, (_, i) => `/images/portrait/Jesse-0${i + 1}.jpg`);
const heroes = heroPortraits;

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

/** Fisher–Yates shuffle returning a new array (doesn't mutate the source). */
export function shuffled<T>(arr: T[]): T[] {
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
  const portrait = heroPortraits[Math.floor(Math.random() * heroPortraits.length)];
  const rest = shuffled(transitionImages.filter((s) => s !== portrait)).slice(0, Math.max(0, count - 1));
  const out = [...rest];
  out.splice(Math.floor(Math.random() * (out.length + 1)), 0, portrait);
  return out;
}
