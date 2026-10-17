"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useViewPlay } from "@/hooks/useViewPlay";
import AnimTile from "./AnimTile";
import styles from "./award.module.css";

/**
 * An Awwwards certificate on a flat half frame, revealed bottom-up when it
 * scrolls in — like a Moments photo opening. `src` is the certificate cropped
 * from the frame at (397, 170) in 1512 × 1292.
 */
export default function Award({ src, background, delay, mobile }: { src: string; background: string; delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { play } = useViewPlay(ref);
  const reduceMotion = useReducedMotion();
  const shown = reduceMotion || play;
  return (
    <AnimTile size="half" background={background} delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill}>
        <motion.img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className={styles.award}
          initial={false}
          animate={{ clipPath: shown ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1], delay: play ? 0.2 : 0 }}
        />
      </div>
    </AnimTile>
  );
}
