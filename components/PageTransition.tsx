"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __pageTransitionActive?: boolean;
  }
}
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { pickFrames, loaderSrc } from "@/lib/transitionImages";

const COVER_MS = 400;    // colored panel slides up from the bottom to cover
const HOLD_MS = 800;     // panel sits still, the gif rattles through 3 images
const REVEAL_MS = 450;   // panel keeps sliding up and off the top
const SUBSET = 4;        // exactly four random images, each shown once

type Phase = "idle" | "cover" | "hold" | "reveal";

export default function PageTransition() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [frames, setFrames] = useState<string[]>([]);
  const pendingHref = useRef<string | null>(null);

  const start = useCallback((href: string) => {
    if (pendingHref.current) return; // a transition is already running
    pendingHref.current = href;
    window.__pageTransitionActive = true;
    const picks = pickFrames(SUBSET);
    picks.forEach((src) => {
      const img = new window.Image();
      img.src = loaderSrc(src, 640);
    });
    setFrames(picks);
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

  /* Phase machine: cover → (swap route, hidden) → hold → reveal → idle. */
  useEffect(() => {
    if (phase === "cover") {
      const t = setTimeout(() => {
        if (pendingHref.current) router.push(pendingHref.current);
        setPhase("hold");
      }, COVER_MS);
      return () => clearTimeout(t);
    }
    if (phase === "hold") {
      const t = setTimeout(() => setPhase("reveal"), HOLD_MS);
      return () => clearTimeout(t);
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
          className="fixed inset-0 z-[9000] flex items-center justify-center overflow-hidden"
          initial={{ y: "100%" }}
          animate={{ y: phase === "reveal" ? "-100%" : "0%" }}
          transition={{
            duration: (phase === "reveal" ? REVEAL_MS : COVER_MS) / 1000,
            ease: phase === "reveal" ? [0.65, 0, 0.35, 1] : [0.22, 1, 0.36, 1],
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
            <GifFrames frames={frames} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Plays the frames once each, in order, instant swaps — then holds the last. */
function GifFrames({ frames }: { frames: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= frames.length - 1) return; // last frame reached → stop, no loop
    const t = setTimeout(() => setI((n) => n + 1), (COVER_MS + HOLD_MS) / frames.length);
    return () => clearTimeout(t);
  }, [i, frames.length]);

  if (frames.length === 0) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={loaderSrc(frames[i], 640)}
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
