"use client";

import AnimatedSvg from "../AnimatedSvg";
import coverSvg from "../svg/wdwCover";
import styles from "./wdw.module.css";

/** Card cover (the site's hero in its window): the white glow keeps drifting subtly; the arrows drop in once the card is in view. */
export function WdwCover({ alt }: { alt: string }) {
  return <AnimatedSvg svg={coverSvg} cover label={alt} className={`${styles.svg} ${styles.full} ${styles.cover}`} />;
}
