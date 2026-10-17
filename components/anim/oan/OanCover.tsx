"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "framer-motion";
import styles from "./oan.module.css";

const A = "/projects/Open_Agency_Night/anim";
export const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export type Blob = { src: string; cx: number; cy: number; half: number; yellow: boolean };
type Scene = {
  key: string;
  w: number;
  h: number;
  bg: string;
  /** the site window: x, y, width, height, corner radius */
  win: [number, number, number, number, number];
  /** blurred blobs behind the window */
  outer: Blob[];
  /** their reflections inside the (glass) window */
  inner: Blob[];
};

export const Y = true;
export const SCENES: Record<"cover" | "half2", Scene> = {
  cover: {
    key: "cover", w: 2871, h: 1305, bg: "#1E1E1E", win: [730.32, 204, 1410.37, 897, 20],
    outer: [
      { src: "blob-fff200-649-05", cx: 2341.27, cy: -0.94, half: 1289.37, yellow: Y },
      { src: "blob-4a2f8c-649-08", cx: 658.63, cy: 1058.5, half: 1289.37, yellow: !Y },
    ],
    inner: [
      { src: "blob-4a2f8c-649-08", cx: 917.68, cy: 1101, half: 1289.37, yellow: !Y },
      { src: "blob-fff200-649-08", cx: 2567.81, cy: 169.73, half: 1289.37, yellow: Y },
    ],
  },
  half2: {
    key: "half2", w: 1512, h: 1292, bg: "#323232", win: [136, 252, 1239, 788, 20],
    outer: [
      { src: "blob-4a2f8c-283-03", cx: 233, cy: 945, half: 583, yellow: !Y },
      { src: "blob-fff200-283-03", cx: 1314, cy: 312, half: 583, yellow: Y },
    ],
    inner: [
      { src: "blob-fff200-283-06", cx: 1274, cy: 391, half: 583, yellow: Y },
      { src: "blob-4a2f8c-283-06", cx: 355, cy: 848, half: 583, yellow: !Y },
      { src: "blob-4a2f8c-304-08", cx: 1849, cy: 112, half: 604, yellow: !Y },
    ],
  },
};

/**
 * A frame of the site with the yellow and purple blobs drifting slowly behind
 * (and, mirrored, inside) its glass window. Layers, bottom to top: blobs,
 * window shell (background + shadow), the blobs seen through the window,
 * window content. Blobs are pre-blurred images, so moving them stays cheap.
 */
export function BlobScene({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const { w, h, win } = scene;
  const [wx, wy, ww, wh, rx] = win;
  const blob = (b: Blob, ox: number, oy: number, bw: number, bh: number, i: number) => (
    // eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob
    <img
      key={`${b.src}-${i}`}
      src={`${A}/${b.src}.webp`}
      alt=""
      loading="lazy"
      decoding="async"
      className={`${styles.blob} ${b.yellow ? styles.yellow : styles.purple}`}
      style={{ left: pct(b.cx - b.half - ox, bw), top: pct(b.cy - b.half - oy, bh), width: pct(2 * b.half, bw), height: pct(2 * b.half, bh) }}
    />
  );
  return (
    <div ref={ref} className={styles.scene} style={{ background: scene.bg }} data-run={inView ? "" : undefined}>
      {scene.outer.map((b, i) => blob(b, 0, 0, w, h, i))}
      {/* eslint-disable-next-line @next/next/no-img-element -- window background and shadow */}
      <img src={`${A}/${scene.key}-shell.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
      <div
        className={styles.window}
        style={{ left: pct(wx, w), top: pct(wy, h), width: pct(ww, w), height: pct(wh, h), borderRadius: `calc(${rx} * 100cqw / ${w})` } as CSSProperties}
      >
        {scene.inner.map((b, i) => blob(b, wx, wy, ww, wh, i))}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- window content */}
      <img src={`${A}/${scene.key}-content.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
    </div>
  );
}

/** Card cover (Figma "Cover"): the yellow and purple blobs drift slowly behind the site window. */
export function OanCover({ alt }: { alt: string }) {
  return (
    <div className={styles.coverFit} role="img" aria-label={alt}>
      <div className={styles.coverFrame}>
        <BlobScene scene={SCENES.cover} />
      </div>
    </div>
  );
}
