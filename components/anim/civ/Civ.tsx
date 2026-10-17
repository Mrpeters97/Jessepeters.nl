"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import AnimTile from "../AnimTile";
import StripBoard from "../StripBoard";
import { A, BG, Headline, OverviewScene } from "./CivScene";
import { MEANDER, MENU_SHAPE } from "./civShapes";
import styles from "./civ.module.css";

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/* the slide-ins: the frame's parts come in one after another, left to right */
type Layer = { src: string; box: [number, number, number, number] };

function SlideIn({ w, h, layers, mobile, start = 0.15, stagger = 0.16 }: { w: number; h: number; layers: Layer[]; mobile?: boolean; start?: number; stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const shown = inView || !!reduceMotion;
  return (
    <div ref={ref} className={styles.fill}>
      {layers.map(({ src, box: [x, y, bw, bh] }, i) => (
        <motion.img
          key={src}
          src={`${A}/${src}${mobile ? "-sm" : ""}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className={styles.layer}
          style={{ left: pct(x, w), top: pct(y, h), width: pct(bw, w), height: pct(bh, h) }}
          initial={false}
          animate={shown ? { opacity: 1, x: "0%" } : { opacity: 0, x: "-12%" }}
          transition={shown ? { duration: 1.4, delay: start + i * stagger, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        />
      ))}
    </div>
  );
}

const PAGES: Layer[] = [
  { src: "p1", box: [-160, 0, 1034, 1305] },
  { src: "p2", box: [919, 0, 1034, 1305] },
  { src: "p3", box: [1999, 0, 1034, 1305] },
];

/** Detail-page hero (1.jpg, contact / agenda / actueel): the three pages come in from left to right, over its plain background. */
export function CivPageHero({ alt }: { alt: string }) {
  return (
    <div className={styles.coverFit} role="img" aria-label={alt}>
      <div className={styles.coverFrame}>
        {/* mounts as the loader starts its 0.7 s wipe, so the pages wait for it to clear */}
        <SlideIn w={2871} h={1305} layers={PAGES} start={0.6} stagger={0.22} />
      </div>
    </div>
  );
}

/** 2 (Figma "overview"): same as the card cover. */
export function CivOverview({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <OverviewScene mobile={mobile} />
    </AnimTile>
  );
}

const PHONES: Layer[] = [
  { src: "ph1", box: [194, 116, 589, 1061] },
  { src: "ph2", box: [727, 116, 589, 1061] },
  { src: "ph3", box: [1260, 116, 589, 1061] },
];

/** 3 (Figma "circle", three phones): the phones come in from left to right. */
export function CivPhones({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <SlideIn w={1512} h={1292} layers={PHONES} mobile={mobile} />
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the tilted page columns drift up and down on scroll. */
export function CivBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background={BG} delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background={BG}
        angle={-11.5}
        pivot={[1556, 1292]}
        cuts={[-650.4, 126.6, 1509.4]}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/* centre line of the meander ribbon (legs 328 apart, bends of radius 164), left to right */
const LEGS = [-163, 165, 493, 821, 1149, 1477, 1805];
const TOP = 380.262;
const BOTTOM = 912.738;
const RIBBON = LEGS.slice(1).reduce(
  (d, x, i) => (i % 2 ? `${d}A164 164 0 0 1 ${x} ${TOP}V${BOTTOM}` : `${d}A164 164 0 0 0 ${x} ${BOTTOM}V${TOP}`),
  `M${LEGS[0]} ${TOP}V${BOTTOM}`
);

/** 5 (Figma "1/2 frame", the meander): the ribbon flows in from left to right once in view. */
export function CivWaves({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const id = `civ-ribbon-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill} data-play={inView ? "" : undefined} aria-hidden>
        <svg viewBox="0 0 1512 1292" className={styles.svg}>
          <defs>
            <mask id={id} maskUnits="userSpaceOnUse">
              <path className={styles.draw} d={RIBBON} pathLength={1} fill="none" stroke="#fff" strokeWidth={272} />
            </mask>
          </defs>
          <g mask={`url(#${id})`} fill="#E9F4FF">
            {MEANDER.map((d) => (
              <path key={d.slice(0, 24)} d={d} />
            ))}
          </g>
        </svg>
      </div>
    </AnimTile>
  );
}

/* ── the site's menu, opening and closing inside the window of the Figma "overview" frame (1512 × 1292) ──
   Window units: the 1239 × 788 window shows the 1920 px wide site, so one site pixel is S units. */
const WIN = { x: 136, y: 252, w: 1239, h: 788 };
const S = WIN.w / 1920;
const ITEMS = ["Onderwijs", "Werkveld", "Leren en werken in een hybride leeromgeving", "Trajecten", "Samenwerken", "Internationaal", "Over CIV Water", "Contact"];
const CONTACT = ["Oostergoweg 9", "8911 MA, Leeuwarden", "088 060 3800", "info@civwater.nl"];
/* the white "Menu" button in the header bar, where the live hamburger and label sit */
const BTN = { lines: [30.975, 36.137, 41.3], x1: 885.37, x2: 900.86, label: [909.4, 41.78] as const };
/* .o-navigation__shape: the meander strip under the menu (background-size: cover of a 1920 × 932 box, 239 px below the fold) */
const SHAPE_K = (932 / 388) * S;
const SHAPE_X = (WIN.w - 2736 * SHAPE_K) / 2;
const SHAPE_Y = WIN.h + 239 * S - 932 * S;

/** Extra: the site's menu (Figma "Mega menu open"): the Menu button turns into a cross, the panel drops down, the
    links rise in one by one and the contact block fades in; after a while it closes again. Loops while in view. */
export function CivMenu({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const visible = useInView(ref);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const clip = `civ-win-${useId().replace(/[^\w-]/g, "")}`;

  useEffect(() => {
    if (!inView || reduceMotion) {
      setOpen(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const cycle = (next: boolean) => {
      setOpen(next);
      timer = setTimeout(() => cycle(!next), next ? 5200 : 2600);
    };
    timer = setTimeout(() => cycle(true), 1200);
    return () => clearTimeout(timer);
  }, [inView, reduceMotion]);

  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <div ref={ref} className={`${styles.fill} ${styles.menu}`} data-run={visible ? "" : undefined} data-open={open ? "" : undefined} aria-hidden>
        <svg viewBox="0 0 1512 1292" className={styles.svg}>
          <defs>
            <clipPath id={clip}>
              <rect width={WIN.w} height={WIN.h} rx={20} />
            </clipPath>
            <clipPath id={`${clip}-photo`}>
              <rect x={1266 * S} y={184 * S} width={500 * S} height={283 * S} rx={20 * S} />
            </clipPath>
          </defs>
          <g transform={`translate(${WIN.x} ${WIN.y})`}>
            <g clipPath={`url(#${clip})`}>
              <image href={`${A}/${mobile ? "window-sm" : "window"}.webp`} width={WIN.w} height={WIN.h} />
              <Headline dx={-136} dy={-252} />

              <g className={styles.panel}>
                <rect width={WIN.w} height={WIN.h} fill="#F7FBFF" />
                <path d={MENU_SHAPE} fill="#F1F8FF" transform={`translate(${SHAPE_X} ${SHAPE_Y}) scale(${SHAPE_K})`} />
                {ITEMS.map((item, i) => (
                  <text key={item} className={styles.menuItem} x={80 * S} y={(184 + 44 + i * 101) * S} style={open ? { transitionDelay: `${0.95 + i * 0.07}s` } : undefined}>
                    {item}
                  </text>
                ))}
                <g className={styles.menuContact}>
                  <image href={`${A}/menu-photo.webp`} x={1266 * S} y={184 * S} width={500 * S} height={283 * S} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip}-photo)`} />
                  {CONTACT.map((line, i) => (
                    <text key={line} className={styles.menuText} x={1266 * S} y={(184 + 283 + 40 + 25 + i * 34) * S}>
                      {line}
                    </text>
                  ))}
                  <circle cx={(1266 + 22) * S} cy={(184 + 283 + 40 + 4 * 34 + 40 + 22) * S} r={22 * S} fill="#3790DA" />
                  <text className={styles.menuIn} x={(1266 + 22) * S} y={(184 + 283 + 40 + 4 * 34 + 40 + 29) * S}>
                    in
                  </text>
                </g>
              </g>

              {/* the header bar stays on top of the menu */}
              <image href={`${A}/${mobile ? "header-sm" : "header"}.webp`} width={WIN.w} height={WIN.h} />
              <g stroke="#3790DA" strokeWidth={1.29} strokeLinecap="round">
                {BTN.lines.map((y, i) => (
                  <line key={y} className={styles[`bar${i}` as "bar0" | "bar1" | "bar2"]} x1={BTN.x1} x2={BTN.x2} y1={y} y2={y} />
                ))}
              </g>
              <text className={`${styles.btnLabel} ${styles.labelMenu}`} x={BTN.label[0]} y={BTN.label[1]}>
                Menu
              </text>
              <text className={`${styles.btnLabel} ${styles.labelClose}`} x={BTN.label[0]} y={BTN.label[1]}>
                Sluiten
              </text>
            </g>
          </g>
        </svg>
      </div>
    </AnimTile>
  );
}
