"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/components/SmoothScroll";

/** Kill-switch — flip to false to fully disable the idle scroll hint on
 *  every page that uses it, without touching the pages themselves. */
export const SCROLL_HINT_ENABLED = true;

const IDLE_MS = 3500; // how long to wait with no scroll before hinting
const NUDGE_PX = 280; // how far the real scroll dips — enough to actually lift the first content text (project intro / grid) into readable view at the bottom of the viewport, still well under any scroll-threshold UI (e.g. useOverHero's 90% of viewport height)
const HOLD_MS = 650; // dwell at the peak before easing back — long enough to actually read the text that just came into view, not just glimpse it

/* Same easing curve SmoothScroll.tsx configures Lenis with, reused here so
   the nudge feels like the site's own scroll rather than a foreign motion. */
const EASE = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * A one-time, subtle "scroll preview": if the visitor hasn't scrolled within
 * IDLE_MS of the page being ready, nudges the real scroll position down a
 * few px and eases it back — a tiny real scroll, not a fake transform, so it
 * drives the page's existing scroll-linked hero treatment (clip/opacity/
 * scale) exactly as a manual scroll would. Fires at most once per page view;
 * does nothing once the visitor scrolls themselves, and is skipped entirely
 * under prefers-reduced-motion.
 */
export function useIdleScrollHint(ready: boolean) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!SCROLL_HINT_ENABLED || !ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.scrollY > 2) return;

    let scrolled = false;
    const onScroll = () => { scrolled = true; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const t = setTimeout(() => {
      window.removeEventListener("scroll", onScroll);
      if (firedRef.current || scrolled) return;
      firedRef.current = true;

      const lenis = getLenis();
      if (!lenis) return;

      lenis.scrollTo(NUDGE_PX, {
        duration: 1.6,
        easing: EASE,
        onComplete: () => {
          setTimeout(() => {
            lenis.scrollTo(0, { duration: 1.7, easing: EASE });
          }, HOLD_MS);
        },
      });
    }, IDLE_MS);

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ready]);
}
