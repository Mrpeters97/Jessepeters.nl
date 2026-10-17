"use client";

import { useLayoutEffect, useState } from "react";

/** True below the 768px breakpoint; tracks viewport changes. Settled before the first paint. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}
