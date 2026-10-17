"use client";

import AnimatedSvg from "../AnimatedSvg";
import coverSvg from "../svg/pcCover";
import styles from "./pc.module.css";

/** Card cover (Figma "78"): the digits of 1854 appear one by one, then the logo builds up from the bottom. */
export function PcCover({ alt }: { alt: string }) {
  return <AnimatedSvg svg={coverSvg} cover label={alt} className={`${styles.svg} ${styles.logo} ${styles.cover}`} />;
}
