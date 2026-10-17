"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useViewPlay } from "@/hooks/useViewPlay";
import AnimatedSvg from "../AnimatedSvg";
import AnimTile from "../AnimTile";
import StripBoard from "../StripBoard";
import Swap from "../Swap";
import crownSvg from "../svg/pcCrown";
import heroSvg from "../svg/pcHero";
import kingsSvg from "../svg/pcKings";
import logoSvg from "../svg/pcLogo";
import textSvg from "../svg/pcText";
import styles from "./pc.module.css";

const A = "/projects/PC_Franeker/anim";
const NAVY = "#030923";
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Detail-page hero (Figma "79"): the digits of 1854 appear one by one like on the cover. */
export function PcPageHero({ alt }: { alt: string }) {
  return <AnimatedSvg svg={heroSvg} cover replay={false} label={alt} className={`${styles.svg} ${styles.hero}`} />;
}

/** Detail-page hero, above the title: the crown of the logo is set on, bottom to top, like in tile 2. */
export function PcHeroCrown({ play }: { play: boolean }) {
  return (
    <div className={styles.crownBox}>
      <AnimatedSvg svg={crownSvg} play={play} className={`${styles.svg} ${styles.crown}`} />
    </div>
  );
}

/** 2 (Figma "1"): the logo builds up from the bottom — letters first, then the crown. */
export function PcLogo({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={NAVY} delay={delay} mobile={mobile}>
      <AnimatedSvg svg={logoSvg} className={`${styles.svg} ${styles.logo}`} />
    </AnimTile>
  );
}

/** 4 (Figma "3"): the tilted site columns drift up and down on scroll. */
export function PcBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background={NAVY} delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background={NAVY}
        angle={-10}
        pivot={[1556, 1292]}
        cuts={[-865, 694]}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/** 5 (Figma "4"): the crown appears, then the sentence rises in line by line. */
export function PcText({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={NAVY} delay={delay} mobile={mobile}>
      <AnimatedSvg svg={textSvg} className={`${styles.svg} ${styles.text}`} />
    </AnimTile>
  );
}

/** 6 (Figma "5", Koningen van de PC): the four portraits rise into view one after the other. */
export function PcKings({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={NAVY} delay={delay} mobile={mobile}>
      <AnimatedSvg svg={kingsSvg} className={`${styles.svg} ${styles.kings}`} />
    </AnimTile>
  );
}

/* the two rows of kings in the 3112 × 2584 frame (Figma "6"), wider than the frame on both sides */
const ROWS = [
  { src: "7-row1", x: -1607.87, y: -27.99, w: 5402.5, from: -400, to: 800 },
  { src: "7-row2", x: -136.15, y: 517.27, w: 5946.25, from: 120, to: -1080 },
];

/** 7 (Figma "6"): the rows of kings slide in opposite directions while scrolling, like on pc-franeker.nl. */
export function PcRows({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return (
    <AnimTile size="full" background={NAVY} delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the page without its rows */}
        <img src={`${A}/7-base${mobile ? "-sm" : ""}.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
        {ROWS.map((row) => (
          <Row key={row.src} row={row} progress={scrollYProgress} still={!!reduceMotion} />
        ))}
      </div>
    </AnimTile>
  );
}

function Row({
  row,
  progress,
  still,
}: {
  row: (typeof ROWS)[number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  still: boolean;
}) {
  const shift = useTransform(progress, [0, 1], still ? [0, 0] : [row.from, row.to]);
  const x = useTransform(shift, (v) => `calc(${v} * 100cqw / 3112)`);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- one strip per row
    <motion.img
      src={`${A}/${row.src}.webp`}
      alt=""
      loading="lazy"
      decoding="async"
      className={styles.row}
      style={{ left: pct(row.x, 3112), top: pct(row.y, 2584), width: pct(row.w, 3112), height: pct(509.627, 2584), x }}
    />
  );
}

/* the photos around "Onze rijke historie" (Figma "7"), cut from the frame, in the order they appear */
const PHOTOS: [string, number, number, number, number][] = [
  ["crowd", 280.49, 472.72, 225.7, 184.69],
  ["team", 624.89, 376.35, 261.85, 159.42],
  ["player", 1021.64, 433.44, 206.2, 193.86],
  ["royals", 1019.68, 750.31, 280.15, 242.31],
  ["ball", 639.49, 710.37, 246.77, 163.09],
  ["oldmatch", 216.76, 843.27, 222.56, 149.99],
];

/** 8 (Figma "7"): the photos appear one by one around the title, clockwise. */
export function PcHistory({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { play } = useViewPlay(ref);
  const reduceMotion = useReducedMotion();
  return (
    <AnimTile size="half" background={NAVY} delay={delay} mobile={mobile}>
      <div ref={ref} className={`${styles.fill} ${styles.history}`} data-play={play || reduceMotion ? "" : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the page without its photos */}
        <img src={`${A}/8-base.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
        {PHOTOS.map(([k, x, y, w, h], i) => (
          // eslint-disable-next-line @next/next/no-img-element -- photo cut from the frame
          <img
            key={k}
            src={`${A}/8-${k}.webp`}
            alt=""
            loading="lazy"
            decoding="async"
            className={styles.photo}
            style={{ left: pct(x, 1512), top: pct(y, 1292), width: pct(w, 1512), height: pct(h, 1292), "--i": i } as CSSProperties}
          />
        ))}
      </div>
    </AnimTile>
  );
}

/** 3 (the old committee photo): a slider through photos from the PC's history, like the hero of Van Hulley. */
export function PcSlides({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#000" delay={delay} mobile={mobile}>
      <Swap
        srcs={["/projects/PC_Franeker/9.jpg", ...[1, 2, 3].map((k) => `${A}/9-slide-${k}.webp`)]}
        style={{ inset: 0 }}
      />
    </AnimTile>
  );
}

/** 9 (the player in the striped shirt): a slider through older black-and-white photos of kings from pc-franeker.nl, like tile 3. */
export function PcPlayers({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#000" delay={delay} mobile={mobile}>
      <Swap
        srcs={["/projects/PC_Franeker/3.jpg", ...[1, 2, 3].map((k) => `${A}/3-slide-${k}.webp`)]}
        style={{ inset: 0 }}
      />
    </AnimTile>
  );
}
