"use client";

import AnimatedSvg from "../AnimatedSvg";
import coverSvg from "../svg/pulse20Cover";
import styles from "./pulse20.module.css";

/** Card cover (Figma "Main image"): the logo, with the outer ring around the "20" pulsing. */
export function Pulse20Cover({ alt }: { alt: string }) {
  return <AnimatedSvg svg={coverSvg} cover label={alt} className={`${styles.svg} ${styles.cover}`} />;
}
