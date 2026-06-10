"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { pickFrames, loaderSrc, loaderAspect } from "@/lib/transitionImages";

declare global {
  interface Window { __pageTransitionActive?: boolean; }
}

const PROGRESS_MS = 2800;   // 0 → 100% eased count-up
const HOLD_AT_100_MS = 450; // brief pause once it reaches 100%
const WIPE_MS = 700;        // clip-path wipe right → left
const PER_ITEM_S = 2.2;     // seconds each frame drifts past — calm, count-independent speed
const GAP_PX = 10;

export default function FirstLoadLoader() {
  // Client-only init — avoids SSR/client hydration mismatch (Math.random on server)
  const [frames, setFrames] = useState<string[]>([]);
  const [wiping, setWiping] = useState(false);
  const [done, setDone] = useState(false);
  // Smaller track on phones so the composited marquee layer stays within mobile
  // GPU limits (a 14000px-wide layer silently fails to animate on some devices).
  const [isMobile, setIsMobile] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const count = useMotionValue(0);
  const percent = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setIsMobile(mobile);
    const picks = pickFrames(mobile ? 10 : 15);
    // Warm the browser cache so each static thumb is decoded before it scrolls in.
    picks.forEach((src) => { const img = new window.Image(); img.src = loaderSrc(src); });
    setFrames(picks);
  }, []);

  useEffect(() => {
    const controls = animate(count, 100, {
      duration: PROGRESS_MS / 1000,
      ease: [0.45, 0.15, 0.55, 0.85],
      onComplete: () => {
        const t = setTimeout(() => {
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

  const HEIGHT_VH = isMobile ? 40 : 52;
  const MARQUEE_S = frames.length * PER_ITEM_S; // one copy spans `frames.length` items
  const strip = [...frames, ...frames];

  return (
    <motion.div
      className="fixed inset-0 z-[9700] overflow-hidden flex items-center"
      style={{ backgroundColor: "var(--bg)" }}
      animate={{ clipPath: wiping ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)" }}
      transition={{ duration: WIPE_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Each frame's width is reserved up-front via aspect-ratio (from the build
          manifest), so the track has its final width on the first frame — the
          translateX(-50%) lands on the exact seam and never jumps as images
          decode. translate3d keeps it on the compositor for smooth motion. */}
      <div
        ref={trackRef}
        className="marquee-track flex"
        style={{
          animationDuration: `${MARQUEE_S}s`,
          height: `${HEIGHT_VH}vh`,
          width: "max-content",
          flexShrink: 0,
          willChange: "transform",
        }}
      >
        {strip.map((src, i) => (
          <div
            key={i}
            style={{
              height: "100%",
              aspectRatio: String(loaderAspect(src)),
              flexShrink: 0,
              marginRight: `${GAP_PX}px`,
              overflow: "hidden",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={loaderSrc(src)}
              alt=""
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = src; }
              }}
              style={{ height: "100%", width: "100%", objectFit: "cover", display: "block", filter: "brightness(0.7)" }}
            />
          </div>
        ))}
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
        <motion.span style={{ display: "inline-block", textAlign: "right", minWidth: "2.4ch" }}>
          {percent}
        </motion.span>
        %
      </div>
    </motion.div>
  );
}
