"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { usePageReady } from "@/hooks/usePageReady";

/**
 * Whether a build-up runs again when its tile comes back into view. Not below
 * 768px: there the grid is one long stack people scroll back and forth through,
 * and tiles rebuilding every time read as images loading in over and over.
 */
export const replaysOnReturn = () => !window.matchMedia("(max-width: 767px)").matches;

/**
 * View trigger for a tile's build-up. `play` turns on once `amount` of the tile
 * is in view and stays on until it has fully left (so scrolling back a little
 * never restarts it halfway) — on mobile it stays on for the rest of the visit.
 * `run` is on while any of it shows, for loops. Both wait for the page loader /
 * transition to clear, so nothing builds up unseen underneath it.
 */
export function useViewPlay(ref: RefObject<HTMLElement | null>, amount = 0.35) {
  const ready = usePageReady();
  const inPlay = useInView(ref, { amount }) && ready;
  const visible = useInView(ref) && ready;
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    if (inPlay) setPlayed(true);
    else if (!visible && replaysOnReturn()) setPlayed(false);
  }, [inPlay, visible]);
  return { play: played, run: visible };
}
