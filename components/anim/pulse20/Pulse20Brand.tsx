"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import localFont from "next/font/local";
import { useInView } from "framer-motion";
import AnimTile from "../AnimTile";
import maleo from "../svg/pulse20Maleo";
import styles from "./pulse20Brand.module.css";

/* Syne is Pulse20's body face (SIL OFL). Only loaded where these tiles render.
   The display face (Maleo Black Italic) is commercial, so its few strings ship
   as outlines (svg/pulse20Maleo) instead of as a font. */
const syne = localFont({
  src: [{ path: "./fonts/syne-latin.woff2", weight: "400 800", style: "normal" }],
  variable: "--font-syne",
  preload: false,
});

const DARK = "#1E1E1E";

/** One design pixel of the 1512×1292 tile. */
const px = (n: number) => `calc(var(--p) * ${n})`;

/** Plays the build-up once the tile is well in view; resets once it has fully left. Loops run while any of it shows. */
function useReveal(ref: RefObject<HTMLDivElement | null>) {
  const inPlay = useInView(ref, { amount: 0.35 });
  const visible = useInView(ref);
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    if (inPlay) setPlayed(true);
    else if (!visible) setPlayed(false);
  }, [inPlay, visible]);
  return { "data-play": played ? "" : undefined, "data-run": visible ? "" : undefined };
}

function Maleo({ text, size, style }: { text: keyof typeof maleo; size: number; style?: CSSProperties }) {
  const { d, box } = maleo[text];
  return (
    <svg viewBox={box.join(" ")} className={styles.maleo} style={{ height: px((size * box[3]) / 1000), ...style }}>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** A piece of the composition, placed in design pixels; `i` is its place in the build-up. */
function Rise({ x, y, i, className, style, children }: { x: number; y: number; i: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div data-rise className={`${styles.at} ${className ?? ""}`} style={{ left: px(x), top: px(y), "--d": i, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

/** The site's list bullet: three circles at 33/66/100%. */
function Bullet() {
  return (
    <svg viewBox="0 0 11 11" className={styles.bullet}>
      <circle cx={5.5} cy={5.5} r={5.5} fill="#ABBF50" fillOpacity={0.33} />
      <circle cx={5.5} cy={5.5} r={4} fill="#ABBF50" fillOpacity={0.66} />
      <circle cx={5.5} cy={5.5} r={2.5} fill="#ABBF50" />
    </svg>
  );
}

const SWATCHES = [
  { name: "Green", hex: "#235642" },
  { name: "Lime", hex: "#C5DC59" },
  { name: "Cream", hex: "#FFE4BF" },
  { name: "Black", hex: "#0C0C0C" },
];

/** Design board (like DVO's and the Golfclub's): typefaces, headline, colours and buttons build up in turn. */
export function Pulse20Design({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={DARK} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.brand} ${syne.variable}`} {...useReveal(ref)}>
        <Rise x={112} y={150} i={0}>
          <Maleo text="Aa" size={300} />
        </Rise>
        <Rise x={420} y={152} i={1} className={styles.syneSpecimen}>
          Aa
        </Rise>
        <Rise x={120} y={396} i={2} className={styles.fontName}>
          Maleo Black Italic
        </Rise>
        <Rise x={426} y={396} i={2} className={styles.fontName}>
          Syne
        </Rise>
        <Rise x={1392} y={396} i={3} className={`${styles.fontName} ${styles.alignRight}`} style={{ opacity: 0.45 }}>
          Headings · Body
        </Rise>

        <Rule y={470} i={3} />

        <Rise x={120} y={524} i={4} className={styles.headline}>
          <Maleo text="STRENGTH IN EVERY" size={112} />
          <Maleo text="PULSE" size={112} style={{ color: "#C5DC59" }} />
        </Rise>
        <Rise x={120} y={636} i={5} className={styles.paragraph}>
          Ontdek EMS-training en word fit in 20 minuten per week.
        </Rise>

        <Rule y={724} i={5} />

        {SWATCHES.map(({ name, hex }, k) => (
          <Rise key={name} x={120 + k * 324} y={776} i={6 + k * 0.6} className={styles.swatch}>
            <span className={styles.chip} style={{ background: hex }} />
            <span className={styles.swatchLabel}>
              <b>{name}</b>
              {hex}
            </span>
          </Rise>
        ))}

        <Rule y={1004} i={8} />

        <div className={`${styles.at} ${styles.buttons}`} style={{ left: px(120), top: px(1056) }}>
          <span data-rise className={styles.button} style={{ "--d": 9 } as CSSProperties}>
            <i className={styles.outline} />
            <i className={styles.outline} />
            <i className={styles.outline} />
            <Maleo text="GRATIS PROEFLES" size={30} />
          </span>
          <span data-rise className={`${styles.button} ${styles.buttonFilled}`} style={{ "--d": 9.6 } as CSSProperties}>
            <Maleo text="ALLE PAKKETTEN" size={30} />
          </span>
          <span data-rise className={styles.pill} style={{ "--d": 10.2 } as CSSProperties}>
            <Maleo text="MEEST GEKOZEN" size={26} />
          </span>
        </div>
      </div>
    </AnimTile>
  );
}

function Rule({ y, i }: { y: number; i: number }) {
  return <div data-grow className={`${styles.at} ${styles.rule}`} style={{ left: px(120), top: px(y), width: px(1272), "--d": i } as CSSProperties} />;
}

const PERKS = ["20 minuten per sessie", "Gratis proteïneshake", "Personal trainer", "Voedingstips", "Training tracking", "Lichaamsmeting", "Flexibel inplannen via de app"];
const STUDIOS = ["Leeuwarden", "Meppel", "Assen", "Hoogeveen"];

/** Components from the Pulse20 site: a package card, the FAQ and the studio list. */
export function Pulse20Components({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={DARK} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.brand} ${syne.variable}`} {...useReveal(ref)}>
        <Rise x={120} y={160} i={0} className={styles.package}>
          <span className={styles.badge}>
            <Maleo text="MEEST GEKOZEN" size={24} />
          </span>
          <Maleo text="RESULT FIT+" size={92} style={{ color: "#ABBF50" }} />
          <p className={styles.packageSub}>6 Sessies per 4 weken</p>
          <ul className={styles.perks}>
            {PERKS.map((perk) => (
              <li key={perk}>
                <Bullet />
                {perk}
              </li>
            ))}
          </ul>
          <Maleo text="€28.33 PER TRAINING" size={54} style={{ marginTop: "auto" }} />
        </Rise>

        <Rise x={776} y={160} i={1} className={styles.faq}>
          <Maleo text="FAQ" size={72} />
          <div className={styles.faqItem}>
            <Maleo text="KAN IK AFVALLEN VAN EMS TRAININGEN?" size={30} />
            <Toggle />
          </div>
          <div className={styles.faqItem}>
            <Maleo text="IK HEB OVERGEWICHT, IS EMS DAN GOED?" size={30} />
            <Toggle open />
            <p className={styles.answer}>
              Ja, EMS-training is geschikt voor mensen met overgewicht. Het is een low-impact trainingsmethode die je gewrichten
              ontziet.
            </p>
          </div>
          <div className={styles.faqItem}>
            <Maleo text="WAT IS DE ABONNEMENTSDUUR?" size={30} />
            <Toggle />
          </div>
        </Rise>

        <Rise x={776} y={760} i={2} className={styles.studios}>
          <Maleo text="STUDIO'S" size={64} />
          <ul>
            {STUDIOS.map((studio) => (
              <li key={studio}>
                <Bullet />
                {studio}
                <Arrow />
              </li>
            ))}
          </ul>
        </Rise>
      </div>
    </AnimTile>
  );
}

function Toggle({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={styles.toggle}>
      <circle cx={20} cy={20} r={18.5} fill="none" stroke="#ABBF50" strokeWidth={2} />
      <path d={open ? "M13 20h14" : "M13 20h14M20 13v14"} stroke="#FFE4BF" strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className={styles.arrow}>
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#ABBF50" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
