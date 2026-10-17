"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import AnimTile from "../AnimTile";
import AnimatedSvg from "../AnimatedSvg";
import Award from "../Award";
import StripBoard from "../StripBoard";
import logoSvg from "../svg/dnaLogo";
import ringsSvg from "../svg/dnaRings";
import { overviewTitle, rise } from "../svg/dnaRise";
import styles from "./dna.module.css";
import { Rise } from "./DnaCover";

const A = "/projects/DNA_Projecten/anim";

/** 2 (Figma "overview"): the same rising photos, full frame. */
export function DnaOverview({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#0A0A0D" delay={delay} mobile={mobile}>
      <Rise frameW={1512} win={[-44, 0, 1600, 1292, 0]} set={rise.overview} title={overviewTitle} />
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the tilted site columns drift up and down on scroll. */
export function DnaBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background="#323232" delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background="#323232"
        angle={18.25}
        pivot={[1556, 1292]}
        cuts={[-1071.25, 33, 1141]}
        tighten={40}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/** 5 (Figma "1/2 frame", rings): the site's loader — pairs of pulses grow out of the inner ring and fade, over and over. */
export function DnaRings({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#0A0A0D" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={ringsSvg} className={`${styles.svg} ${styles.rings}`} />
      <span className={styles.pulse} />
      <span className={styles.pulse} />
    </AnimTile>
  );
}

/** 6 (Figma "LOGO"): guides draw, the rings are drawn, then the wordmark is sketched and filled. */
export function DnaLogo({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#0A0A0D" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={logoSvg} className={`${styles.svg} ${styles.logo}`} />
    </AnimTile>
  );
}

/** 7 (Figma "1/2 frame", full width): the phone screens drift gently left to right while scrolling. */
export function DnaScreens({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-4%", "4%"]);
  return (
    <AnimTile size="full2" background="#323232" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized frame */}
        <motion.img src={`${A}/7-frame.webp`} alt="" loading="lazy" decoding="async" className={styles.drift} style={{ x }} />
      </div>
    </AnimTile>
  );
}

export function DnaHonors({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return <Award src={`${A}/10-certificate.webp`} background="#2F9B9E" delay={delay} mobile={mobile} />;
}

export function DnaSotd({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return <Award src={`${A}/11-certificate.webp`} background="#39D8F8" delay={delay} mobile={mobile} />;
}
