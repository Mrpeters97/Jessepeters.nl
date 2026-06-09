"use client";

import { useState } from "react";
import { usePageReady } from "@/hooks/usePageReady";

/**
 * Robust entrance gating for items that must re-play their reveal on *every*
 * load — including after a page loader / transition.
 *
 * It decouples two facts:
 *  - `entered`: the element has scrolled into the viewport (fires even while a
 *    loader covers the screen — IntersectionObserver ignores the overlay);
 *  - `ready`:   the loader / transition is gone.
 *
 * The item reveals only when BOTH are true, so:
 *  - items in the initial viewport stay hidden under the loader, then drop in
 *    the moment it clears;
 *  - items below the fold reveal on scroll as usual;
 *  - because every navigation re-mounts the page (resetting `ready`), the
 *    entrance animation always replays — never "already done" on arrival.
 */
export function useReveal(margin: string = "-80px") {
  const ready = usePageReady();
  const [entered, setEntered] = useState(false);

  return {
    shown: entered && ready,
    onViewportEnter: () => setEntered(true),
    viewport: { once: true, margin } as const,
  };
}
