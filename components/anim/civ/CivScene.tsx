"use client";

import { useId, useRef } from "react";
import { useInView } from "framer-motion";
import { HEADLINE } from "./civShapes";
import styles from "./civ.module.css";

export const A = "/projects/CIV_Water/anim";
export const BG = "#DDEEFF";

/* civwater.nl's hero: a wave runs sideways through the headline, splitting it into
   light and dark blue. Here it's a periodic wave (one period = WAVE_P frame units)
   masked to the letters, so sliding it one period loops without a seam. */
export const WAVE_P = 446;
const MID = 478;
const AMP = 22;

function wavePath(x0: number, x1: number, bottom: number) {
  const h = WAVE_P / 2;
  const k = h * 0.36;
  let d = `M${x0} ${bottom}V${MID - AMP}`;
  for (let x = x0, i = 0; x < x1; x += h, i++) {
    const from = i % 2 ? MID + AMP : MID - AMP;
    const to = i % 2 ? MID - AMP : MID + AMP;
    d += `C${x + k} ${from} ${x + h - k} ${to} ${x + h} ${to}`;
  }
  return `${d}V${bottom}Z`;
}

const WAVE = wavePath(209 - WAVE_P - 20, 1302 + 20, 600);

/** The headline's box in overview-frame units. */
export const HEADLINE_BOX = "209.562 448.175 1092.4 126.16";

/** The headline in overview-frame units; `dx`/`dy` place it in another frame. */
export function Headline({ dx = 0, dy = 0, base = "#B7DBFF", wave = "#3790DA" }: { dx?: number; dy?: number; base?: string; wave?: string }) {
  const id = useId().replace(/[^\w-]/g, "");
  return (
    <g transform={dx || dy ? `translate(${dx} ${dy})` : undefined}>
      <defs>
        <path id={`civ-txt-${id}`} d={HEADLINE} />
        {/* explicit region: the default one is measured from the user-space origin, which misses the text in a viewBox that starts at the headline */}
        <mask id={`civ-txt-mask-${id}`} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={10000} height={10000}>
          <use href={`#civ-txt-${id}`} fill="#fff" />
        </mask>
      </defs>
      <use href={`#civ-txt-${id}`} fill={base} />
      <g mask={`url(#civ-txt-mask-${id})`}>
        <path className={styles.wave} d={WAVE} fill={wave} />
      </g>
    </g>
  );
}

/** Figma "overview" (= Cover.jpg / 2.jpg): the site window with the headline wave. */
export function OverviewScene({ cover = false, mobile = false, label }: { cover?: boolean; mobile?: boolean; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={styles.fill}
      data-run={inView ? "" : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 1512 1292" preserveAspectRatio={cover ? "xMidYMid slice" : "xMidYMid meet"} className={styles.svg}>
        <rect width="1512" height="1292" fill={BG} />
        <image href={`${A}/${mobile ? "window-sm" : "window"}.webp`} x="136" y="252" width="1239" height="788" />
        <Headline />
      </svg>
    </div>
  );
}
