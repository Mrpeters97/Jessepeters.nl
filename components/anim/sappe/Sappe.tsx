"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useViewPlay } from "@/hooks/useViewPlay";
import AnimTile from "../AnimTile";
import { chips, greeting, specimen, type TypeArt } from "../svg/sappeType";
import { Phone, screen, useStage, type Step } from "./SappePhone";
import styles from "./sappe.module.css";
import { markup } from "../markup";

/* The app's own softer blues (dashboard tiles, screen headers) carry the tiles; the bright
   brand blue stays inside the UI. */
const SOFT = "#7CBEE3";
const LIGHT = "#DFECF3";
const NAVY = "#00346E";
const OFF_WHITE = "#F8F8F8";

const element = (name: string) => `/projects/Sappe_App/elements/${name}.webp`;

/** One design pixel of the 1512×1292 half tile. */
const px = (n: number) => `calc(var(--p) * ${n})`;

type TileProps = { delay?: number; mobile?: boolean };

function PhoneTile({ steps, background, delay, mobile }: TileProps & { steps: Step[]; background: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { play, load } = useStage(ref);
  return (
    <AnimTile size="half" background={background} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={styles.fill}>
        <Phone steps={steps} width="32.5cqw" play={play} load={load} />
      </div>
    </AnimTile>
  );
}

const BUTTON: [number, number] = [195, 700];

const LOGIN: Step[] = [
  { src: screen("login-empty"), hold: 1200, tap: [195, 370], to: "swap" },
  { src: screen("login-filled"), hold: 1100, tap: [195, 476] },
  { src: screen("dashboard"), hold: 2200, tap: [130, 790], to: "swap" },
  { src: screen("modules"), hold: 2400 },
];

/* A learning: the first answer is wrong, the retry is right and the bar moves on. */
const LEARNING: Step[] = [
  { src: screen("modules"), tap: [195, 331] },
  { src: screen("detail-learnings"), hold: 1900, tap: BUTTON },
  { src: screen("start-video"), hold: 1900, tap: BUTTON, progress: 40 },
  { src: screen("q1-empty"), hold: 1500, tap: [102, 342], to: "swap", progress: 40 },
  { src: screen("q1-selected"), hold: 900, tap: BUTTON, to: "swap", progress: 40 },
  { src: screen("q1-wrong"), hold: 2000, tap: BUTTON, to: "swap", progress: 40 },
  { src: screen("q1-empty"), hold: 900, tap: [287, 506], to: "swap", progress: 40 },
  { src: screen("q1-right"), hold: 2000, tap: BUTTON, progress: 55 },
  { src: screen("done-start"), hold: 2600, progress: 55 },
];

/* The other question types; the order question goes wrong first, every right answer fills the bar. */
const QUESTIONS: Step[] = [
  { src: screen("order"), hold: 1500, tap: BUTTON, to: "swap", progress: 55 },
  { src: screen("order-wrong"), hold: 2000, tap: BUTTON, to: "swap", progress: 55 },
  { src: screen("order"), hold: 700, drag: [34, 490, 34, 440], to: "swap", progress: 55 },
  { src: screen("order-right"), hold: 2000, tap: [195, 697], progress: 65 },
  { src: screen("risk-empty"), hold: 1300, drag: [115, 615, 70, 352], to: "swap", progress: 65 },
  { src: screen("risk"), hold: 900, tap: BUTTON, to: "swap", progress: 65 },
  { src: screen("risk-right"), hold: 2000, tap: BUTTON, progress: 75 },
  { src: screen("choice"), hold: 1300, tap: [195, 362], to: "swap", progress: 75 },
  { src: screen("choice-picked"), hold: 2000, tap: BUTTON, progress: 85 },
  { src: screen("vaktaal"), hold: 1400, tap: BUTTON, progress: 85 },
  { src: screen("checklist"), hold: 2200, tap: BUTTON, progress: 90 },
  { src: screen("done-module"), hold: 2800, progress: 100 },
];

const KNOWLEDGE: Step[] = [
  { src: screen("dashboard"), hold: 1600, tap: [103, 538] },
  { src: screen("kennisbank"), hold: 1600, tap: [286, 262] },
  { src: screen("werkinstructies"), hold: 1500, tap: [195, 215] },
  { src: screen("artikel"), hold: 2000, tap: [30, 86], to: "pop" },
  { src: screen("werkinstructies"), hold: 700, tap: [30, 86], to: "pop" },
  { src: screen("kennisbank"), hold: 1100, tap: [103, 404] },
  { src: screen("contacten"), hold: 2600 },
];

/** Logging in and landing on the dashboard. */
export function SappeLogin(props: TileProps) {
  return <PhoneTile {...props} steps={LOGIN} background={SOFT} />;
}

/** A learning from the module overview: video, a question answered wrong, then right. */
export function SappeLearning(props: TileProps) {
  return <PhoneTile {...props} steps={LEARNING} background={OFF_WHITE} />;
}

/** The other question types: ordering, spotting risks, multiple choice, trade terms and the checklist. */
export function SappeQuestions(props: TileProps) {
  return <PhoneTile {...props} steps={QUESTIONS} background={NAVY} />;
}

/** The knowledge base: work instructions, an article, back, and the key contacts. */
export function SappeKnowledge(props: TileProps) {
  return <PhoneTile {...props} steps={KNOWLEDGE} background={LIGHT} />;
}

/* ── User flow: the wireframes as a flow chart, read left to right in two rows ── */

/** Full tile in cqw (100 × 83.03): 5 columns of 12.4-wide screens (26.83 tall), rows at 7 and 49. */
const FLOW_X = [5, 24.4, 43.8, 63.2, 82.6];
const FLOW_TOP = [7, 49];
const FLOW_SCREENS: [string, number, number][] = [
  ["login-filled", 0, 0],
  ["dashboard", 1, 0],
  ["modules", 2, 0],
  ["detail-learnings", 3, 0],
  ["start-video", 4, 0],
  ["q1-empty", 0, 1],
  ["q1-selected", 1, 1],
  ["q1-wrong", 2, 1],
  ["done-start", 3, 1],
  ["next-video", 4, 1],
];
/* Row 1 runs to the video, wraps back to the first question; a wrong answer loops back to choosing again, a right one goes on.
   Connectors are thin lines with a dot at each end (`a` → `b`), stopping 0.9 short of the screens; reading order gives the direction. */
const FLOW_LINKS: { d: string; a: [number, number]; b: [number, number]; tone: "base" | "right" | "wrong"; dashed?: boolean }[] = [
  { d: "M18.3 20.4H23.5", a: [18.3, 20.4], b: [23.5, 20.4], tone: "base" },
  { d: "M37.7 20.4H42.9", a: [37.7, 20.4], b: [42.9, 20.4], tone: "base" },
  { d: "M57.1 20.4H62.3", a: [57.1, 20.4], b: [62.3, 20.4], tone: "base" },
  { d: "M76.5 20.4H81.7", a: [76.5, 20.4], b: [81.7, 20.4], tone: "base" },
  { d: "M88.8 34.73V39.4Q88.8 40.6 87.6 40.6H12.4Q11.2 40.6 11.2 41.8V48.1", a: [88.8, 34.73], b: [11.2, 48.1], tone: "base" },
  { d: "M18.3 62.4H23.5", a: [18.3, 62.4], b: [23.5, 62.4], tone: "base" },
  { d: "M37.7 62.4H42.9", a: [37.7, 62.4], b: [42.9, 62.4], tone: "wrong" },
  { d: "M50 76.73V78.4Q50 79.6 48.8 79.6H31.8Q30.6 79.6 30.6 78.4V76.73", a: [50, 76.73], b: [30.6, 76.73], tone: "wrong", dashed: true },
  { d: "M30.6 48.1V45.4Q30.6 44.2 31.8 44.2H68.2Q69.4 44.2 69.4 45.4V48.1", a: [30.6, 48.1], b: [69.4, 48.1], tone: "right" },
  { d: "M76.5 62.4H81.7", a: [76.5, 62.4], b: [81.7, 62.4], tone: "base" },
];
/* "Correct" and "Try again" sit in their line (the label's tile-coloured backing cuts it); "Wrong" sits just above its short line. */
const FLOW_LABELS: { text: string; tone: "right" | "wrong"; x: number; y: number; i: number; onLine?: boolean }[] = [
  { text: "Wrong", tone: "wrong", x: 40.3, y: 60.7, i: 10.4 },
  { text: "Try again", tone: "wrong", x: 40.3, y: 79.6, i: 10.9, onLine: true },
  { text: "Correct", tone: "right", x: 50, y: 44.2, i: 11.4, onLine: true },
];

/** The route through the app as wireframes: screens rise row by row, then the connectors draw and the branches are named. */
export function SappeFlow({ delay, mobile }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const load = useInView(ref, { once: true, margin: "40% 0px" });
  return (
    <AnimTile size="full" background={LIGHT} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.fill} ${styles.board}`} {...useReveal(ref)}>
        {FLOW_SCREENS.map(([name, col, row]) => (
          <div
            key={name}
            data-rise
            className={styles.flowScreen}
            style={{ left: `${FLOW_X[col]}cqw`, top: `${FLOW_TOP[row]}cqw`, "--d": row * 3 } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized wireframes */}
            {load && <img src={screen(`ux-${name}`)} alt="" decoding="async" />}
          </div>
        ))}
        <svg className={styles.flowArrows} viewBox="0 0 100 83.03">
          {FLOW_LINKS.map(({ d, a, b, tone, dashed }, k) => (
            <g key={k} className={styles[`link_${tone}`]} style={{ "--d": 6 + k * 0.45 } as CSSProperties}>
              <path d={d} pathLength={1} data-draw={dashed ? undefined : ""} data-fade={dashed ? "" : undefined} className={dashed ? styles.dashed : undefined} />
              <circle cx={a[0]} cy={a[1]} r={0.32} data-fade="" />
              <circle cx={b[0]} cy={b[1]} r={0.32} data-fade="" />
            </g>
          ))}
        </svg>
        {FLOW_LABELS.map(({ text, tone, x, y, i, onLine }) => (
          <span key={text} data-rise className={`${styles.flowLabel} ${styles[`label_${tone}`]} ${onLine ? styles.onLine : ""}`} style={{ left: `${x}cqw`, top: `${y}cqw`, "--d": i } as CSSProperties}>
            {text}
          </span>
        ))}
      </div>
    </AnimTile>
  );
}

const UX = ["login-filled", "dashboard", "detail-learnings", "q1-selected"];

/** Wireframes first; the designed screens slide down over them with a soft edge, hold, and give way again. */
export function SappeUx({ delay, mobile }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { play, load } = useStage(ref);
  const [ui, setUi] = useState(false);

  useEffect(() => {
    if (!play) return;
    let on = false;
    const tick = () => {
      on = !on;
      setUi(on);
      t = setTimeout(tick, on ? 5800 : 3600);
    };
    let t = setTimeout(tick, 1200);
    return () => {
      clearTimeout(t);
      setUi(false);
    };
  }, [play]);

  return (
    <AnimTile size="full" background={SOFT} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.fill} ${styles.uxRow}`} data-ui={ui ? "" : undefined}>
        {UX.map((name, k) => (
          <div key={name} className={styles.uxScreen} style={{ "--k": k, "--y": `${k % 2 ? 2.4 : -2.4}cqw` } as CSSProperties}>
            {load && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized screens */}
                <img src={screen(`ux-${name}`)} alt="" decoding="async" />
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized screens */}
                <img src={screen(name)} alt="" decoding="async" className={styles.uxUi} />
              </>
            )}
          </div>
        ))}
      </div>
    </AnimTile>
  );
}

const BOARD_SCREENS = [
  "login-filled", "dashboard", "modules", "detail-learnings", "start-video", "q1-selected",
  "q1-wrong", "q1-right", "done-start", "order", "order-right", "risk",
  "risk-right", "choice", "choice-picked", "vaktaal", "checklist", "done-module",
  "kennisbank", "werkinstructies", "artikel", "contacten", "bewijskaarten", "order-wrong",
];
const BOARD_WIRES = [
  "login-filled", "dashboard", "modules", "detail-learnings", "start-video",
  "q1-empty", "q1-selected", "q1-wrong", "done-start", "next-video",
];
const BOARD_OFFSETS = [8, -10, 4, -14, 10, -6, 12];
/* 7 columns of 5 screens: enough that the tilted collage covers every corner, drift included.
   Every third slot is a wireframe, staggered so no two touch. */
const BOARD = BOARD_OFFSETS.map((_, c) =>
  Array.from({ length: 5 }, (_, r) =>
    (c * 2 + r) % 3 === 0 ? `ux-${BOARD_WIRES[(c * 3 + r) % BOARD_WIRES.length]}` : BOARD_SCREENS[(c * 11 + r) % BOARD_SCREENS.length]
  )
);

/** Every screen of the app, with its wireframes, on a tilted board; columns drift up and down (alternating) on scroll. */
export function SappeBoard({ delay, mobile }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const load = useInView(ref, { once: true, margin: "50% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [7, -7]);
  const down = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-7, 7]);

  return (
    <AnimTile size="full" background={SOFT} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={styles.fill}>
        <div className={styles.collage}>
          {BOARD.map((col, k) => (
            <BoardColumn key={k} names={col} offset={BOARD_OFFSETS[k]} drift={k % 2 ? down : up} load={load} />
          ))}
        </div>
      </div>
    </AnimTile>
  );
}

function BoardColumn({ names, offset, drift, load }: { names: string[]; offset: number; drift: MotionValue<number>; load: boolean }) {
  const y = useTransform(drift, (v) => `${offset + v}cqw`);
  return (
    <motion.div className={styles.column} style={{ y }}>
      {names.map((name, k) =>
        load ? (
          // eslint-disable-next-line @next/next/no-img-element -- pre-sized screens
          <img key={k} src={screen(name)} alt="" decoding="async" loading="lazy" />
        ) : (
          <div key={k} className={styles.columnSlot} />
        )
      )}
    </motion.div>
  );
}

/** Plays the build-up once the tile is well in view (see useViewPlay). */
function useReveal(ref: RefObject<HTMLDivElement | null>) {
  const { play } = useViewPlay(ref);
  return { "data-play": play ? "" : undefined };
}

/** A piece of a board, placed in design pixels; `i` is its place in the build-up. */
function Rise({ x, y, i, className, style, children }: { x: number; y: number; i: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div data-rise className={`${styles.at} ${className ?? ""}`} style={{ left: px(x), top: px(y), "--d": i, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

function Rule({ y, i }: { y: number; i: number }) {
  return <div data-grow className={`${styles.at} ${styles.rule}`} style={{ left: px(120), top: px(y), width: px(1272), "--d": i } as CSSProperties} />;
}

function Type({ art, height }: { art: TypeArt; height: number }) {
  const [, , w, h] = art.box;
  return (
    <svg viewBox={art.box.join(" ")} className={styles.type} style={{ height: px(height), width: px((height * w) / h) }}>
      {art.paths.map((p, k) => (
        <path key={k} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

/** A UI piece from the Figma components (exported at 2x), at `scale` × its Figma size. */
function Piece({ name, w, scale, className }: { name: string; w: number; scale: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small pre-sized UI exports
    <img src={element(name)} alt="" decoding="async" loading="lazy" className={`${styles.piece} ${className ?? ""}`} style={{ width: px(w * scale) }} />
  );
}

const SWATCHES = [
  { name: "Sappé Blue", hex: "#0186CB" },
  { name: "Dark Blue", hex: "#00346E" },
  { name: "Sappé Green", hex: "#00C75B" },
  { name: "Black", hex: "#191919" },
  { name: "Background", hex: "#F8F8F8" },
];

/** Design board: type, colours, buttons and the progress labels build up in turn. */
export function SappeDesign({ delay, mobile }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={OFF_WHITE} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.fill} ${styles.board}`} {...useReveal(ref)}>
        <Rise x={120} y={112} i={0} style={{ color: "#191919" }}>
          <Type art={specimen} height={236} />
        </Rise>
        <Rise x={120} y={392} i={2} className={styles.fontName}>
          ARS Maquette Pro
        </Rise>
        <Rise x={1392} y={392} i={2} className={`${styles.fontName} ${styles.muted} ${styles.alignRight}`}>
          Light · Regular · Medium · Bold
        </Rise>

        <Rule y={466} i={3} />

        <Rise x={120} y={512} i={4}>
          <Type art={greeting} height={62} />
        </Rise>

        <Rule y={634} i={5} />

        {SWATCHES.map(({ name, hex }, k) => (
          <Rise key={name} x={120 + k * 263} y={682} i={6 + k * 0.5} className={styles.swatch}>
            <span className={styles.chip} style={{ background: hex }} />
            <span className={styles.swatchLabel}>
              <b>{name}</b>
              <span>{hex}</span>
            </span>
          </Rise>
        ))}

        <Rule y={940} i={8} />

        <Rise x={120} y={988} i={9} className={styles.row}>
          <Piece name="btn-primary" w={350} scale={1.2} />
          <Piece name="btn-ghost" w={350} scale={1.2} />
        </Rise>
        <Rise x={120} y={1098} i={10} className={styles.row} style={{ gap: px(18) }}>
          {chips.map(({ label, box, svg }) => (
            <svg
              key={label}
              viewBox={box.join(" ")}
              fill="none"
              className={styles.type}
              style={{ height: px(box[3] * 1.9), width: px(box[2] * 1.9) }}
              dangerouslySetInnerHTML={markup(svg)}
            />
          ))}
        </Rise>
      </div>
    </AnimTile>
  );
}

/** Components board: the app's own cards — modules, checklist, contact and trade-term cards. */
export function SappeComponents({ delay, mobile }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const s = 1.7;
  return (
    <AnimTile size="half" background={OFF_WHITE} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.fill} ${styles.board}`} {...useReveal(ref)}>
        <Rise x={120} y={186} i={0}>
          <Piece name="card-current" w={350} scale={s} className={styles.card} />
        </Rise>
        <Rise x={120} y={571} i={1.5}>
          <Piece name="card-done" w={350} scale={s} className={styles.card} />
        </Rise>
        <Rise x={120} y={936} i={3}>
          <Piece name="card-vaktaal" w={350} scale={s} className={styles.card} />
        </Rise>
        <Rise x={797} y={186} i={0.75}>
          <Piece name="checklist-checked" w={350} scale={s} className={styles.card} />
        </Rise>
        <Rise x={797} y={940} i={2.25}>
          <Piece name="card-contact" w={350} scale={s} className={styles.card} />
        </Rise>
      </div>
    </AnimTile>
  );
}
