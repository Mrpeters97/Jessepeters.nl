"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "framer-motion";
import styles from "./cafedelmar.module.css";

const A = "/projects/Cafe_Del_Mar/anim";

/* The hero of cafedelmar.nl: two rows of photos running in opposite directions
   behind the zigzag. Tile widths in "Home" units (the site frame as drawn in Figma). */
const GAP = 25.06;
const ROWS = [
  { dir: 1, tiles: [["aprons", 404.36], ["bag", 345.13], ["machine", 380], ["bakery", 404], ["group", 360]] },
  { dir: -1, tiles: [["smile", 468.15], ["cherries", 338.3], ["farmer", 380], ["beans", 430], ["cup", 400]] },
] as const;
const SPEED = 22; // Home units per second

/** Where the photo rows sit in a render, measured from that render (frame px): the
 *  zigzag's leftmost reach, the card's right edge, the rows' edges around the gutter,
 *  where the first photo starts, and the render's scale in Home units. */
type HeroGeometry = { left: number; right: number; top: number; gtop: number; gbot: number; bottom: number; first: number; s: number };
const COVER: HeroGeometry = { left: 1371.5, right: 2096.75, top: 164.75, gtop: 553.25, gbot: 576.25, bottom: 1062.25, first: 1389.76, s: 1 };
export const TILE5: HeroGeometry = { left: 738.5, right: 1376.75, top: 255.75, gtop: 595.75, gbot: 618.75, bottom: 1035.75, first: 754.56, s: 0.88005 };
export const PAGE: HeroGeometry = { left: 744, right: 1385.5, top: 123.5, gtop: 464.5, gbot: 488.5, bottom: 917.5, first: 756.16, s: 0.87863 };

/**
 * The rows sit in the holes of `overlay` (the render with the photo area cut out
 * exactly), so the zigzag, the title letters and the menu stay on top. The rows
 * start under the zigzag and run a little past every edge of the holes, so no seam
 * shows. Starts in the designed state and pauses while off screen.
 */
export function Ticker({ frameW, geo, overlay }: { frameW: number; geo: HeroGeometry; overlay: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const u = (px: number) => `calc(${px} * 100cqw / ${frameW})`;
  const bands = [
    [geo.top - 2, geo.gtop + 1],
    [geo.gbot - 1, geo.bottom + 2],
  ];

  return (
    <div ref={ref} className={styles.ticker} data-run={inView ? "" : undefined}>
      {ROWS.map((row, r) => {
        const loop = row.tiles.reduce((sum, [, w]) => sum + w + GAP, 0) * geo.s;
        const [y0, y1] = bands[r];
        const lead = geo.first - geo.left;
        return (
          <div key={r} className={styles.band} style={{ left: u(geo.left), top: u(y0), width: u(geo.right + 2 - geo.left), height: u(y1 - y0) }}>
            <div
              className={`${styles.track} ${row.dir > 0 ? styles.toRight : styles.toLeft}`}
              style={
                {
                  left: u(row.dir > 0 ? lead - loop : lead),
                  gap: u(GAP * geo.s),
                  "--loop": u(loop),
                  animationDuration: `${loop / geo.s / SPEED}s`,
                } as CSSProperties
              }
            >
              {[0, 1, 2].flatMap((copy) =>
                row.tiles.map(([name, w]) => (
                  // eslint-disable-next-line @next/next/no-img-element -- small pre-cropped tiles
                  <img key={`${copy}-${name}`} src={`${A}/t-${name}.webp`} alt="" loading="lazy" decoding="async" style={{ width: u(w * geo.s) }} />
                )),
              )}
            </div>
          </div>
        );
      })}
      {/* eslint-disable-next-line @next/next/no-img-element -- transparent cut-out, pre-sized */}
      <img src={overlay} alt="" className={styles.overlay} loading="lazy" decoding="async" />
    </div>
  );
}

/** A 2871×1305 frame filling its box like object-fit: cover. */
export function CoverFit({ alt, children }: { alt: string; children: ReactNode }) {
  return (
    <div className={styles.coverFit} role="img" aria-label={alt}>
      <div className={styles.coverFrame}>{children}</div>
    </div>
  );
}

/** Card cover (Figma "Main image"): the site hero with its photo rows running. */
export function CafeDelMarCover({ alt }: { alt: string }) {
  return (
    <CoverFit alt={alt}>
      <Ticker frameW={2871} geo={COVER} overlay={`${A}/cover-frame.webp?v=4`} />
    </CoverFit>
  );
}
