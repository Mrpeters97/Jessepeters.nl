"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useInView } from "framer-motion";
import AnimTile from "../AnimTile";
import { A, BG, Headline, HEADLINE_BOX } from "./CivScene";
import styles from "./civBrand.module.css";

const LIGHT = "#F7FBFF";

/** One design pixel of the 1512 × 1292 tile. */
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

/** The site's arrow (in its round white button). */
function Arrow() {
  return (
    <svg viewBox="0 0 14 11" className={styles.arrow}>
      <path
        d="M8.13656 10.4513L13.2277 5.36396L8.13593 0.273417L7.49953 0.908564L11.505 4.91405L0.94974 4.91403L0.94974 5.81389L11.505 5.81391L7.50017 9.81875L8.13656 10.4513Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** civwater.nl's hover: a light wave rises through the element and sinks back (looped here, `--w` offsets it). */
function WaveFill() {
  return (
    <span className={styles.waveFill} aria-hidden>
      <svg viewBox="0 24 150 28" preserveAspectRatio="none" className={styles.waveTop}>
        <path className={styles.waveMove} d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
      </svg>
      <span className={styles.waveBody} />
    </span>
  );
}

function Button({ children, tone, wave, delay }: { children: ReactNode; tone: "primary" | "secondary"; wave?: number; delay: number }) {
  return (
    <span
      data-rise
      className={`${styles.button} ${tone === "primary" ? styles.primary : styles.secondary} ${wave !== undefined ? styles.waving : ""}`}
      style={{ "--d": delay, "--w": `${wave ?? 0}s` } as CSSProperties}
    >
      {wave !== undefined && <WaveFill />}
      <span className={styles.buttonLabel}>{children}</span>
      <span className={styles.round}>
        <Arrow />
      </span>
    </span>
  );
}

const SWATCHES = [
  { name: "Navy", hex: "#10395C" },
  { name: "Blue", hex: "#3790DA" },
  { name: "Sky", hex: "#B7DBFF" },
  { name: "Light", hex: "#E9F4FF" },
  { name: "Ink", hex: "#171717" },
];

/** Design board: typeface, the headline with its wave, colours and the buttons (which show their wave hover). */
export function CivDesign({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={LIGHT} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.brand} ${styles.onLight}`} {...useReveal(ref)}>
        <Rise x={108} y={120} i={0} className={styles.specimen}>
          Aa
        </Rise>
        <Rise x={520} y={120} i={1} className={`${styles.specimen} ${styles.regular}`}>
          Aa
        </Rise>
        <Rise x={120} y={420} i={2} className={styles.fontName}>
          Neue Montreal Medium
        </Rise>
        <Rise x={526} y={420} i={2} className={styles.fontName}>
          Neue Montreal Regular
        </Rise>
        <Rise x={1392} y={420} i={3} className={`${styles.fontName} ${styles.alignRight}`} style={{ opacity: 0.45 }}>
          Headings · Body
        </Rise>

        <Rule y={486} i={3} />

        <Rise x={120} y={536} i={4}>
          <svg viewBox={HEADLINE_BOX} className={styles.headline}>
            <Headline />
          </svg>
        </Rise>
        <Rise x={120} y={712} i={5} className={styles.paragraph}>
          Samenwerken aan de ontwikkeling van wendbare vakmensen voor de watersector.
        </Rise>

        <Rule y={790} i={5} />

        {SWATCHES.map(({ name, hex }, k) => (
          <Rise key={name} x={120 + k * 259} y={840} i={6 + k * 0.5} className={styles.swatch}>
            <span className={styles.chip} style={{ background: hex }} />
            <span className={styles.swatchLabel}>
              <b>{name}</b>
              {hex}
            </span>
          </Rise>
        ))}

        <Rule y={1074} i={8} />

        <div className={`${styles.at} ${styles.buttons}`} style={{ left: px(120), top: px(1118) }}>
          <Button tone="primary" wave={0} delay={9}>
            Samenwerken
          </Button>
          <Button tone="secondary" wave={3.5} delay={9.5}>
            Actueel bij CIV Water
          </Button>
          <span data-rise className={styles.menuButton} style={{ "--d": 10 } as CSSProperties}>
            <span className={styles.burger}>
              <i />
              <i />
              <i />
            </span>
            Menu
          </span>
        </div>
      </div>
    </AnimTile>
  );
}

const FILTERS = ["Interesse", "Taal", "Locatie", "Status", "Toegang"];
const EVENTS = ["Alle events", "Sessies", "Open dagen", "Makathon's"];
const AGENDA = [
  { date: "22-01-23", title: "Algemene ledenvergadering", type: "Vergadering" },
  { date: "10-02-23", title: "MBO starters meeting", type: "Congres" },
  { date: "17-02-23", title: "Waterfietsen", type: "Teambuilding" },
  { date: "18-02-23", title: "Waterzuiveringsmaterie", type: "Vergadering" },
  { date: "19-02-23", title: "Makathon", type: "Vergadering" },
];

/** Components board: the agenda filter, the agenda list (one row shows the wave hover) and a content block. */
export function CivComponents({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={styles.brand} {...useReveal(ref)}>
        <Rise x={120} y={130} i={0} className={`${styles.card} ${styles.filter}`}>
          <div className={styles.filterHead}>
            Type event
            <i className={styles.minus} />
          </div>
          <ul className={styles.radios}>
            {EVENTS.map((e, k) => (
              <li key={e}>
                <i className={k === 0 ? styles.checked : undefined} />
                {e}
              </li>
            ))}
          </ul>
          {FILTERS.map((f) => (
            <div key={f} className={styles.filterRow}>
              {f}
              <i className={styles.plus} />
            </div>
          ))}
          <span className={`${styles.button} ${styles.secondary} ${styles.small}`}>
            <span className={styles.buttonLabel}>Meer weten? Neem contact op</span>
            <span className={styles.round}>
              <Arrow />
            </span>
          </span>
        </Rise>

        <Rise x={680} y={130} i={1} className={`${styles.card} ${styles.agenda}`}>
          {AGENDA.map(({ date, title, type }, k) => (
            <div key={date} className={`${styles.agendaRow} ${k === 1 ? styles.waving : ""}`} style={{ "--w": "0.6s" } as CSSProperties}>
              {k === 1 && <WaveFill />}
              <div className={styles.when}>
                <b>{date}</b>
                15:30 - 17:00
              </div>
              <div className={styles.what}>
                <b>{title}</b>
                {type}
              </div>
              <span className={styles.ring}>
                <Arrow />
              </span>
            </div>
          ))}
        </Rise>

        <Rise x={120} y={830} i={2} className={`${styles.card} ${styles.block}`}>
          <h3 className={styles.blockTitle}>Wij bieden maatwerk oplossingen voor professionals</h3>
          <div className={styles.blockBody}>
            <p>
              Samen met docenten en professionals uit de watersector ontwerpen we op maat gemaakte ontwikkeltrajecten voor
              studenten in het mbo-onderwijs.
            </p>
            <span className={`${styles.button} ${styles.primary} ${styles.small}`}>
              <span className={styles.buttonLabel}>Ontdek de mogelijkheden</span>
              <span className={styles.round}>
                <Arrow />
              </span>
            </span>
          </div>
        </Rise>
      </div>
    </AnimTile>
  );
}

/* the two rows of civwater.nl's partner slider, in the site's order (logos in anim/partners) */
const ROWS = [Array.from({ length: 30 }, (_, i) => `t${String(i).padStart(2, "0")}`), Array.from({ length: 30 }, (_, i) => `b${String(i).padStart(2, "0")}`)];

/** One site pixel inside the window (the 1239-unit window shows the 1920 px wide site). */
const sp = (n: number) => `calc(var(--s) * ${n})`;

/** Extra: civwater.nl's partner section in the site window, like on the site: four cards per row, the rows running
    continuously in opposite directions (one card per 7 s, as the site's slider). */
export function CivPartners({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={styles.brand} {...useReveal(ref)}>
        <div className={styles.window}>
          <div data-rise className={`${styles.at} ${styles.partnersTitle}`} style={{ left: sp(80), top: sp(380), "--d": 0 } as CSSProperties}>
            De ontwikkelpartners
          </div>
          {ROWS.map((row, r) => (
            <div key={r} data-rise className={`${styles.at} ${styles.row}`} style={{ left: sp(80), top: sp(465 + r * 261), "--d": 1 + r * 0.6 } as CSSProperties}>
              <div className={`${styles.track} ${r ? styles.reverse : ""}`}>
                {[...row, ...row].map((logo, k) => (
                  <span key={k} className={styles.logoCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- small pre-sized logo */}
                    <img src={`${A}/partners/${logo}.webp`} alt="" loading="lazy" decoding="async" />
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div data-rise className={`${styles.at} ${styles.partnersAside}`} style={{ left: sp(1280), top: sp(465), "--d": 2.2 } as CSSProperties}>
            <h3>Ontwikkelpartners</h3>
            <p>Samenwerking tussen onderwijsinstellingen, bedrijven en andere organisaties is essentieel voor de ontwikkeling van wendbare vakmensen voor de watersector.</p>
          </div>
          {/* the site's header (logo and bar) stays on top, as when scrolled down */}
          {/* eslint-disable-next-line @next/next/no-img-element -- the header layer of the Figma frame */}
          <img src={`${A}/${mobile ? "header-full-sm" : "header-full"}.webp`} alt="" loading="lazy" decoding="async" className={styles.header} />
        </div>
      </div>
    </AnimTile>
  );
}
