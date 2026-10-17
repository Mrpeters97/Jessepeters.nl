"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { usePageReady } from "@/hooks/usePageReady";
import { replaysOnReturn } from "@/hooks/useViewPlay";
import { markup } from "./markup";

/**
 * An inline Figma frame SVG (see components/anim/svg) whose layers are animated
 * by the caller's CSS, addressed by their Figma layer names (`[data-n="…"]`).
 *
 * State lives on the wrapper as data attributes, toggled by visibility:
 *  - `data-play`: set once the frame is well in view (one-shot build-ups key
 *    off it); with `replay` it's cleared again once the frame has fully left,
 *    so the build-up runs again on the next visit (not on mobile, see
 *    replaysOnReturn).
 *  - `data-run`: set while any of it is on screen (loops pause without it).
 * Neither is set while the page loader / transition still covers the screen.
 * With reduced motion neither is set — CSS should show the final state.
 * Pass `play` to drive both from outside instead (e.g. a sequence of frames).
 */
export default function AnimatedSvg({
  svg,
  className,
  cover = false,
  replay = true,
  label,
  play,
}: {
  svg: string;
  className?: string;
  /** Fill the box like object-fit: cover (card thumbnails) instead of fitting inside it. */
  cover?: boolean;
  replay?: boolean;
  label?: string;
  /** Externally controlled: when set, the visibility observer is skipped. */
  play?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const ready = usePageReady();
  const uid = useId().replace(/[^\w-]/g, "");
  const html = useMemo(
    () => scopeIds(svg, uid).replace("<svg ", `<svg preserveAspectRatio="${cover ? "xMidYMid slice" : "xMidYMid meet"}" `),
    [svg, cover, uid]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion || !ready) return;
    if (play !== undefined) {
      el.toggleAttribute("data-play", play);
      el.toggleAttribute("data-run", play);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.setAttribute("data-run", "");
        else el.removeAttribute("data-run");
        if (entry.intersectionRatio >= 0.35) el.setAttribute("data-play", "");
        else if (!entry.isIntersecting && replay && replaysOnReturn()) el.removeAttribute("data-play");
      },
      { threshold: [0, 0.35] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion, replay, play, ready]);

  return (
    <div
      ref={ref}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ position: "absolute", inset: 0 }}
      dangerouslySetInnerHTML={markup(html)}
    />
  );
}

/**
 * Suffixes every id (and its url(#…) / href="#…" references) per instance. The
 * same frame can be on a page twice — a card cover and the next-project card —
 * and references resolve to the first match, so patterns, masks and clips
 * would otherwise point into a copy that may be hidden.
 */
function scopeIds(svg: string, uid: string): string {
  return svg
    .replace(/\sid="([^"]+)"/g, ` id="$1-${uid}"`)
    .replace(/url\(#([^)]+)\)/g, `url(#$1-${uid})`)
    .replace(/href="#([^"]+)"/g, `href="#$1-${uid}"`);
}
