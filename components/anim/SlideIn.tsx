"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useViewPlay } from "@/hooks/useViewPlay";

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** A cut-out part of a frame: `box` is [x, y, width, height] in the frame's pixels. */
export type SlideLayer = { src: string; box: [number, number, number, number] };

/**
 * A frame's parts (phones, pages, screens) coming in one after another, left to
 * right, once the tile is in view. `dir` holds the `<src>.webp` cut-outs; on
 * `mobile` their `-sm` copies are used.
 */
export default function SlideIn({
  dir,
  w,
  h,
  layers,
  mobile,
  start = 0.15,
  stagger = 0.16,
}: {
  dir: string;
  w: number;
  h: number;
  layers: SlideLayer[];
  mobile?: boolean;
  start?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { play } = useViewPlay(ref);
  const reduceMotion = useReducedMotion();
  const shown = play || !!reduceMotion;
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      {layers.map(({ src, box: [x, y, bw, bh] }, i) => (
        <motion.img
          key={src}
          src={`${dir}/${src}${mobile ? "-sm" : ""}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ position: "absolute", maxWidth: "none", willChange: "transform, opacity", left: pct(x, w), top: pct(y, h), width: pct(bw, w), height: pct(bh, h) }}
          initial={false}
          animate={shown ? { opacity: 1, x: "0%" } : { opacity: 0, x: "-12%" }}
          transition={shown ? { duration: 1.4, delay: start + i * stagger, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        />
      ))}
    </div>
  );
}
