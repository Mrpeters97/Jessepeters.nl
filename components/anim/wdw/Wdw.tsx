"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "framer-motion";
import AnimatedSvg from "../AnimatedSvg";
import AnimTile from "../AnimTile";
import StripBoard from "../StripBoard";
import arrowsSvg from "../svg/wdwArrows";
import circlesSvg from "../svg/wdwCircles";
import circlesHeroSvg from "../svg/wdwCirclesHero";
import fullSvg from "../svg/wdwFull";
import pageCirclesSvg from "../svg/wdwPageCircles";
import styles from "./wdw.module.css";

const A = "/projects/WDW/anim";
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Detail-page hero (Figma "1/2 frame", circles): the circles grow out of each other, top left to bottom right. */
export function WdwPageHero({ alt }: { alt: string }) {
  return <AnimatedSvg svg={circlesHeroSvg} cover label={alt} className={`${styles.svg} ${styles.circles}`} />;
}

/** Last tile (Figma "Full", tilted site pages): the columns drift up and down on scroll. */
export function WdwBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full2" background="#2C2C2C" delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/1-board.webp`}
        srcMobile={`${A}/1-board-sm.webp`}
        width={3140}
        height={2584}
        background="#2C2C2C"
        angle={-15}
        pivot={[1570, 1292]}
        cuts={[-605, -1, 1168]}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/* the logo image sits at (463, 565.4) in the 1512 × 1292 frame, 0.2604 frame px per image px;
   the icon is its left 630 px and turns around the hexagon in its middle (294, 312.6) */
const LOGO = { x: 463, y: 565.42, s: 0.26042, h: 161.16, split: 630, origin: [294 / 630, 312.6 / 618] };

/** 2 (Figma "overview"): the logo icon turns clockwise with a pause after every turn; the glow drifts slowly through the frame. */
export function WdwOverview({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const W = 1512;
  const H = 1292;
  const GLOW = 1980; // rendered size of the blurred disc (r 390.5, blur 200) around its centre (755.5, 1376.5)
  return (
    <AnimTile size="half" background="#1A1A1A" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill} data-run={inView ? "" : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-blurred glow */}
        <img
          src={`${A}/overview-glow.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className={styles.glow}
          style={{ left: pct(755.5 - GLOW / 2, W), top: pct(1376.5 - GLOW / 2, H), width: pct(GLOW, W), height: pct(GLOW, H) }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- logo wordmark */}
        <img
          src={`${A}/overview-word.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className={styles.abs}
          style={{
            left: pct(LOGO.x + LOGO.split * LOGO.s, W),
            top: pct(LOGO.y, H),
            width: pct((2187 - LOGO.split) * LOGO.s, W),
            height: pct(LOGO.h, H),
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- logo icon */}
        <img
          src={`${A}/overview-icon.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className={`${styles.abs} ${styles.icon}`}
          style={
            {
              left: pct(LOGO.x, W),
              top: pct(LOGO.y, H),
              width: pct(LOGO.split * LOGO.s, W),
              height: pct(LOGO.h, H),
              transformOrigin: `${LOGO.origin[0] * 100}% ${LOGO.origin[1] * 100}%`,
            } as CSSProperties
          }
        />
      </div>
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the red arrows of the site's hero drop into place once the frame is in view. */
export function WdwFull({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background="#323232" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={fullSvg} className={`${styles.svg} ${styles.full}`} />
    </AnimTile>
  );
}

/** 5 (Figma "1/2 frame", arrows): the arrows slide in once, left to right. */
export function WdwArrows({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#1A1A1A" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={arrowsSvg} className={`${styles.svg} ${styles.arrows}`} />
    </AnimTile>
  );
}

/** 7 (Figma "1/2 frame", two pages): only the red circles in the page headers move — they grow in one by one, along each row. */
export function WdwPages({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const sm = mobile ? "-sm" : "";
  return (
    <AnimTile size="full2" background="#323232" delay={delay} mobile={mobile}>
      {/* eslint-disable-next-line @next/next/no-img-element -- page backgrounds, under the circles */}
      <img src={`${A}/7-under${sm}.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
      <AnimatedSvg svg={pageCirclesSvg} className={`${styles.svg} ${styles.pageCircles}`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- page content, over the circles */}
      <img src={`${A}/7-over${sm}.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
    </AnimTile>
  );
}

/** 9 (Figma "1/2 frame", circles): the circles grow out of each other once, top left to bottom right. */
export function WdwCircles({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#323232" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={circlesSvg} className={`${styles.svg} ${styles.circles}`} />
    </AnimTile>
  );
}
