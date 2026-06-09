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

  return null;
}
