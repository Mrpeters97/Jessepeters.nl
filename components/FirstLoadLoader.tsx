"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { pickFrames, loaderSrc } from "@/lib/transitionImages";

declare global {
  interface Window { __pageTransitionActive?: boolean; }
}

const PROGRESS_MS = 2800;   // 0 → 100% eased count-up
const HOLD_AT_100_MS = 450; // brief pause once it reaches 100%
const WIPE_MS = 700;        // clip-path wipe right → left
const COUNT = 15;           // unique frames; doubled in the strip for a seamless loop
const PER_ITEM_S = 2.2;     // seconds each frame takes to advance — calm hero-like drift, count-independent
const MARQUEE_S = COUNT * PER_ITEM_S; // one copy spans COUNT frames, so this keeps px/s count-independent
const GAP = "clamp(6px, 0.8vw, 12px)";

export default function FirstLoadLoader() {
  // Client-only init — avoids SSR/client hydration mismatch (Math.random on server)
  const [frames, setFrames] = useState<string[]>([]);
  const [wiping, setWiping] = useState(false);
  const [done, setDone] = useState(false);

  const count = useMotionValue(0);
  const percent = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const picks = pickFrames(COUNT);
    // Preload every frame so its intrinsic size is known the moment it mounts —
    // otherwise unloaded <img width:auto> collapse to 0px and only a few show.
    picks.forEach((src) => {
      const img = new window.Image();
      img.src = loaderSrc(src, 1200);
    });
    setFrames(picks);
  }, []);

  useEffect(() => {
    const controls = animate(count, 100, {
      duration: PROGRESS_MS / 1000,
      /* near-linear with soft ends — even climb, no harsh slow-fast-slow */
      ease: [0.45, 0.15, 0.55, 0.85],
      onComplete: () => {
        const t = setTimeout(() => {
          /* Release page-gated animations to start as the panel wipes away */
          window.__pageTransitionActive = false;
          window.dispatchEvent(new Event("page-transition-complete"));
          setWiping(true);
        }, HOLD_AT_100_MS);
        return () => clearTimeout(t);
      },
    });
    return () => controls.stop();
  }, [count]);

  useEffect(() => {
    if (!wiping) return;
    const t = setTimeout(() => setDone(true), WIPE_MS);
    return () => clearTimeout(t);
  }, [wiping]);

  if (done) return null;

  const strip = [...frames, ...frames];

  return (
    <motion.div
      className="fixed inset-0 z-[9700] overflow-hidden flex items-center"
      style={{ backgroundColor: "var(--bg)" }}
      animate={{ clipPath: wiping ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)" }}
      transition={{ duration: WIPE_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* height is capped so landscape images don't dominate the viewport;
          width: auto preserves each image's natural aspect ratio — no cropping.
          CSS marquee runs infinitely and keeps going during the clip-path wipe. */}
      <div
        className="marquee-track flex"
        style={{
          animationDuration: `${MARQUEE_S}s`,
          height: "52vh",
          /* width must equal the real content width (not be clamped by the
             outer flex container) or translateX(-50%) won't land on the seam */
          width: "max-content",
          flexShrink: 0,
        }}
      >
        {strip.map((src, i) =>
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={loaderSrc(src, 1200)}
            alt=""
            decoding="async"
            style={{
              height: "100%",
              width: "auto",
              flexShrink: 0,
              display: "block",
              filter: "brightness(0.7)",
              /* uniform trailing margin (not flex gap) so translateX(-50%)
                 lands exactly on the seam — no jump on loop */
              marginRight: GAP,
            }}
          />
        )}
      </div>

      {/* Loader percentage — bottom-right, hero display font, eased count-up */}
      <div
        className="pointer-events-none absolute flex items-baseline"
        style={{
          right: "var(--page-x)",
          bottom: "var(--page-x)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(28px, 3vw, 48px)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--off-white)",
          fontVariantNumeric: "lining-nums tabular-nums",
        }}
      >
        {/* fixed-width number so the % sign doesn't shift as digits change */}
        <motion.span style={{ display: "inline-block", textAlign: "right", minWidth: "2.4ch" }}>
          {percent}
        </motion.span>
        %
      </div>
    </motion.div>
  );
}
