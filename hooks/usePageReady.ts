"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __pageTransitionActive?: boolean;
  }
}

/**
 * Returns false while a page transition panel is covering the screen,
 * true once the panel has fully exited. On direct (hard) loads it is
 * immediately true so initial-load entrance animations play as normal.
 */
export function usePageReady(): boolean {
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.__pageTransitionActive;
  });

  useEffect(() => {
    if (ready) return;
    const handler = () => setReady(true);
    window.addEventListener("page-transition-complete", handler, { once: true });
    return () => window.removeEventListener("page-transition-complete", handler);
  }, [ready]);

  return ready;
}
