"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import InstaReveal from "../InstaReveal";
import AnimTile from "../AnimTile";
import instaSvg from "../svg/tynaarloInsta";
import styles from "./tynaarlo.module.css";

const A = "/projects/Gemeente_Tynaarlo/anim";

const INSTA_CARDS = ["Rectangle 74", "Rectangle 74_2", "Rectangle 74_3"];
const INSTA_POSTS = ["Vacature HR-adviseur_slide 1", "Vacature HR-adviseur_slide 2", "Vacature HR-adviseur_slide 3"];

/** 3 (Figma "1/2 frame"): the cards fade up one by one, then the carousel slides settle in. */
export function TynaarloInsta({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#00A1B2" delay={delay} mobile={mobile}>
      <InstaReveal svg={instaSvg} cards={INSTA_CARDS} posts={INSTA_POSTS} className={styles.svg} />
    </AnimTile>
  );
}

/** 7 (Figma "Full frame"): the tilted poster row drifts gently left to right while scrolling, like DNA's screens. */
export function TynaarloBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-4%", "4%"]);
  return (
    <AnimTile size="full" background="#33B4C1" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized frame, per device */}
        <motion.img
          src={`${A}/${mobile ? "7-board-sm" : "7-board"}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className={styles.drift}
          style={{ x }}
        />
      </div>
    </AnimTile>
  );
}
