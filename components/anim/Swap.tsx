"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import styles from "./swap.module.css";

/**
 * Photos that cross-fade one after the other while in view, like the hero
 * slider of vanhulley.com. The previous photo stays fully visible underneath
 * while the next one fades in over it, so nothing behind ever shows through.
 */
export default function Swap({
  srcs,
  className,
  style,
  interval = 1900,
}: {
  srcs: string[];
  className?: string;
  style?: CSSProperties;
  interval?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();
  const [[index, prev], setPair] = useState<[number, number]>([0, -1]);
  useEffect(() => {
    if (!inView || reduceMotion) return;
    const id = window.setInterval(() => setPair(([i]) => [(i + 1) % srcs.length, i]), interval);
    return () => window.clearInterval(id);
  }, [inView, reduceMotion, srcs.length, interval]);
  return (
    <div ref={ref} className={`${styles.swap} ${className ?? ""}`} style={style}>
      {srcs.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- pre-cropped slides
        <img
          key={src}
          src={src}
          alt=""
          decoding="async"
          loading={i ? "lazy" : undefined}
          data-on={i === index ? "" : undefined}
          data-prev={i === prev ? "" : undefined}
        />
      ))}
    </div>
  );
}
