"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "framer-motion";
import { rise, thumbTitle } from "../svg/dnaRise";
import styles from "./dna.module.css";

const A = "/projects/DNA_Projecten/anim";
const SPEED = 30; // page units per second

type RiseSet = (typeof rise)[keyof typeof rise];

/**
 * The first screen of dnaprojecten.nl: the title stays put while the photos keep
 * coming up from under it. The photo pattern repeats endlessly (two copies of the
 * cycle, shifted one period), so it never jumps back to the start; it pauses off screen.
 */
export function Rise({ frameW, win, set, title }: { frameW: number; win: [number, number, number, number, number]; set: RiseSet; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [wx, wy, ww, wh, radius] = win;
  const u = (px: number) => `calc(${px} * 100cqw / ${frameW})`;
  return (
    <div
      ref={ref}
      className={styles.window}
      data-run={inView ? "" : undefined}
      style={{ left: u(wx), top: u(wy), width: u(ww), height: u(wh), borderRadius: u(radius) }}
    >
      <div
        className={styles.riseTrack}
        style={{ "--period": u(set.period), animationDuration: `${set.period / SPEED}s` } as CSSProperties}
      >
        {[0, 1].flatMap((copy) =>
          set.items.map((it) => (
            // eslint-disable-next-line @next/next/no-img-element -- pre-cropped tiles
            <img
              key={`${copy}-${it.src}`}
              src={`${A}/${it.src}`}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ left: u(it.x), top: u(it.y + copy * set.period), width: u(it.w), height: u(it.h) }}
            />
          )),
        )}
      </div>
      <div className={styles.title} dangerouslySetInnerHTML={{ __html: title }} />
    </div>
  );
}

/** Card cover (Figma "Thumb"): the site in its window, photos rising under the title. */
export function DnaCover({ alt }: { alt: string }) {
  return (
    <div className={styles.coverFit} role="img" aria-label={alt}>
      <div className={styles.coverFrame}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized backdrop */}
        <img src={`${A}/thumb-frame.webp`} alt="" className={styles.fill} decoding="async" />
        <Rise frameW={1839.66} win={[168.43, 153.71, 1429.67, 907.73, 15.13]} set={rise.thumb} title={thumbTitle} />
      </div>
    </div>
  );
}
