"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { ProjectBoard } from "@/lib/data";
import styles from "./ScrollBoard.module.css";

/**
 * A tilted collage of screen columns inside a fixed full-width tile. While the
 * tile passes through the viewport the columns drift along their length,
 * alternating up and down (after marrit.design's case board, turned vertical).
 * Static with reduced motion. The strips are mounted once the tile nears the
 * viewport and served as-is (full size on desktop, a `-sm` half-width copy on
 * mobile): the image optimizer stalls on these very tall transparent strips.
 */
export default function ScrollBoard({
  columns,
  background,
  delay = 0,
  mobile = false,
}: {
  columns: ProjectBoard["columns"];
  background: string;
  delay?: number;
  mobile?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const near = useInView(ref, { once: true, margin: "50% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [7, -7]);
  const down = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-7, 7]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={styles.wrap}
      style={{ backgroundColor: background }}
      initial={{ opacity: 0, y: mobile ? 28 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: mobile ? "-12%" : "-18%" }}
      transition={{ duration: mobile ? 1 : 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.collage}>
        {columns.map((col, i) => (
          <Column key={col.src} col={col} drift={i % 2 ? down : up} load={near} mobile={mobile} />
        ))}
      </div>
    </motion.div>
  );
}

function Column({
  col,
  drift,
  load,
  mobile,
}: {
  col: ProjectBoard["columns"][number];
  drift: MotionValue<number>;
  load: boolean;
  mobile: boolean;
}) {
  const y = useTransform(drift, (v) => `${col.offset + v}cqw`);
  return (
    <motion.div className={styles.column} style={{ width: `${col.w}cqw`, height: `${col.h}cqw`, y }}>
      {load && <Image src={mobile ? col.src.replace(/\.webp$/, "-sm.webp") : col.src} alt="" fill unoptimized />}
    </motion.div>
  );
}
