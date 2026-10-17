"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * A flat render of a tilted Figma collage, cut into its columns (or rows) by
 * rotated windows that drift along their own axis while the tile scrolls by,
 * alternating direction — the DVO screen board, without needing the columns as
 * separate artwork.
 *
 * Geometry is in Figma frame pixels: the columns were laid out unrotated around
 * `pivot` and turned `angle` degrees; `cuts` are the window edges along the
 * columns' cross axis, relative to the pivot (split mid-gap). A slight `zoom`
 * keeps the columns' cut-off ends outside the frame while they drift.
 */
export default function StripBoard({
  src,
  srcMobile,
  width,
  height,
  background,
  angle,
  pivot,
  cuts,
  axis = "y",
  drift = 0.04,
  zoom = 1.1,
  tighten = 0,
  mobile = false,
}: {
  src: string;
  srcMobile: string;
  /** Figma frame size (px). */
  width: number;
  height: number;
  background: string;
  angle: number;
  pivot: [number, number];
  /** Inner window edges, ascending (frame px from the pivot, across the columns). */
  cuts: number[];
  /** "y": columns slide along their length; "x": rows slide sideways. */
  axis?: "x" | "y";
  /** Drift amplitude each way, as a share of the frame's length along `axis`. */
  drift?: number;
  zoom?: number;
  /** Pulls neighbouring columns this much closer (frame px), narrowing the gaps of the collage. */
  tighten?: number;
  mobile?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const amp = drift * (axis === "y" ? height : width);
  const fwd = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [amp, -amp]);
  const back = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-amp, amp]);

  const u = (px: number) => `calc(${px} * 100cqw / ${width})`;
  const FAR = Math.max(width, height) * 2;
  const edges = [-FAR, ...cuts, FAR];

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: background, containerType: "inline-size" }}
    >
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})` }}>
        <div style={{ position: "absolute", left: u(pivot[0]), top: u(pivot[1]), transform: `rotate(${angle}deg)` }}>
          {edges.slice(0, -1).map((from, i) => (
            <Strip
              key={i}
              from={from}
              to={edges[i + 1]}
              pull={((edges.length - 2) / 2 - i) * tighten}
              far={FAR}
              axis={axis}
              shift={i % 2 ? back : fwd}
              u={u}
              angle={angle}
              pivot={pivot}
              src={mobile ? srcMobile : src}
              width={width}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Strip({
  from,
  to,
  pull,
  far,
  axis,
  shift,
  u,
  angle,
  pivot,
  src,
  width,
}: {
  from: number;
  to: number;
  /** cross-axis offset towards the middle column; the window and its content move together */
  pull: number;
  far: number;
  axis: "x" | "y";
  shift: MotionValue<number>;
  u: (px: number) => string;
  angle: number;
  pivot: [number, number];
  src: string;
  width: number;
}) {
  const move = useTransform(shift, (v) => u(v));
  // window: a band across the cross axis, endless along the drift axis
  const band =
    axis === "y"
      ? { left: u(from + pull), width: u(to - from), top: u(-far), height: u(2 * far) }
      : { top: u(from + pull), height: u(to - from), left: u(-far), width: u(2 * far) };
  // counter-offset that puts the window's content back on the pivot
  const back = axis === "y" ? { left: u(-from), top: u(far) } : { top: u(-from), left: u(far) };
  return (
    <motion.div style={{ position: "absolute", overflow: "hidden", ...band, [axis]: move }}>
      <div style={{ position: "absolute", width: 0, height: 0, ...back, transform: `rotate(${-angle}deg)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- one flat render, pre-sized per device */}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ position: "absolute", left: u(-pivot[0]), top: u(-pivot[1]), width: u(width), maxWidth: "none" }}
        />
      </div>
    </motion.div>
  );
}
