"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { useInView } from "framer-motion";
import AnimatedSvg from "../AnimatedSvg";
import InstaReveal from "../InstaReveal";
import AnimTile from "../AnimTile";
import StripBoard from "../StripBoard";
import halfSvg from "../svg/pulse20Half";
import instaSvg from "../svg/pulse20Insta";
import uitlegSvg from "../svg/pulse20Uitleg";
import styles from "./pulse20.module.css";

const A = "/projects/Pulse20/anim";

/* The "20" badge of the logo: an ellipse (rx 116, ry 128) slanted and turned with the wordmark. */
const BADGE = "matrix(0.948337 0.317265 -0.45711 0.88941 0 0)";

/**
 * Detail-page hero: on the Pulse20 black, the still outline of the logo's "20"
 * badge. Thin lime outlines of the same shape leave it in a slow, even stream
 * and drift outward, like the pulsing outline of the site's
 * buttons. The static hero image is this field without the moving outlines.
 */
export function Pulse20PageHero({ alt }: { alt: string }) {
  return (
    <div role="img" aria-label={alt} className={styles.hero}>
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <ellipse rx={116.126} ry={128.241} transform={`translate(800 500) scale(1.05) ${BADGE}`} fill="none" stroke="#C5DC59" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {[0, 1, 2].map((i) => (
          <g key={i} className={styles.heroRing} style={{ "--i": i } as CSSProperties}>
            <ellipse rx={116.126} ry={128.241} transform={`translate(800 500) scale(8.4) ${BADGE}`} fill="none" stroke="#C5DC59" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** 2 (Figma "1/2 frame"): guide lines and corners build up, then the logo is sketched in and filled. */
export function Pulse20Build({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#235642" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={halfSvg} className={`${styles.svg} ${styles.build}`} />
    </AnimTile>
  );
}

/** 5 (Figma "overview"): the site in its frame, the border pulsing outward. */
export function Pulse20Overview({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <AnimTile size="half" background="#1E1E1E" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.overview} data-run={inView ? "" : undefined}>
        <Image src={`${A}/5-frame.webp`} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" />
        <span className={styles.pulseRing} />
        <span className={styles.pulseRing} />
        <span className={styles.pulseRing} />
      </div>
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the tilted page columns drift up and down on scroll. */
export function Pulse20Board({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background="#000" delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background="#000"
        angle={10}
        pivot={[1421.42, 1416.1]}
        cuts={[-951.9, 580.2, 951.9]}
        tighten={30}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/** 3 (Figma "uitleg"): the speed lines draw in left to right, then the rings pulse out from the dot three times. */
export function Pulse20Uitleg({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#FFE4BF" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={uitlegSvg} className={`${styles.svg} ${styles.uitleg}`} />
    </AnimTile>
  );
}

const INSTA_CARDS = ["Rectangle 74", "Rectangle 77", "Rectangle 80"];
const INSTA_POSTS = ["Instagram post - 6", "Instagram post - 4", "Instagram post - 6_2"];

/** 8 (Figma "Insta"): the cards fade up one by one, then the posts settle in. */
export function Pulse20Insta({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#235642" delay={delay} mobile={mobile}>
      <InstaReveal svg={instaSvg} cards={INSTA_CARDS} posts={INSTA_POSTS} className={styles.svg} />
    </AnimTile>
  );
}
