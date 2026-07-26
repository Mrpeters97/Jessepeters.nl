"use client";

import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { usePageReady } from "@/hooks/usePageReady";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Base delay before the first line reveals (seconds). */
  delay?: number;
  /** Per-line stagger (seconds). */
  stagger?: number;
  /** Per-line reveal duration (seconds). */
  duration?: number;
  /**
   * Skip the automatic scroll/load detection and always treat this element as
   * page-load content (reveals once `usePageReady()` flips true). Use for text
   * that's known to sit within the initial viewport but whose true position
   * can't be trusted at the pre-paint measurement moment (e.g. it depends on
   * webfont-swap reflow) — without this, a mistimed measurement can lock it
   * into scroll-triggered mode and leave it stuck invisible, reserving its
   * layout space as a blank gap, if the page never actually gets scrolled.
   */
  forceLoad?: boolean;
};

/**
 * Line-by-line mask reveal (Haven Constructions style): the text is split into
 * its rendered lines, each line sits in an overflow-hidden mask, and slides up
 * from below with a stagger.
 *
 * Trigger is automatic:
 *  - if a page loader / transition is covering the screen at mount, the lines
 *    reveal once it clears (after the loader);
 *  - otherwise they reveal on scroll into view.
 */
export default function RevealText({
  children,
  as,
  className,
  style,
  delay = 0,
  stagger = 0.09,
  duration = 0.9,
  forceLoad = false,
}: Props) {
  const Tag = (as ?? "div") as ElementType;
  const isString = typeof children === "string";
  const words = useMemo(
    () => (isString ? (children as string).split(/\s+/).filter(Boolean) : []),
    [isString, children]
  );

  const containerRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [lines, setLines] = useState<string[] | null>(null);

  const recompute = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;

    /* The measurer is real in-flow text, so it wraps at the element's true
       available width in any context — a centered shrink-to-fit hero, a grid
       column, a flex track — without us having to guess the width. */
    const wordEls = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (!wordEls.length) return;
    const out: string[] = [];
    let top = wordEls[0].offsetTop;
    let cur: string[] = [];
    wordEls.forEach((w, i) => {
      if (Math.abs(w.offsetTop - top) > 1) {
        out.push(cur.join(" "));
        cur = [];
        top = w.offsetTop;
      }
      cur.push(words[i]);
    });
    if (cur.length) out.push(cur.join(" "));
    setLines((prev) =>
      prev && prev.length === out.length && prev.every((l, i) => l === out[i]) ? prev : out
    );
  }, [words]);

  useLayoutEffect(() => { recompute(); }, [recompute]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recompute]);

  // Re-measure once webfonts load — the first pass can wrap on fallback metrics.
  useEffect(() => {
    const fonts = typeof document !== "undefined" ? document.fonts : null;
    if (!fonts || fonts.status === "loaded") return;
    let cancelled = false;
    fonts.ready.then(() => { if (!cancelled) recompute(); });
    return () => { cancelled = true; };
  }, [recompute]);

  /* Trigger mode, resolved before paint:
     - "load":   element is on-screen while a loader/transition covers it →
                 reveal once the loader clears (after the page loader).
     - "scroll": element is below the fold (or no loader) → reveal on scroll.
     - "hidden": transient, only while we still need to measure the rect. */
  const [mode, setMode] = useState<"hidden" | "load" | "scroll">(() => {
    if (typeof window !== "undefined" && window.__pageTransitionActive) return "hidden";
    return forceLoad ? "load" : "scroll";
  });
  const ready = usePageReady();

  useLayoutEffect(() => {
    if (mode !== "hidden") return;
    if (forceLoad) { setMode("load"); return; }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    setMode(inView ? "load" : "scroll");
  }, [mode, forceLoad]);

  const trigger =
    mode === "scroll"
      ? {
          initial: { y: "110%" },
          whileInView: { y: 0 },
          viewport: { once: true, margin: "-80px" } as const,
        }
      : {
          initial: { y: "110%" },
          animate: mode === "load" && ready ? { y: 0 } : { y: "110%" },
        };

  const maskStyle: CSSProperties = {
    display: "block",
    overflow: "hidden",
    /* room for descenders so the mask doesn't clip g/p/y; the negative
       margin keeps line spacing unchanged */
    paddingBottom: "0.14em",
    marginBottom: "-0.14em",
  };

  // Rich content (links, emoji, …) can't be split per line — reveal as one masked block.
  if (!isString) {
    return (
      <Tag ref={containerRef} className={className} style={style}>
        <span style={maskStyle}>
          <motion.span
            style={{ display: "block", willChange: "transform" }}
            {...trigger}
            transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.span>
        </span>
      </Tag>
    );
  }

  const measureWords = (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span data-w style={{ display: "inline-block" }}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );

  return (
    <Tag ref={containerRef} className={className} style={{ ...style, position: "relative" }}>
      {/* Always-present in-flow measurer: real text that wraps at the true
          available width and gives the element its natural size. Hidden, but it
          (not the masks) is what occupies the layout. */}
      <span ref={measureRef} aria-hidden style={{ visibility: "hidden" }}>
        {measureWords}
      </span>

      {/* Masked lines overlay the measurer exactly (same width, same line
          positions), so the height never doubles and lines re-measure on
          resize/font-load without ever resetting/replaying. */}
      {lines && (
        <span style={{ position: "absolute", inset: 0 }}>
          {lines.map((line, i) => (
            <span key={i} style={maskStyle}>
              <motion.span
                style={{ display: "block", willChange: "transform" }}
                {...trigger}
                transition={{ duration, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </span>
      )}
    </Tag>
  );
}
