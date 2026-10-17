"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "framer-motion";
import { useViewPlay } from "@/hooks/useViewPlay";
import AnimTile from "../AnimTile";
import Award from "../Award";
import StripBoard from "../StripBoard";
import introLogoSvg from "../svg/oanIntroLogo";
import timetableSvg from "../svg/oanTimetable";
import agenciesSvg from "../svg/oanAgencies";
import AnimatedSvg from "../AnimatedSvg";
import styles from "./oan.module.css";
import { BlobScene, pct, SCENES, Y, type Blob } from "./OanCover";
import { markup } from "../markup";

const A = "/projects/Open_Agency_Night/anim";

/* the hero (1.jpg) has no Figma frame: its blobs were fitted to the image, the logo keyed out of it */
const HERO = { w: 2871, h: 1305, bg: "#222222", logo: [827, 459, 1218, 388] as const };
const HERO_BLOBS: (Blob & { name: string })[] = [
  { name: "hero-blob-yellow", src: "hero-blob-yellow", cx: 1025, cy: 237, half: 1252.8, yellow: Y },
  { name: "hero-blob-purple", src: "hero-blob-purple", cx: 1850, cy: 825, half: 1215.05, yellow: !Y },
];

/** Detail-page hero (1.jpg): the yellow and purple blobs drift behind the logo. */
export function OanPageHero({ alt }: { alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const { w, h, logo } = HERO;
  return (
    <div className={styles.coverFit} role="img" aria-label={alt}>
      <div className={styles.coverFrame}>
        <div ref={ref} className={styles.scene} style={{ background: HERO.bg }} data-run={inView ? "" : undefined}>
          {HERO_BLOBS.map((b) => (
            // eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob
            <img
              key={b.name}
              src={`${A}/${b.src}.webp`}
              alt=""
              decoding="async"
              className={`${styles.blob} ${b.yellow ? styles.yellow : styles.purple}`}
              style={{ left: pct(b.cx - b.half, w), top: pct(b.cy - b.half, h), width: pct(2 * b.half, w), height: pct(2 * b.half, h) }}
            />
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element -- the logo, keyed out of the hero */}
          <img
            src={`${A}/hero-logo.webp`}
            alt=""
            decoding="async"
            className={styles.blob}
            style={{ left: pct(logo[0], w), top: pct(logo[1], h), width: pct(logo[2], w), height: pct(logo[3], h), animation: "none" }}
          />
        </div>
      </div>
    </div>
  );
}

/** 3 (Figma "1/2 frame", agencies map): the same drifting blobs. */
export function OanMap({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={SCENES.half2.bg} delay={delay} mobile={mobile}>
      <BlobScene scene={SCENES.half2} />
    </AnimTile>
  );
}

/* the window of the home 1/2 frame: x, y, width, height, radius (1512 × 1292) */
const WIN = [137, 252, 1238.98, 788, 20] as const;

/**
 * New tile: the intro of openagencynight.nl in the site window. The logo waits as a dark
 * ghost on the grainy page, is lit white from left to right, then the header, the blobs
 * and the scroll hint follow. Plays when it comes into view.
 */
export function OanIntro({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { play, run } = useViewPlay(ref, 0.4);
  const [wx, wy, ww, wh, rx] = WIN;
  const W = 1512;
  const H = 1292;
  const inWin = (x: number, y: number, w: number, h: number) => ({ left: pct(x, ww), top: pct(y, wh), width: pct(w, ww), height: pct(h, wh) });
  const LOGO_W = ww * 0.48;
  const LOGO_H = (LOGO_W * 219) / 694;
  return (
    <AnimTile size="half" background="#323232" delay={delay} mobile={mobile}>
      <div ref={ref} className={`${styles.scene} ${styles.intro}`} data-play={play ? "" : undefined} data-run={run ? "" : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- window background and shadow */}
        <img src={`${A}/half1-shell.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
        <div
          className={`${styles.window} ${styles.introWindow}`}
          style={{ left: pct(wx, W), top: pct(wy, H), width: pct(ww, W), height: pct(wh, H), borderRadius: `calc(${rx} * 100cqw / ${W})`, backgroundImage: `url(${A}/intro-grain.png)` } as CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob */}
          <img src={`${A}/blob-4a2f8c-649-08.webp`} alt="" loading="lazy" decoding="async" className={`${styles.blob} ${styles.introBlob} ${styles.purple}`} style={inWin(-715, -755, 1589, 1589)} />
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob */}
          <img src={`${A}/blob-fff200-649-08.webp`} alt="" loading="lazy" decoding="async" className={`${styles.blob} ${styles.introBlob} ${styles.yellow}`} style={inWin(375, -25, 1589, 1589)} />
          {/* eslint-disable-next-line @next/next/no-img-element -- the site header, from the Figma frame */}
          <img src={`${A}/intro-header.webp`} alt="" loading="lazy" decoding="async" className={`${styles.blob} ${styles.introHeader}`} style={inWin(0, 27.72, ww, 54.81)} />
          <div
            className={styles.introLogo}
            style={inWin((ww - LOGO_W) / 2, (wh - LOGO_H) / 2, LOGO_W, LOGO_H)}
            dangerouslySetInnerHTML={markup(introLogoSvg)}
          />
          <svg className={styles.introScroll} style={inWin(ww / 2 - 26, wh - 92, 52, 52)} viewBox="0 0 52 52" aria-hidden>
            <circle cx="26" cy="26" r="25" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" />
            <path d="M26 17v18M19 28l7 7 7-7" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </AnimTile>
  );
}

/**
 * New tile: the timetable of the OAN site in the same window. The title and the hours come
 * first, then row by row the bars grow in from the left, their copy just after.
 */
export function OanTimetable({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [wx, wy, ww, wh, rx] = WIN;
  const W = 1512;
  const H = 1292;
  const inWin = (x: number, y: number, w: number, h: number) => ({ left: pct(x, ww), top: pct(y, wh), width: pct(w, ww), height: pct(h, wh) });
  return (
    <AnimTile size="half" background="#323232" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.scene} data-run={inView ? "" : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- window background and shadow */}
        <img src={`${A}/half1-shell.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
        <div
          className={`${styles.window} ${styles.introWindow}`}
          style={{ left: pct(wx, W), top: pct(wy, H), width: pct(ww, W), height: pct(wh, H), borderRadius: `calc(${rx} * 100cqw / ${W})`, backgroundImage: `url(${A}/intro-grain.png)` } as CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob */}
          <img src={`${A}/blob-fff200-283-03.webp`} alt="" loading="lazy" decoding="async" className={`${styles.blob} ${styles.yellow}`} style={inWin(780, -560, 1166, 1166)} />
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob */}
          <img src={`${A}/blob-4a2f8c-283-03.webp`} alt="" loading="lazy" decoding="async" className={`${styles.blob} ${styles.purple}`} style={inWin(-560, 230, 1166, 1166)} />
          <AnimatedSvg svg={timetableSvg} className={`${styles.svg} ${styles.timetable}`} />
        </div>
      </div>
    </AnimTile>
  );
}

/**
 * New tile: the agencies list of the OAN site in the same window. The title first, then the
 * rules draw in and, one by one, each agency slides in with its tags just after.
 */
export function OanAgencies({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [wx, wy, ww, wh, rx] = WIN;
  const W = 1512;
  const H = 1292;
  const inWin = (x: number, y: number, w: number, h: number) => ({ left: pct(x, ww), top: pct(y, wh), width: pct(w, ww), height: pct(h, wh) });
  return (
    <AnimTile size="half" background="#323232" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.scene} data-run={inView ? "" : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- window background and shadow */}
        <img src={`${A}/half1-shell.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
        <div
          className={`${styles.window} ${styles.introWindow}`}
          style={{ left: pct(wx, W), top: pct(wy, H), width: pct(ww, W), height: pct(wh, H), borderRadius: `calc(${rx} * 100cqw / ${W})`, backgroundImage: `url(${A}/intro-grain.png)` } as CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob */}
          <img src={`${A}/blob-4a2f8c-283-03.webp`} alt="" loading="lazy" decoding="async" className={`${styles.blob} ${styles.purple}`} style={inWin(700, -620, 1166, 1166)} />
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-blurred blob */}
          <img src={`${A}/blob-fff200-283-06.webp`} alt="" loading="lazy" decoding="async" className={`${styles.blob} ${styles.yellow}`} style={inWin(-333, 67, 1166, 1166)} />
          <AnimatedSvg svg={agenciesSvg} className={`${styles.svg} ${styles.agencies}`} />
        </div>
      </div>
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the tilted site columns drift up and down on scroll. */
export function OanBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background="#323232" delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background="#323232"
        angle={-15}
        pivot={[1556, 1292]}
        cuts={[-427, 949]}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/** 5 (Figma "Frame 807"): the Awwwards certificate is revealed bottom-up, like the DNA awards. */
export function OanAward({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return <Award src={`${A}/5-certificate.webp`} background="#2F9B9E" delay={delay} mobile={mobile} />;
}
