"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { pickFrames, loaderSrc } from "@/lib/transitionImages";
import { pageLoaded } from "@/lib/pageLoad";

const COVER_MS = 620;    // panel eases up from the bottom to cover — gentle, not abrupt
const HOLD_MS = 750;     // panel sits still, the gif rattles through its images (the minimum)
const REVEAL_MS = 720;   // panel slides up and off the top — slow enough to feel smooth
const SUBSET = 4;        // four random images, each shown once, on a normal transition
const SPARE = 8;         // extra images to keep going with while the next page is still loading
const MAX_HOLD_MS = 6000; // never keep the panel up longer than this, loaded or not
const FRAME_MS = (COVER_MS + HOLD_MS) / SUBSET;

type Phase = "idle" | "cover" | "hold" | "reveal";

function preload(src: string) {
  const img = new window.Image();
  img.src = loaderSrc(src);
}

export default function PageTransition() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [frames, setFrames] = useState<string[]>([]);
  const [waiting, setWaiting] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const waitingRef = useRef(false);
  const framesRef = useRef<string[]>([]);

  const start = useCallback((href: string) => {
    if (pendingHref.current) return; // a transition is already running
    pendingHref.current = href;
    window.__pageTransitionActive = true;
    const first = pickFrames(SUBSET); // includes one portrait, always shown
    const spare = pickFrames(SUBSET + SPARE).filter((src) => !first.includes(src)).slice(0, SPARE);
    const picks = [...first, ...spare];
    picks.slice(0, SUBSET).forEach(preload);
    setFrames(picks);
    framesRef.current = picks;
    waitingRef.current = false;
    setWaiting(false);
    setPhase("cover");
  }, []);

  /* Intercept every internal <a> navigation in the capture phase, before
     Next's Link handler runs, so we can play the transition first. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const rawHref = anchor.getAttribute("href");
      if (!rawHref || anchor.target === "_blank") return;
      if (rawHref.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;        // external / mailto / tel
      if (url.pathname === location.pathname) return;     // same page

      e.preventDefault();
      e.stopPropagation();
      start(url.pathname + url.search);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  /* Phase machine: cover → (swap route, hidden) → hold → reveal → idle.
     The hold lasts at least HOLD_MS, then until the new page is on screen
     behind the panel with its fonts and in-view images loaded — meanwhile
     the frames keep cycling, so a slow page never gets revealed half-drawn. */
  useEffect(() => {
    if (phase === "cover") {
      const t = setTimeout(() => {
        if (pendingHref.current) router.push(pendingHref.current);
        setPhase("hold");
      }, COVER_MS);
      return () => clearTimeout(t);
    }
    if (phase === "hold") {
      const start = performance.now();
      const target = pendingHref.current && new URL(pendingHref.current, location.href).pathname;
      const t = setInterval(() => {
        const elapsed = performance.now() - start;
        if (elapsed < HOLD_MS) return;
        const ready = location.pathname === target && pageLoaded();
        if (ready || elapsed >= MAX_HOLD_MS) {
          clearInterval(t);
          setPhase("reveal");
        } else if (!waitingRef.current) {
          waitingRef.current = true;
          framesRef.current.slice(SUBSET).forEach(preload);
          setWaiting(true);
        }
      }, 50);
      return () => clearInterval(t);
    }
    if (phase === "reveal") {
      const t = setTimeout(() => {
        /* release content only once the panel is fully off-screen, so entrance
           animations start *after* the loader is gone (not behind it) */
        window.__pageTransitionActive = false;
        window.dispatchEvent(new Event("page-transition-complete"));
        pendingHref.current = null;
        setPhase("idle");
      }, REVEAL_MS);
      return () => clearTimeout(t);
    }
  }, [phase, router]);

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="page-transition"
          data-loader-overlay=""
          className="fixed inset-0 z-[9000] flex items-center justify-center overflow-hidden"
          initial={{ y: "100%" }}
          animate={{ y: phase === "reveal" ? "-100%" : "0%" }}
          transition={{
            duration: (phase === "reveal" ? REVEAL_MS : COVER_MS) / 1000,
            /* smooth ease-in-out on both legs so the panel glides rather than
               snapping up — fixes the "instant black / too fast" feeling */
            ease: [0.45, 0, 0.2, 1],
          }}
        >
          {/* opaque base — slides as one unit so it never pops, never reveals the page-switch */}
          <div className="absolute inset-0" style={{ backgroundColor: "var(--bg)" }} />
          {/* frosted tint to match the photo modal */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--bg) 80%, transparent)" }}
          />
          <div className="relative">
            <GifFrames frames={frames} keepGoing={waiting && phase === "hold"} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Plays the first SUBSET frames once each, in order, instant swaps — then
 *  holds the last. With `keepGoing` (next page still loading) it carries on
 *  through the spare frames at the same pace, looping if it runs out. */
function GifFrames({ frames, keepGoing }: { frames: string[]; keepGoing: boolean }) {
  const [i, setI] = useState(0);
  const shownAt = useRef(0);

  useEffect(() => {
    shownAt.current = performance.now();
  }, [i]);

  useEffect(() => {
    if (i >= SUBSET - 1 && !keepGoing) return; // last frame reached → stop, no loop
    // keep the same pace when resuming: count the time this frame has already been up
    const wait = Math.max(0, FRAME_MS - (performance.now() - shownAt.current));
    const t = setTimeout(() => setI((n) => (n + 1) % frames.length), wait);
    return () => clearTimeout(t);
  }, [i, keepGoing, frames.length]);

  if (frames.length === 0) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={loaderSrc(frames[i])}
      alt=""
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = frames[i]; }
      }}
      style={{
        height: "clamp(160px, 20vh, 260px)",
        width: "auto",
        display: "block",
      }}
    />
  );
}
