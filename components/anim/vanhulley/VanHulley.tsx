"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { useInView, useReducedMotion } from "framer-motion";
import AnimTile from "../AnimTile";
import StripBoard from "../StripBoard";
import Swap from "../Swap";
import { instaStrokes, logo, split8, ticker } from "../svg/vanhulley";
import styles from "./vanhulley.module.css";
import { CoverFit, pct } from "./VanHulleyCover";

const A = "/projects/Van_Hulley/anim";
const DRIFT = 30; // frame px per second, shared by the rows that run

/* the four colour combinations of the logo, stacked as in the Figma frame */
function LogoBands() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className={styles.bands} data-run={inView && !reduceMotion ? "" : undefined}>
      <div className={styles.bandTrack}>
        {/* eslint-disable-next-line @next/next/no-img-element -- vector bands */}
        <img src={`${A}/logo-bands.svg`} alt="" loading="lazy" decoding="async" />
        {/* eslint-disable-next-line @next/next/no-img-element -- second copy for the endless loop */}
        <img src={`${A}/logo-bands.svg`} alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}

/** Detail-page hero (Figma "overview", logos): every colour combination of the logo drifting up, endlessly. */
export function VanHulleyPageHero({ alt }: { alt: string }) {
  return (
    <CoverFit alt={alt} ratio={[1512, 1292]}>
      <LogoBands />
    </CoverFit>
  );
}

/** 2 (Figma "overview", logos): the same drifting logo bands. */
export function VanHulleyLogos({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#FF5C29" delay={delay} mobile={mobile}>
      <LogoBands />
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the tilted site columns drift up and down on scroll. */
export function VanHulleyBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background="#F2D535" delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background="#F2D535"
        angle={-14.15}
        pivot={[1556, 1292]}
        cuts={[-715, 558]}
        tighten={56}
        zoom={1.15}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/** 7 (Figma "1/2 frame", site bottom): the Instagram row drifts right, the newsletter ticker left, at the same slow pace. */
export function VanHulleyFooter({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const W = 3140;
  const u = (px: number) => `calc(${px} * 100cqw / ${W})`;
  const STRIDE = 729.762;
  const instaLoop = STRIDE * 5;
  const tickerCopies = Math.ceil(W / ticker.period) + 2;
  return (
    <AnimTile size="full2" background="#F9F6EF" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill} data-run={inView ? "" : undefined}>
        <Image src="/projects/Van_Hulley/7.jpg" alt="" fill sizes="100vw" />
        <div className={styles.band} style={{ top: u(993.095), height: u(698.6), background: "#F9F6EF" }}>
          <div
            className={`${styles.row} ${styles.toRight}`}
            style={{ left: u(-113 - instaLoop), "--loop": u(instaLoop), animationDuration: `${instaLoop / DRIFT}s` } as CSSProperties}
          >
            {[0, 1, 2].flatMap((copy) =>
              instaStrokes.map((stroke, k) => (
                // eslint-disable-next-line @next/next/no-img-element -- small square tiles
                <img
                  key={`${copy}-${k}`}
                  src={`${A}/7-insta-${k}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ left: u((copy * 5 + k) * STRIDE), top: u(1.64), width: u(696.96), height: u(696.96), outlineColor: stroke }}
                />
              )),
            )}
          </div>
        </div>
        <div className={styles.band} style={{ top: u(1691.7), height: u(245.986), background: "#FF5C29" }}>
          <div
            className={`${styles.row} ${styles.toLeft}`}
            style={{ left: u(ticker.x0), "--loop": u(ticker.period), animationDuration: `${ticker.period / DRIFT}s` } as CSSProperties}
          >
            {Array.from({ length: tickerCopies }, (_, k) => (
              <div
                key={k}
                className={styles.tickerItem}
                style={{ left: u(k * ticker.period), width: u(ticker.period), height: u(245.986) }}
                dangerouslySetInnerHTML={{ __html: ticker.svg }}
              />
            ))}
          </div>
        </div>
      </div>
    </AnimTile>
  );
}

/** 8 (Figma "overview", logo over two photos): the right photo changes like the site's hero. */
export function VanHulleyDuo({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#F9F6EF" delay={delay} mobile={mobile}>
      <Image src="/projects/Van_Hulley/8.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" />
      <Swap
        srcs={[0, 1, 2, 3, 4, 5].map((k) => `${A}/8-slide-${k}.webp`)}
        style={{ left: pct(split8, 1512), top: 0, width: pct(1512 - split8, 1512), height: "100%" }}
      />
      <div
        className={styles.layer}
        style={{ left: pct(406, 1512), top: pct(552, 1292), width: pct(699.667, 1512), height: pct(187.172, 1292) }}
        dangerouslySetInnerHTML={{ __html: logo }}
      />
    </AnimTile>
  );
}
