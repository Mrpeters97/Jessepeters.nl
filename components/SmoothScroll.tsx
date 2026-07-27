"use client";

import Lenis from "lenis";
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

let _lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return _lenis;
}

/* useLayoutEffect on the client, no-op fallback on the server (avoids SSR warning). */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Pages that deliberately position themselves (jump to a "split" for the
   bidirectional infinite scroll) and must not be reset to the top. */
const SELF_POSITIONING = new Set(["/work", "/archive"]);

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    _lenis = lenis;

    let id: number;

    function raf(time: number) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    }

    id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      _lenis = null;
    };
  }, []);

  /* Always start a freshly navigated page at the top — Lenis otherwise carries
     the previous page's scroll position across the route change. */
  useIsoLayoutEffect(() => {
    if (SELF_POSITIONING.has(pathname)) return;
    window.scrollTo(0, 0);
    _lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  /* Defensive re-assert once the page-transition panel has fully cleared.
     The reset above fires as early as possible, but on a slower device
     something later in that same navigation (residual Lenis momentum, the
     previous SELF_POSITIONING page's own split-point jump settling late)
     can still land the very first paint the user actually sees at a
     leftover scroll position — which, since the new page is often shorter
     than a deep-scrolled Work/Archive page, clamps to the bottom and reads
     as "opening on the footer". Re-checking right as the panel clears
     closes that window without depending on exact effect ordering. */
  useEffect(() => {
    if (SELF_POSITIONING.has(pathname)) return;
    const onComplete = () => {
      window.scrollTo(0, 0);
      _lenis?.scrollTo(0, { immediate: true });
    };
    window.addEventListener("page-transition-complete", onComplete);
    return () => window.removeEventListener("page-transition-complete", onComplete);
  }, [pathname]);

  return null;
}
