"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePageReady } from "@/hooks/usePageReady";

/* One swap as a single overlapping motion: the old word slides up out of the
   mask (quick, easing in); just behind it the new word rises in (easing out,
   like the hero's RevealText) while the slot glides to the new word's width,
   so the words around it close up without a gap. */
const EXIT_S = 0.42;
const ENTER_DELAY_S = 0.2;
const ENTER_S = 0.85;
const RESIZE_DELAY_S = 0.12;
const RESIZE_S = 0.7;
const EASE_IN = [0.55, 0, 0.75, 0.25] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

const slideVariants: Variants = {
  hidden: { y: "110%" },
  shown: { y: 0, transition: { delay: ENTER_DELAY_S, duration: ENTER_S, ease: EASE_OUT } },
  gone: { y: "-110%", transition: { duration: EXIT_S, ease: EASE_IN } },
};

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.6 } },
  gone: { opacity: 0, transition: { duration: 0.4 } },
};

/**
 * One word inside a running sentence that cycles through `words`, with the
 * text before and after it smoothly closing up around each new word. Starts
 * `startDelay` seconds after the page is ready (after the hero reveal); with
 * reduced motion the words cross-fade in place. Decorative — give the sentence
 * an accessible label that lists all words.
 */
export default function RotatingWord({
  words,
  interval = 2.2,
  firstInterval = 0.5,
  startDelay = 1.7,
}: {
  words: string[];
  /** Seconds each word stays. */
  interval?: number;
  /** Seconds the first word stays — short, so it's clear right away that the word changes. */
  firstInterval?: number;
  /** Seconds after the page is ready before the first swap. */
  startDelay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ready = usePageReady();
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const measureRef = useRef<HTMLSpanElement | null>(null);

  // offsetWidth: layout width, unaffected by the hero's scroll scale transform
  const measure = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    setWidths(Array.from(el.children, (child) => (child as HTMLElement).offsetWidth));
  }, []);

  useLayoutEffect(measure, [measure]);

  // the font size is fluid (vw clamp) and webfonts swap in late — re-measure on both
  useEffect(() => {
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    if (!ready) return;
    let tick: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      tick = setInterval(() => setIndex((i) => (i + 1) % words.length), interval * 1000);
    }, (startDelay + firstInterval) * 1000);
    return () => {
      clearTimeout(start);
      clearInterval(tick);
    };
  }, [ready, words.length, interval, firstInterval, startDelay]);

  const current = words[index];

  return (
    <motion.span
      aria-hidden
      style={{
        position: "relative",
        display: "inline-block",
        whiteSpace: "nowrap",
        /* mask top and bottom only (room for descenders), never the sides */
        paddingBottom: "0.14em",
        marginBottom: "-0.14em",
        clipPath: "inset(0 -50vw)",
      }}
      animate={widths.length ? { width: widths[index] } : undefined}
      transition={reduceMotion ? { duration: 0 } : { delay: RESIZE_DELAY_S, duration: RESIZE_S, ease: EASE_IN_OUT }}
    >
      {/* Holds the line box (height + baseline) while the words swap above it */}
      <span style={{ display: "inline-block", width: widths.length ? 0 : "auto", visibility: "hidden" }}>{current}</span>

      <AnimatePresence initial={false}>
        <motion.span
          key={current}
          style={{ position: "absolute", top: 0, left: "50%", x: "-50%", whiteSpace: "nowrap" }}
          variants={reduceMotion ? fadeVariants : slideVariants}
          initial="hidden"
          animate="shown"
          exit="gone"
        >
          {current}
        </motion.span>
      </AnimatePresence>

      {/* Measurers: every word's natural width at the current font size */}
      <span ref={measureRef} style={{ position: "absolute", left: 0, top: 0, visibility: "hidden", pointerEvents: "none" }}>
        {words.map((w) => (
          <span key={w} style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap" }}>
            {w}
          </span>
        ))}
      </span>
    </motion.span>
  );
}
