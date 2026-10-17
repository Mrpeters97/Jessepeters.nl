"use client";

import AnimatedSvg from "../AnimatedSvg";
import coverSvg from "../svg/lgcCover";
import styles from "./lgc.module.css";

/** Card cover (Figma "Cover"): the contour lines draw themselves, then the lines of the star, then the name rises in. */
export function LgcCover({ alt }: { alt: string }) {
  return <AnimatedSvg svg={coverSvg} cover label={alt} className={`${styles.svg} ${styles.logo} ${styles.cover}`} />;
}
