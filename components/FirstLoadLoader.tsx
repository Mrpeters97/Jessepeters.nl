"use client";

import { cubicBezier, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { pickFrames, loaderSrc, loaderAspect } from "@/lib/transitionImages";
import { pageLoaded, visibleImages } from "@/lib/pageLoad";

const PROGRESS_MS = 2800;   // 0 → 100% eased count-up (the minimum — a fast load never finishes sooner)
const HOLD_AT_100_MS = 450; // brief pause once it reaches 100%
const CREEP_MS = 3500;      // while the page is still loading, the counter creeps toward 95% on this time constant
const CATCH_UP_MS = 450;    // how quickly a held-back counter eases back onto its target once content arrives
const MAX_WAIT_MS = 8000;   // never hold anyone longer than this, loaded or not
const WIPE_MS = 700;        // clip-path wipe right → left
const PER_ITEM_S = 2.2;     // seconds each frame drifts past — calm, count-independent speed
const GAP_PX = 10;

function LoaderFrame({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      style={{
        height: "100%",
        aspectRatio: String(loaderAspect(src)),
        flexShrink: 0,
        marginRight: `${GAP_PX}px`,
        overflow: "hidden",
        backgroundColor: "var(--bg)",
      }}
    >
      <motion.img
        src={loaderSrc(src)}
        alt=""
        decoding="async"
        initial={{ opacity: 0, y: "50%" }}
        animate={loaded ? { opacity: 1, y: "0%" } : { opacity: 0, y: "50%" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = src; }
          setLoaded(true);
        }}
        style={{ height: "100%", width: "100%", objectFit: "cover", display: "block", filter: "brightness(0.7)" }}
      />
    </div>
  );
}

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

  /* The count-up follows the same eased 2.8s curve as before, but may not run
     ahead of the page: until the document has loaded, fonts are ready and the
     images in view have decoded, it's capped by how much of that is done plus a
     slow creep (so it never stalls). Once everything is in it eases back onto
     the curve — so a fast load looks exactly like before, a slow one counts
     slower instead of reaching 100% over an unfinished page. */
  useEffect(() => {
    const ease = cubicBezier(0.45, 0.15, 0.55, 0.85);
    const start = performance.now();
    const loadState = () => {
      const { done, total } = visibleImages();
      return { ready: pageLoaded(), fraction: total ? done / total : document.readyState === "complete" ? 1 : 0 };
    };

    let raf = 0;
    let last = start;
    let shown = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const tick = (now: number) => {
      const elapsed = now - start;
      const dt = now - last;
      last = now;
      const onCurve = 100 * ease(Math.min(1, elapsed / PROGRESS_MS));
      const { ready, fraction } = loadState();
      const cap = ready || elapsed >= MAX_WAIT_MS
        ? 100
        : Math.max(90 * fraction, 95 * (1 - Math.exp(-elapsed / CREEP_MS)));
      const target = Math.min(onCurve, cap);
      shown = target - shown < 0.5 ? Math.max(shown, target) : shown + (target - shown) * (1 - Math.exp(-dt / CATCH_UP_MS));
      count.set(shown);
      if (shown >= 99.5 && onCurve >= 100) {
        count.set(100);
        hold = setTimeout(() => {
          window.__pageTransitionActive = false;
          window.dispatchEvent(new Event("page-transition-complete"));
          setWiping(true);
        }, HOLD_AT_100_MS);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hold);
    };
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
      data-loader-overlay=""
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
          <LoaderFrame key={i} src={src} />
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
