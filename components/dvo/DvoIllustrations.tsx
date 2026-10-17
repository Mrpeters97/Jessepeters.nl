"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import localFont from "next/font/local";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./DvoIllustrations.module.css";

/* Barlow is DVO's typeface (SIL OFL). Only loaded where this embed renders. */
const barlow = localFont({
  src: [
    { path: "./fonts/barlow-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/barlow-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/barlow-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/barlow-700-italic.woff2", weight: "700", style: "italic" },
    { path: "./fonts/barlow-800-italic.woff2", weight: "800", style: "italic" },
  ],
  variable: "--font-barlow",
  preload: false,
});

/* Build-up timing from the DVO site (visualIn): per step 250ms later, within a
   step 60ms apart; parts fade/grow in 900ms, lines draw in 1400ms. */
const STEP = 250;
const STAGGER = 60;
const DURATION = 900;
const DRAW = 1400;
const CARD_STAGGER = 120;
const EASE_REVEAL = "cubic-bezier(0.25, 1, 0.5, 1)";
const EASE_GLIDE = "cubic-bezier(0.65, 0, 0.25, 1)";
const EASE_BACK = "cubic-bezier(0.34, 1.8, 0.64, 1)";

function buildUp(card: Element, offset: number): Animation[] {
  const counts = new Map<number, number>();
  const out: Animation[] = [];
  card.querySelectorAll<HTMLElement | SVGElement>("[data-anim]").forEach((el) => {
    const step = Number(el.dataset.animStep ?? 0);
    const n = counts.get(step) ?? 0;
    counts.set(step, n + 1);
    const delay = offset + step * STEP + n * STAGGER;
    const timing = (duration: number, easing: string): KeyframeAnimationOptions => ({ duration, delay, easing, fill: "backwards" });
    const visible = timing(DURATION, EASE_REVEAL);
    switch (el.dataset.anim) {
      case "grow-y":
        el.style.transformOrigin = "50% 100%";
        out.push(el.animate([{ opacity: 0, transform: "scaleY(0)" }, { opacity: 1, transform: "scaleY(1)" }], visible));
        break;
      case "grow-x":
        el.style.transformOrigin = "0% 50%";
        out.push(el.animate([{ opacity: 0, transform: "scaleX(0)" }, { opacity: 1, transform: "scaleX(1)" }], visible));
        break;
      case "pop":
        el.style.transformOrigin = "50% 50%";
        out.push(el.animate([{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "scale(1)" }], timing(DURATION, EASE_BACK)));
        break;
      case "rise":
        out.push(el.animate([{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "none" }], timing(DRAW, EASE_REVEAL)));
        break;
      case "wipe": {
        out.push(el.animate([{ opacity: 0 }, { opacity: 1 }], timing(1, "linear")));
        const rect = el.querySelector<SVGElement>("[data-wipe-rect]");
        if (rect) {
          const [x, y] = (rect.dataset.wipeOrigin ?? "0 0").split(" ");
          rect.style.transformOrigin = `${x}px ${y}px`;
          out.push(rect.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { ...timing(DRAW, EASE_GLIDE), fill: "both" }));
        }
        break;
      }
      case "needle": {
        const [x, y] = (el.dataset.animOrigin ?? "0 0").split(" ");
        el.style.transformOrigin = `${x}px ${y}px`;
        out.push(el.animate([{ opacity: 0, transform: `rotate(${el.dataset.animFrom ?? 0}deg)` }, { opacity: 1, transform: "rotate(0deg)" }], timing(DRAW, EASE_GLIDE)));
        break;
      }
      case "chip":
        out.push(el.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], visible));
        break;
      default:
        out.push(el.animate([{ opacity: 0 }, { opacity: 1 }], visible));
    }
  });
  return out;
}

/**
 * The seven DVO illustrations (test visuals, training week, interval feedback,
 * a test report, the report dashboard) as live vector code instead of a video: sharp at any size,
 * a few KB. Each time the tile scrolls into view the cards build up from
 * nothing, in a cascade; leaving the viewport resets them for the next entry.
 * On mobile the cards are stacked into one tall column, so each card builds up
 * on its own once it is half on screen, once per visit (rebuilding on every
 * scroll back read as the cards loading in over and over).
 */
export default function DvoIllustrations({ background, delay = 0, mobile = false }: { background: string; delay?: number; mobile?: boolean }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion || !mobile) return;
    const running = new Map<Element, Animation[]>();
    const cards = [...root.querySelectorAll("[data-card]")];
    cards.forEach((card) => card.setAttribute("data-idle", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, intersectionRatio } of entries) {
          if (intersectionRatio < 0.5) continue;
          observer.unobserve(target);
          target.removeAttribute("data-idle");
          running.set(target, buildUp(target, 0));
        }
      },
      { threshold: 0.5 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      running.forEach((anims) => anims.forEach((a) => a.cancel()));
      cards.forEach((card) => card.removeAttribute("data-idle"));
    };
  }, [reduceMotion, mobile]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion || mobile) return;
    setIdle(true);
    let running: Animation[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.3 && running.length === 0) {
          setIdle(false);
          running = [...root.querySelectorAll("[data-card]")].flatMap((card, i) => buildUp(card, i * CARD_STAGGER));
        } else if (!entry.isIntersecting && running.length > 0) {
          running.forEach((a) => a.cancel());
          running = [];
          setIdle(true);
        }
      },
      { threshold: [0, 0.3] }
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      running.forEach((a) => a.cancel());
    };
  }, [reduceMotion, mobile]);

  return (
    <motion.div
      ref={rootRef}
      aria-hidden
      className={`${styles.tile} ${barlow.variable} ${mobile ? styles.stacked : ""} ${idle ? styles.idle : ""}`}
      style={{ backgroundColor: background }}
      initial={{ opacity: 0, y: mobile ? 28 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: mobile ? "-12%" : "-18%" }}
      transition={{ duration: mobile ? 1 : 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.grid}>
        <div className={styles.row}>
          <TestCard visual={<Inspanning />} icon={<HeartPulse />} tone={styles.accent} label="Drempel" value="168–176 bpm" />
          <TestCard visual={<Sodium />} icon={<Droplet />} tone={styles.highlight} label="Natrium" value="950 mg/L" />
          <TestCard visual={<Aero />} icon={<Wind />} tone={styles.royal} label="Luchtweerstand" value="−7%" />
        </div>
        <div className={styles.row}>
          <div data-card className={`${styles.card} ${styles.half} ${styles.schematicCard}`}>
            <svg viewBox="0 0 440 275" preserveAspectRatio="xMidYMid meet" className={styles.svg}>
              <Week />
            </svg>
            <span data-anim="chip" data-anim-step={4} className={styles.legend}>
              <span><i className={styles.dot} style={{ background: "var(--light-blue)" }} />Zwemmen</span>
              <span><i className={styles.dot} style={{ background: "var(--royal)" }} />Fietsen</span>
              <span><i className={styles.dot} style={{ background: "var(--yellow)" }} />Lopen</span>
            </span>
            <Chip icon={<Calendar />} tone={styles.highlight} label="Deze week" value="8u 30m" />
          </div>
          <div data-card className={`${styles.card} ${styles.half} ${styles.schematicCard}`}>
            <svg viewBox="0 0 440 275" preserveAspectRatio="xMidYMid meet" className={styles.svg}>
              <Feedback />
            </svg>
            <span data-anim="chip" data-anim-step={4} className={styles.message}>
              <span className={styles.avatar}>D</span>
              <span>
                <b>David</b>
                Sterk gedaan! Mooi constant vermogen. Volgende week bouwen we verder op.
              </span>
            </span>
            <Chip icon={<MessageCircle />} tone={styles.accent} label="Intervaltraining" value="4 × 8 min" />
          </div>
        </div>
        <div className={styles.row}>
          <Report
            stats={[["VO2max", "58 ml/kg/min"], ["Drempelhartslag", "172 bpm"], ["Drempelvermogen", "285 W"]]}
            zonesLabel="Jouw trainingszones"
            zones={["Z1", "Z2", "Z3", "Z4", "Z5"]}
            scale={["Rustig", "Drempel", "Max"]}
          />
          <div data-card className={`${styles.card} ${styles.half} ${styles.dashboardCard}`}>
            <svg viewBox="0 0 440 275" preserveAspectRatio="xMidYMid meet" className={styles.svg}>
              <Dashboard />
            </svg>
            <Chip icon={<Droplet />} tone={styles.highlight} label="Advies" value="800 mg/u" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TestCard({ visual, icon, tone, label, value }: { visual: ReactNode; icon: ReactNode; tone: string; label: string; value: string }) {
  return (
    <div data-card className={`${styles.card} ${styles.third} ${styles.testCard}`}>
      <svg viewBox="0 0 440 200" preserveAspectRatio="xMidYMid meet" className={styles.svg}>
        {visual}
      </svg>
      <Chip icon={icon} tone={tone} label={label} value={value} step={6} />
    </div>
  );
}

function Chip({ icon, tone, label, value, step = 6 }: { icon: ReactNode; tone: string; label: string; value: string; step?: number }) {
  return (
    <span data-anim="chip" data-anim-step={step} className={styles.chip}>
      <span className={`${styles.iconSquare} ${tone}`}>{icon}</span>
      {label}
      <b>{value}</b>
    </span>
  );
}

const ZONE_STYLES = [
  { span: 3, fill: "var(--blue-subtle)", color: "var(--navy)" },
  { span: 3, fill: "var(--light-blue)", color: "var(--navy)" },
  { span: 2, fill: "var(--blue-selected)", color: "var(--navy)" },
  { span: 2, fill: "var(--yellow)", color: "#000" },
  { span: 2, fill: "var(--navy)", color: "#f0f0f0" },
];

function Report({
  stats,
  zonesLabel,
  zones,
  scale,
  marked,
}: {
  stats: [string, string][];
  zonesLabel: string;
  zones: string[];
  scale: [string, string, string];
  marked?: number;
}) {
  const isMarked = marked !== undefined;
  const style = (i: number) =>
    isMarked
      ? { span: 1, fill: i === marked ? "var(--navy)" : "var(--light-blue)", color: i === marked ? "#f0f0f0" : "var(--navy)" }
      : ZONE_STYLES[i];
  return (
    <div data-card className={`${styles.card} ${styles.half} ${styles.reportCard}`}>
      <div data-anim="fade" className={styles.reportHead}>
        <span className={styles.reportTitle}>Testrapport</span>
        <span className={styles.small}>Voorbeeld</span>
      </div>
      <div className={styles.stats}>
        {stats.map(([label, value]) => (
          <div key={label} data-anim="chip" data-anim-step={1} className={styles.stat}>
            <span className={styles.small}>{label}</span>
            <span className={styles.statValue}>{value}</span>
          </div>
        ))}
      </div>
      <div className={styles.zonesBlock}>
        <span data-anim="fade" data-anim-step={2} className={styles.small}>{zonesLabel}</span>
        <div className={styles.zones} style={{ gridTemplateColumns: `repeat(${isMarked ? 5 : 12}, 1fr)` }}>
          {zones.map((zone, i) => (
            <span
              key={zone}
              className={styles.zone}
              style={{ gridColumn: `span ${style(i).span}`, justifyContent: isMarked ? "center" : undefined }}
            >
              <span data-anim="grow-x" data-anim-step={2 + i * 2} className={styles.zoneFill} style={{ background: style(i).fill }} />
              <span
                data-anim="fade"
                data-anim-step={3 + i * 2}
                className={styles.zoneLabel}
                style={{ color: style(i).color, ...(isMarked ? ({ fontSize: "calc(var(--p) * 17)", fontWeight: 700 } as CSSProperties) : {}) }}
              >
                {zone}
              </span>
            </span>
          ))}
        </div>
        <div data-anim="fade" data-anim-step={2 + zones.length * 2} className={`${styles.scale} ${styles.small}`}>
          {scale.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- SVG drawings (from the DVO site) ---------- */

const INK_08 = "rgba(26, 27, 31, 0.08)";
const INK_20 = "rgba(26, 27, 31, 0.2)";
const INK_25 = "rgba(26, 27, 31, 0.25)";

function Wipe({ x = 0, y = 0, width, height, step = 0, children }: { x?: number; y?: number; width: number; height: number; step?: number; children: ReactNode }) {
  const id = useId();
  return (
    <g data-anim="wipe" data-anim-step={step} clipPath={`url(#${id})`}>
      <defs>
        <clipPath id={id}>
          <rect data-wipe-rect="" data-wipe-origin={`${x} ${y + height / 2}`} x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      {children}
    </g>
  );
}

function Grid({ ys, h }: { ys: number[]; h: number }) {
  const xs = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400];
  return (
    <g data-anim="fade" data-anim-step={0} stroke={INK_08} strokeWidth={1}>
      {xs.map((x) => <line key={`x${x}`} x1={x} x2={x} y1={0} y2={h} />)}
      {ys.map((y) => <line key={`y${y}`} x1={0} x2={440} y1={y} y2={y} />)}
    </g>
  );
}

function Inspanning() {
  const thresholds = [{ x: 220.8, y: 156.5 }, { x: 340.1, y: 96.8 }];
  return (
    <>
      <Grid ys={[40, 80, 120, 160]} h={200} />
      <Wipe width={440} height={200} step={1}>
        <path d="M30 165 C150 140 280 95 410 55" fill="none" strokeWidth={2.5} strokeLinecap="round" stroke="rgba(45, 73, 200, 0.4)" />
      </Wipe>
      {thresholds.map(({ x, y }) => (
        <line key={x} data-anim="grow-y" data-anim-step={4} x1={x} x2={x} y1={y} y2={200} strokeWidth={1.5} strokeDasharray="4 5" stroke={INK_25} />
      ))}
      <Wipe width={440} height={200} step={1}>
        <path d="M30 170 C160 168 250 160 300 130 S380 40 410 20" fill="none" strokeWidth={4} strokeLinecap="round" stroke="var(--yellow)" />
      </Wipe>
      {thresholds.map(({ x, y }) => (
        <circle key={x} data-anim="pop" data-anim-step={5} cx={x} cy={y} r={7} strokeWidth={3.5} fill="var(--surface)" stroke="var(--yellow)" />
      ))}
    </>
  );
}

function Sodium() {
  const clipId = useId();
  const drop = "M200 18 C200 18 150 88 150 122 A50 50 0 0 0 250 122 C250 88 200 18 200 18 Z";
  const specks = [{ x: 80, y: 50, r: 5 }, { x: 108, y: 128, r: 3.5 }, { x: 60, y: 150, r: 2.5 }, { x: 380, y: 40, r: 3 }, { x: 400, y: 150, r: 5 }];
  const ticks = [30, 45, 60, 75, 90, 105, 120, 135, 150, 165];
  return (
    <>
      <defs>
        <clipPath id={clipId}><path d={drop} /></clipPath>
      </defs>
      <g fill="var(--light-blue)">
        {specks.map(({ x, y, r }) => <circle key={`${x}-${y}`} data-anim="pop" data-anim-step={2} cx={x} cy={y} r={r} />)}
      </g>
      <g clipPath={`url(#${clipId})`}>
        <path data-anim="rise" data-anim-step={1} d="M140 112 Q165 102 190 112 T240 112 T290 112 V180 H140 Z" fill="rgba(185, 221, 243, 0.6)" />
      </g>
      <path data-anim="pop" data-anim-step={0} d={drop} fill="none" strokeWidth={4} strokeLinejoin="round" stroke="var(--royal)" />
      <text data-anim="fade" data-anim-step={3} x={200} y={148} textAnchor="middle" fill="var(--navy)" style={{ fontSize: 35.6, fontWeight: 800, fontStyle: "italic", letterSpacing: -1 }}>
        Na⁺
      </text>
      <g data-anim="fade" data-anim-step={2} stroke={INK_20} strokeWidth={2}>
        {ticks.map((y, i) => <line key={y} x1={i % 3 === 0 ? 290 : 298} x2={310} y1={y} y2={y} />)}
      </g>
      <line data-anim="grow-x" data-anim-step={3} x1={284} x2={316} y1={112} y2={112} strokeWidth={3.5} stroke="var(--yellow)" />
    </>
  );
}

function Aero() {
  const streamline = (y: number, d: number) => `M0 ${y} C120 ${y} 150 ${y + d} 215 ${y + d} S310 ${y} 440 ${y}`;
  const lines = [{ y: 22, d: -8 }, { y: 44, d: -12 }, { y: 134, d: 18 }, { y: 156, d: 12 }, { y: 178, d: 8 }];
  return (
    <>
      <Wipe width={440} height={200} step={1}>
        <g fill="none" strokeWidth={2.5} strokeLinecap="round" stroke="var(--light-blue)">
          {lines.map(({ y, d }) => <path key={y} d={streamline(y, d)} />)}
        </g>
      </Wipe>
      <Wipe width={440} height={200} step={2}>
        <path d={streamline(66, -18)} fill="none" strokeWidth={4} strokeLinecap="round" stroke="var(--yellow)" />
      </Wipe>
      <path
        data-anim="pop"
        data-anim-step={0}
        d="M150 100 C150 80 168 70 192 70 C232 70 270 88 300 100 C270 112 232 130 192 130 C168 130 150 120 150 100 Z"
        strokeWidth={3}
        fill="var(--blue-subtle)"
        stroke="var(--royal)"
      />
    </>
  );
}

const SPORT = { swim: "var(--light-blue)", bike: "var(--royal)", run: "var(--yellow)" } as const;

function Week() {
  const days = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const plan: { sport: keyof typeof SPORT; h: number }[][] = [
    [{ sport: "swim", h: 44 }],
    [{ sport: "bike", h: 66 }, { sport: "run", h: 22 }],
    [{ sport: "run", h: 50 }],
    [],
    [{ sport: "swim", h: 36 }, { sport: "bike", h: 40 }],
    [{ sport: "bike", h: 112 }],
    [{ sport: "run", h: 76 }],
  ];
  const width = 50;
  const x = (i: number) => 20 + i * 58;
  return (
    <>
      {days.map((day, i) => (
        <text key={day} data-anim="fade" data-anim-step={0} x={x(i) + width / 2} y={26} textAnchor="middle" fill="rgba(26, 27, 31, 0.5)" style={{ fontSize: 15.4, fontWeight: 700 }}>
          {day}
        </text>
      ))}
      {plan.map((blocks, i) => {
        let y = 50;
        return (
          <g key={i}>
            <rect data-anim="fade" data-anim-step={0} x={x(i)} y={40} width={width} height={170} rx={8} fill="var(--surface)" />
            {blocks.length === 0 && (
              <line data-anim="fade" data-anim-step={3} x1={x(i) + 12} x2={x(i) + width - 12} y1={125} y2={125} strokeWidth={2} strokeDasharray="4 5" stroke={INK_20} />
            )}
            {blocks.map((block) => {
              const top = y;
              y += block.h + 6;
              return <rect key={`${block.sport}-${top}`} data-anim="grow-y" data-anim-step={1} x={x(i) + 6} y={top} width={width - 12} height={block.h} rx={5} fill={SPORT[block.sport]} />;
            })}
          </g>
        );
      })}
    </>
  );
}

function Feedback() {
  const base = 240;
  const blocks = [
    { w: 50, h: 50, fill: "var(--light-blue)" },
    { w: 40, h: 120, fill: "var(--yellow)" },
    { w: 20, h: 45, fill: "var(--light-blue)" },
    { w: 40, h: 120, fill: "var(--yellow)" },
    { w: 20, h: 45, fill: "var(--light-blue)" },
    { w: 40, h: 120, fill: "var(--yellow)" },
    { w: 20, h: 45, fill: "var(--light-blue)" },
    { w: 40, h: 120, fill: "var(--yellow)" },
    { w: 60, h: 40, fill: "var(--light-blue)" },
  ];
  let x = 20;
  return (
    <g transform="translate(0 -25)">
      <Grid ys={[55, 110, 165, 220]} h={275} />
      {blocks.map((block, i) => {
        const left = x;
        x += block.w + 4;
        return <rect key={i} data-anim="grow-y" data-anim-step={1} x={left} y={base - block.h} width={block.w} height={block.h} rx={4} fill={block.fill} />;
      })}
      <Wipe width={440} height={300} step={2}>
        <path
          d="M20 205 C60 200 70 170 90 150 S120 135 130 150 S150 170 160 150 S190 128 200 145 S225 165 235 145 S265 125 275 140 S300 160 310 140 S340 120 355 150 S400 190 420 195"
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          stroke="var(--royal)"
        />
      </Wipe>
      <line data-anim="fade" data-anim-step={0} x1={10} x2={430} y1={base} y2={base} strokeWidth={2} stroke={INK_20} />
    </g>
  );
}

function Dashboard() {
  // half circle around (140, 170), radius 70; the marker at ~70% from low to high
  const point = (t: number) => {
    const angle = Math.PI * (1 - t);
    return `${140 + 70 * Math.cos(angle)} ${170 - 70 * Math.sin(angle)}`;
  };
  const arc = (from: number, to: number) => `M${point(from)} A70 70 0 0 1 ${point(to)}`;
  const marker = 0.7;
  const needle = Math.PI * (1 - marker);
  const rows = [
    { y: 92, w: 110, fill: "var(--light-blue)" },
    { y: 142, w: 80, fill: "var(--royal)" },
    { y: 192, w: 130, fill: "var(--yellow)" },
  ];
  return (
    <>
      <rect data-anim="fade" data-anim-step={0} x={30} y={18} width={380} height={230} rx={14} fill="var(--surface)" />
      <g data-anim="fade" data-anim-step={1}>
        <circle cx={62} cy={48} r={12} fill="var(--light-blue)" />
        <rect x={84} y={40} width={110} height={8} rx={4} fill={INK_20} />
        <rect x={84} y={54} width={70} height={6} rx={3} fill="rgba(26, 27, 31, 0.1)" />
      </g>
      <path data-anim="fade" data-anim-step={1} d={arc(0, 1)} fill="none" strokeWidth={16} strokeLinecap="round" stroke={INK_08} />
      <Wipe x={60} y={90} width={170} height={100} step={2}>
        <path d={arc(0, marker)} fill="none" strokeWidth={16} strokeLinecap="round" stroke="var(--light-blue)" />
      </Wipe>
      <line
        data-anim="needle"
        data-anim-step={2}
        data-anim-from={-marker * 180}
        data-anim-origin="140 170"
        x1={140}
        y1={170}
        x2={140 + 52 * Math.cos(needle)}
        y2={170 - 52 * Math.sin(needle)}
        strokeWidth={4}
        strokeLinecap="round"
        stroke="var(--royal)"
      />
      <circle data-anim="pop" data-anim-step={2} cx={140} cy={170} r={7} fill="var(--royal)" />
      {rows.map((row) => (
        <g key={row.y}>
          <rect data-anim="fade" data-anim-step={3} x={250} y={row.y} width={60} height={7} rx={3.5} fill="rgba(26, 27, 31, 0.15)" />
          <rect data-anim="grow-x" data-anim-step={3} x={250} y={row.y + 16} width={row.w} height={14} rx={7} fill={row.fill} />
        </g>
      ))}
    </>
  );
}

/* Lucide icons (ISC), as used on the DVO site */
const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const HeartPulse = () => (
  <svg {...iconProps}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);
const Droplet = () => (
  <svg {...iconProps}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);
const Wind = () => (
  <svg {...iconProps}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);
const Calendar = () => (
  <svg {...iconProps}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);
const MessageCircle = () => (
  <svg {...iconProps}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
