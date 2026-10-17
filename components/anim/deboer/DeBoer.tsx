"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useViewPlay } from "@/hooks/useViewPlay";
import AnimTile from "../AnimTile";
import SlideIn, { type SlideLayer } from "../SlideIn";
import StripBoard from "../StripBoard";
import { ASCENT, DESCENT, GLYPHS, T } from "../svg/deboerType";
import styles from "./deboer.module.css";

const A = "/projects/De_Boer_RVS/anim";
const BLUE = "#93C2D3";
const INK = "#161616";
const LIGHT = "#EEEEEE";
const BG = "#272727";

/** One unit of the current composition (set per tile as --p). */
const px = (n: number) => `calc(var(--p) * ${n})`;

/** Plays the build-up once the tile is well in view (see useViewPlay). Loops run while any of it shows. */
function useReveal(ref: RefObject<HTMLDivElement | null>) {
  const { play, run } = useViewPlay(ref);
  return { "data-play": play ? "" : undefined, "data-run": run ? "" : undefined };
}

/** A line of outlined type: `x` is its left edge, `y` its baseline, `size` the font size (all in --p units). */
function Txt({
  k,
  size,
  x,
  y,
  fill = "currentColor",
  link,
  underline,
  className,
  style,
}: {
  k: keyof typeof T;
  size: number;
  x: number;
  y: number;
  fill?: string;
  /** Colour of the line's link runs, which are underlined like on the site. */
  link?: string;
  underline?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { w, parts } = T[k];
  const s = size / 100;
  return (
    <svg
      viewBox={`0 ${-ASCENT} ${w} ${ASCENT + DESCENT}`}
      className={`${styles.txt} ${className ?? ""}`}
      style={{ left: px(x), top: px(y - ASCENT * s), width: px(w * s), height: px((ASCENT + DESCENT) * s), ...style }}
    >
      {parts.map((run, i) => {
        const isLink = !!run.tag || underline;
        return (
          <g key={i} fill={run.tag && link ? link : fill}>
            {run.g.map(([g, gx], j) => (
              <path key={j} d={GLYPHS[g]} transform={gx ? `translate(${gx})` : undefined} />
            ))}
            {isLink && <rect x={run.x0} y={22} width={run.x1 - run.x0} height={6} />}
          </g>
        );
      })}
    </svg>
  );
}

const width = (k: keyof typeof T, size: number) => (T[k].w * size) / 100;

/** The site's chevron (`.a-arrowShape`), filled or as the outlined skeleton. */
function Chevron({ outline, className, style }: { outline?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 210 260" className={`${styles.chevron} ${className ?? ""}`} style={style}>
      {outline ? (
        <path
          d="M52.7073 207.943H156.288L104.799 258.806H1.21764L52.7073 207.943ZM209.5 155.379L158.006 206.246V53.0596L209.5 103.934V155.379ZM156.288 51.3627H52.7073L1.21764 0.5H104.799L156.288 51.3627Z"
          fill="none"
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <path
          d="M52.502 207.443L0 259.306H105.004L157.506 207.443H52.502ZM52.502 0H0L52.502 51.8627H157.506L105.004 0H52.502ZM157.506 51.8627V207.443L210 155.588V103.725L157.506 51.8627Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

const box = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: px(x), top: px(y), width: px(w), height: px(h) });

/** A label centred in a button box of `w` × `h`. */
function Label({ k, size, w, h, fill }: { k: keyof typeof T; size: number; w: number; h: number; fill: string }) {
  return <Txt k={k} size={size} x={(w - width(k, size)) / 2} y={h / 2 + (size * 0.714) / 2} fill={fill} />;
}

/* ── the home banner (Figma frame 4, in its pixels; the page starts at 437, 559) ── */

const ARROW = { y: 872, w: 249, h: 307.5 };
/* left to right; on the site the last one comes in first, from furthest away */
const ARROWS = [
  { x: 1134, o: 0.5, from: "-300%", at: 2 },
  { x: 1551.5, o: 0.75, from: "-400%", at: 1.75 },
  { x: 1969, o: 1, from: "-500%", at: 1.5 },
];

/** deboerrvs.nl's banner: the photo opens out to the right, the arrows slide in behind it and the title fades in (with `intro`, on play). */
function Banner({ mobile, intro }: { mobile?: boolean; intro?: boolean }) {
  return (
    <div className={`${styles.at} ${intro ? styles.intro : ""}`} style={box(35, 34, 2218, 1180)}>
      <div className={styles.bannerClip}>
        <div className={styles.photo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the banner photo, cleaned of its overlays */}
          <img src={`${A}/${mobile ? "banner-sm" : "banner"}.webp`} alt="" loading="lazy" decoding="async" />
        </div>
        {ARROWS.map(({ x, o, from, at }) => (
          <Chevron
            key={x}
            className={styles.arrowIn}
            style={{ ...box(x, ARROW.y, ARROW.w, ARROW.h), color: LIGHT, "--o": o, "--from": from, "--at": `${at}s` } as CSSProperties}
          />
        ))}
      </div>
      <Chevron
        outline
        className={styles.arrowIn}
        style={{ ...box(ARROWS[2].x, ARROW.y, ARROW.w, ARROW.h), color: LIGHT, "--o": 1, "--from": "-500%", "--at": "1.5s" } as CSSProperties}
      />
      <div className={styles.title}>
        <Txt k="title1" size={142} x={36} y={957.7} fill={LIGHT} />
        <Txt k="title2" size={142} x={36} y={1115.7} fill={LIGHT} />
      </div>
    </div>
  );
}

/** The fixed header: language switch, the menu toggle (Menu / Sluiten) and the logo. */
function Header({ toggle }: { toggle?: boolean }) {
  return (
    <>
      <div className={`${styles.at} ${styles.nl}`} style={box(71, 70, 72, 71)}>
        <Label k="nl" size={25} w={72} h={71} fill={INK} />
      </div>
      <div className={`${styles.at} ${styles.toggle} ${toggle ? styles.toggling : ""}`} style={box(155, 70, 155, 71)}>
        <span className={styles.closedText}>
          <Label k="menu" size={25} w={155} h={71} fill={INK} />
        </span>
        <span className={styles.openText}>
          <Label k="sluiten" size={25} w={155} h={71} fill={BLUE} />
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- small local SVG */}
      <img src="/projects/De_Boer_RVS/logo.svg" alt="" className={styles.at} style={box(2003, 34, 250, 250)} />
    </>
  );
}

function WhatsApp() {
  return (
    <div className={`${styles.at} ${styles.whatsapp}`} style={box(2181, 1138, 72, 71)}>
      <svg viewBox="0 0 30 30" style={box(19, 18, 34, 34)} className={styles.at}>
        <path d={WA} fill={INK} fillRule="evenodd" />
      </svg>
    </div>
  );
}

/** Frame 4: the homepage in the site window; once in view the banner builds up like on deboerrvs.nl, then the
    next section's photo opens from the top. */
export function DeBoerHome({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="full" background={BG} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={styles.tile} style={{ "--p": "calc(100cqw / 3161)" } as CSSProperties} {...useReveal(ref)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the window with the banner area emptied */}
        <img src={`${A}/${mobile ? "4-base-sm" : "4-base"}.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
        <div className={styles.at} style={box(437, 559, 2285, 1505)}>
          <Banner mobile={mobile} intro />
          {/* eslint-disable-next-line @next/next/no-img-element -- the next section's photo, cut from the frame */}
          <img src={`${A}/${mobile ? "4-photo-sm" : "4-photo"}.webp`} alt="" loading="lazy" decoding="async" className={`${styles.at} ${styles.nextPhoto}`} style={box(1466, 1325, 739, 181)} />
          <Header />
          <WhatsApp />
        </div>
      </div>
    </AnimTile>
  );
}

/* ── frame 5: the menu (in tile pixels of 1512 × 1292; the site's viewport is the panel's box) ── */

const VIEW = { x: 72, y: 344, w: 1367, h: 625, cut: 149 };
/** frame-4 page pixels → tile pixels: the page is scaled down to the panel's width */
const PAGE = VIEW.w / 2285;
const LINKS = ["l1", "l2", "l3", "l4", "l5", "l6", "l7"] as const;

/** Frame 5: the menu opens like on deboerrvs.nl — the panel drops down over the page in 0.75 s, Menu turns into
    Sluiten — stays open a while and closes again. Loops while in view. */
export function DeBoerMenu({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.tile} ${styles.menu}`} style={{ "--u": "calc(100cqw / 1512)", "--p": "var(--u)" } as CSSProperties} {...useReveal(ref)}>
        <div className={`${styles.at} ${styles.view}`} style={{ ...box(VIEW.x, VIEW.y, VIEW.w, VIEW.h), "--cut": px(VIEW.cut) } as CSSProperties}>
          <div className={styles.page} style={{ "--p": `calc(var(--u) * ${PAGE})` } as CSSProperties}>
            {/* the page is scrolled a little, so the banner's arrows and title are in view */}
            <div className={styles.fill} style={{ transform: `translateY(${px(-101.3 / PAGE)})` }}>
              <Banner mobile={mobile} />
            </div>
          </div>

          <div className={styles.panel}>
            {LINKS.map((k, i) => {
              const y = 176.7 + i * 59.65;
              return (
                <span key={k}>
                  <svg viewBox="0 0 22 23" className={styles.at} style={box(187, y - 15.3, 12, 12)}>
                    <path d="M22 23V0L0 23H22Z" fill={LIGHT} />
                  </svg>
                  <Txt k={k} size={28.3} x={220.5} y={y} fill={INK} />
                </span>
              );
            })}
            {(["c1", "c2", "c3", "c4"] as const).map((k, i) => (
              <Txt key={k} k={k} size={28.3} x={905} y={344.7 + i * 36} fill={INK} link={LIGHT} />
            ))}
            {(["a1", "a2", "a3", "a4"] as const).map((k, i) => (
              <Txt key={k} k={k} size={16.3} x={905} y={509.5 + i * 22.7} fill={INK} />
            ))}
            <Txt k="mail" size={16.3} x={1105} y={554.9} fill={LIGHT} underline />
            <Txt k="phone" size={16.3} x={1105} y={577.6} fill={LIGHT} underline />
          </div>

          <div className={styles.page} style={{ "--p": `calc(var(--u) * ${PAGE})` } as CSSProperties}>
            <Header toggle />
          </div>
        </div>
      </div>
    </AnimTile>
  );
}

/* ── frames 6, 7 and 8 ── */

const PHONES: SlideLayer[] = [
  { src: "ph1", box: [262, 190, 457, 936] },
  { src: "ph2", box: [793, 190, 457, 936] },
];

/** Frame 6: the phones (home, menu) come in from left to right. */
export function DeBoerPhones({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#93C2D2" delay={delay} mobile={mobile}>
      <SlideIn dir={A} w={1512} h={1292} layers={PHONES} mobile={mobile} />
    </AnimTile>
  );
}

const WIREFRAMES: SlideLayer[] = [
  { src: "wf1", box: [55, 156, 501, 657] },
  { src: "wf2", box: [578, 156, 501, 274] },
  { src: "wf3", box: [578, 452, 501, 361] },
];

/** Frame 8: the wireframes come in one after another. */
export function DeBoerWireframes({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#202020" delay={delay} mobile={mobile}>
      <SlideIn dir={A} w={1134} h={969} layers={WIREFRAMES} />
    </AnimTile>
  );
}

const BOARD = { width: 3112, height: 2584, angle: -10, pivot: [1556, 1292] as [number, number], cuts: [-1474, 86, 546] };

/** Frame 7: the tilted page board; its columns drift alternately while it scrolls by. */
export function DeBoerBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background="#1F1F1F" delay={delay} mobile={mobile}>
      <StripBoard src={`${A}/7-board.webp`} srcMobile={`${A}/7-board-sm.webp`} background="#1F1F1F" mobile={mobile} {...BOARD} />
    </AnimTile>
  );
}

/* ── brand boards ── */

function Rise({ i, className, style, children }: { i: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div data-rise className={`${styles.group} ${className ?? ""}`} style={{ "--d": i, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

function Rule({ y, i, tone }: { y: number; i: number; tone: string }) {
  return <div data-grow className={`${styles.at} ${styles.rule}`} style={{ ...box(120, y, 1272, 1.5), background: tone, "--d": i } as CSSProperties} />;
}

/** A site button: a box with the bottom-right corner cut, its label centred. */
function Button({ k, x, y, w, h = 64, bg, fill, size = 22 }: { k: keyof typeof T; x: number; y: number; w: number; h?: number; bg: string; fill: string; size?: number }) {
  return (
    <div className={`${styles.at} ${styles.cutBR}`} style={{ ...box(x, y, w, h), background: bg }}>
      <Label k={k} size={size} w={w} h={h} fill={fill} />
    </div>
  );
}

const SWATCHES = [
  { name: "sw1", hex: "hex1", color: BLUE },
  { name: "sw2", hex: "hex2", color: INK },
  { name: "sw3", hex: "hex3", color: "#313131" },
  { name: "sw4", hex: "hex4", color: "#9F9FA0" },
  { name: "sw5", hex: "hex5", color: LIGHT },
] as const;

/** Design board: the typeface, the headline, the colours, the buttons and the site's arrows. */
export function DeBoerDesign({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const offerte = width("offerte", 22) + 60;
  return (
    <AnimTile size="half" background={BLUE} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.tile} ${styles.board}`} style={{ "--p": "calc(100cqw / 1512)", color: INK } as CSSProperties} {...useReveal(ref)}>
        <Rise i={0}>
          <Txt k="aa500" size={280} x={108} y={350} />
        </Rise>
        <Rise i={1}>
          <Txt k="aa400" size={280} x={520} y={350} />
        </Rise>
        <Rise i={2} style={{ opacity: 0.6 }}>
          <Txt k="font500" size={22} x={120} y={432} />
          <Txt k="font400" size={22} x={526} y={432} />
          <Txt k="roles" size={22} x={1392 - width("roles", 22)} y={432} />
        </Rise>

        <Rule y={470} i={3} tone="rgba(22, 22, 22, 0.16)" />

        <Rise i={4}>
          <Txt k="headline" size={92} x={116} y={610} />
        </Rise>
        <Rise i={5}>
          <Txt k="intro" size={30} x={120} y={676} link={LIGHT} />
        </Rise>

        <Rule y={730} i={5} tone="rgba(22, 22, 22, 0.16)" />

        {SWATCHES.map(({ name, hex, color }, n) => {
          const x = 120 + n * 259;
          return (
            <Rise key={name} i={6 + n * 0.5}>
              <div className={`${styles.at} ${styles.chip}`} style={{ ...box(x, 780, 236, 130), background: color }} />
              <Txt k={name} size={22} x={x} y={950} />
              <Txt k={hex} size={19} x={x} y={978} style={{ opacity: 0.6 }} />
            </Rise>
          );
        })}

        <Rule y={1030} i={8} tone="rgba(22, 22, 22, 0.16)" />

        <Rise i={9}>
          <div className={`${styles.at} ${styles.cutTL}`} style={{ ...box(120, 1080, 64, 64), background: LIGHT }}>
            <Label k="nl" size={22} w={64} h={64} fill={INK} />
          </div>
          <Button k="sluiten" x={190} y={1080} w={128} bg={INK} fill={BLUE} />
          <Button k="offerte" x={346} y={1080} w={offerte} bg={LIGHT} fill={INK} />
        </Rise>
        {[0.5, 0.75, 1].map((o, n) => (
          <Chevron
            key={n}
            className={styles.arrowIn}
            style={{ ...box(1052.5 + n * 124.5, 1066, 90.5, 112), color: INK, "--o": o, "--from": `${-120 - n * 40}%`, "--at": `${1.5 + (2 - n) * 0.25}s` } as CSSProperties}
          />
        ))}
      </div>
    </AnimTile>
  );
}

const MACHINES = [
  { src: "p-kookketel", lines: ["k1a", "k1b"] },
  { src: "p-spoelmolen", lines: ["k2a", "k2b"] },
  { src: "p-sorteerzeef", lines: ["k3a"] },
] as const;

/** Components board: the machine cards, the collaboration block with its button and a news card. */
export function DeBoerComponents({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimTile size="half" background={BG} delay={delay} mobile={mobile}>
      <div ref={ref} aria-hidden className={`${styles.tile} ${styles.board}`} style={{ "--p": "calc(100cqw / 1512)", color: LIGHT } as CSSProperties} {...useReveal(ref)}>
        <Rise i={0}>
          <Txt k="machines" size={52} x={120} y={170} />
        </Rise>
        {MACHINES.map(({ src, lines }, n) => {
          const x = 120 + n * 436;
          return (
            <Rise key={src} i={1 + n * 0.5}>
              <div className={`${styles.at} ${styles.cardRule}`} style={box(x, 214, 400, 1.5)} />
              {/* eslint-disable-next-line @next/next/no-img-element -- product photo from deboerrvs.nl */}
              <img src={`${A}/${src}.webp`} alt="" loading="lazy" decoding="async" className={`${styles.at} ${styles.cover}`} style={box(x, 236, 400, 300)} />
              {lines.map((k, l) => (
                <Txt key={k} k={k} size={26} x={x} y={586 + l * 32} />
              ))}
            </Rise>
          );
        })}

        <Rise i={3}>
          <Txt k="cta1" size={46} x={120} y={800} />
          <Txt k="cta2" size={46} x={120} y={854} />
          <Txt k="p1" size={22} x={120} y={910} style={{ opacity: 0.7 }} />
          <Txt k="p2" size={22} x={120} y={942} style={{ opacity: 0.7 }} />
        </Rise>
        <Rise i={3.5}>
          <Button k="ontdek" x={120} y={990} w={width("ontdek", 22) + 60} bg={BLUE} fill={INK} />
        </Rise>

        <Rise i={4}>
          {/* eslint-disable-next-line @next/next/no-img-element -- news photo from deboerrvs.nl */}
          <img src={`${A}/p-nieuws.webp`} alt="" loading="lazy" decoding="async" className={`${styles.at} ${styles.cover}`} style={box(812, 730, 580, 326)} />
          <Txt k="news" size={20} x={812} y={1102} fill={BLUE} />
          <Txt k="newsTitle" size={32} x={812} y={1146} />
        </Rise>
      </div>
    </AnimTile>
  );
}

const WA =
  "M24.9883 4.25075C22.2387 1.51106 18.5819 0.00160675 14.6862 0C6.65864 0 0.125391 6.5018 0.122162 14.4931C0.121086 17.0476 0.791631 19.5413 2.06617 21.7393L0 29.25L7.7206 27.2344C9.84794 28.3893 12.2429 28.9979 14.6803 28.9986H14.6863C22.713 28.9986 29.247 22.4963 29.25 14.5047C29.2516 10.6317 27.7381 6.99026 24.9883 4.25075ZM14.6862 26.5508H14.6811C12.5091 26.5499 10.3789 25.969 8.52013 24.8716L8.0783 24.6104L3.49678 25.8066L4.71965 21.361L4.43174 20.9053C3.21998 18.9871 2.58011 16.7702 2.58119 14.494C2.5837 7.85183 8.01408 2.44797 14.691 2.44797C17.9243 2.44904 20.9636 3.70374 23.249 5.98086C25.5344 8.25798 26.7922 11.2847 26.7912 14.5038C26.7883 21.1464 21.3583 26.5508 14.6862 26.5508ZM21.326 17.5282C20.9622 17.3468 19.173 16.471 18.8393 16.3499C18.506 16.2291 18.2631 16.1689 18.0208 16.5313C17.7781 16.8937 17.0808 17.7096 16.8684 17.9512C16.656 18.1929 16.444 18.2232 16.08 18.0418C15.716 17.8606 14.5436 17.4781 13.1535 16.2442C12.0718 15.2839 11.3415 14.098 11.1291 13.7356C10.9171 13.3728 11.1273 13.1957 11.2888 12.9965C11.6827 12.5096 12.0772 11.9992 12.1984 11.7577C12.3199 11.5159 12.2591 11.3044 12.1679 11.1232C12.0772 10.942 11.3494 9.15937 11.0462 8.43401C10.7506 7.72811 10.4509 7.82345 10.2273 7.81238C10.0153 7.80184 9.7726 7.7997 9.52989 7.7997C9.28736 7.7997 8.89307 7.89022 8.55941 8.25298C8.22593 8.61557 7.28595 9.49161 7.28595 11.2742C7.28595 13.0568 8.58991 14.7789 8.77181 15.0206C8.9537 15.2623 11.3379 18.9204 14.9883 20.4889C15.8565 20.8624 16.5342 21.085 17.0629 21.252C17.9347 21.5276 18.7277 21.4887 19.3549 21.3955C20.0541 21.2914 21.5077 20.5193 21.8112 19.6734C22.1144 18.8274 22.1144 18.1024 22.0232 17.9512C21.9325 17.8001 21.6898 17.7096 21.326 17.5282Z";
