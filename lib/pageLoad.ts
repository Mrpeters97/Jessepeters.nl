/**
 * How far the page behind a loader overlay is: images currently in the
 * viewport (ignoring the overlays' own, marked `data-loader-overlay`) that have
 * finished loading. Lazy images outside the viewport don't count — they only
 * load once scrolled to, so waiting on them would never end.
 */
export function visibleImages(): { done: number; total: number } {
  const imgs = [...document.querySelectorAll<HTMLImageElement>("img")].filter((img) => {
    if (img.closest("[data-loader-overlay]")) return false;
    const r = img.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  });
  return { done: imgs.filter((img) => img.complete).length, total: imgs.length };
}

/** True once the document, its fonts and every image in view have loaded. */
export function pageLoaded(): boolean {
  const { done, total } = visibleImages();
  return document.readyState === "complete" && document.fonts?.status !== "loading" && done === total;
}
