"use client";

import type { CSSProperties, ReactNode } from "react";
import Swap from "../Swap";
import { heroOverlay } from "../svg/vanhulleyHero";
import styles from "./vanhulley.module.css";

const A = "/projects/Van_Hulley/anim";

/** A frame filling its box like object-fit: cover. */
export function CoverFit({ alt, ratio, children }: { alt: string; ratio: [number, number]; children: ReactNode }) {
  return (
    <div className={styles.coverFit} role="img" aria-label={alt}>
      <div className={styles.coverFrame} style={{ "--ratio": `${ratio[0]} / ${ratio[1]}`, "--r": ratio[0] / ratio[1] } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

export const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Card cover (Figma "Main image", as 1.jpg): the right photo of the site's hero keeps changing. */
export function VanHulleyCover({ alt }: { alt: string }) {
  const W = 2871;
  const H = 1305;
  return (
    <CoverFit alt={alt} ratio={[W, H]}>
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized backdrop */}
      <img src={`${A}/main-frame.webp`} alt="" decoding="async" className={styles.fill} />
      <Swap
        srcs={[0, 1, 2, 3, 4, 5].map((k) => `${A}/hero-slide-${k}.webp`)}
        className={styles.heroSlides}
        style={{ left: pct(745.379, W), top: pct(296.264, H), width: pct(625.373, W), height: pct(716.573, H) }}
      />
      <div
        className={styles.layer}
        style={{ left: pct(120, W), top: pct(296.264, H), width: pct(1249.8, W), height: pct(1009, H) }}
        dangerouslySetInnerHTML={{ __html: heroOverlay }}
      />
    </CoverFit>
  );
}
