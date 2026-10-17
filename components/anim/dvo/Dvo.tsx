"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./dvo.module.css";

const A = "/projects/DVO_Coaching/anim";
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/* 1.jpg is 5742 × 2610; the werkwijze screen in it is the live site at 1440 css px, 1.7306 image px per css px.
   hero-steps.webp is that row with all six cards (2670 css px), hero-pages.webp the ← 1 … 6 → bar for each step. */
const W = 5742;
const H = 2610;
const ROW = { x: 3009, y: 556, w: 2492, h: 1052 };
const PAGES = { x: 3909, y: 1615, w: 692, h: 69 };
const STRIP_W = 4621;
/* the row can travel 1230 of its 2670 css px */
const TRAVEL = (1230 / 2670) * 100;
const LAST = 5;

const DELAY = 0;
const GLIDE = 20000;
/* easeInOutSine, so the page numbers can follow the eased position */
const EASE = "cubic-bezier(0.37, 0, 0.63, 1)";
const eased = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const box = (r: { x: number; y: number; w: number; h: number }): CSSProperties => ({
  left: pct(r.x, W),
  top: pct(r.y, H),
  width: pct(r.w, W),
  height: pct(r.h, H),
});

/** Detail-page hero (1.jpg): the werkwijze row glides slowly from step 1 to 6 and back, the page numbers following it like on the site. */
export function DvoPageHero({ alt }: { alt: string }) {
  const [run, setRun] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setRun(window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)").matches);
  }, []);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [run]);

  useEffect(() => {
    const img = imgRef.current;
    if (!loaded || !img) return;
    const glide = img.animate([{ transform: "translateX(0%)" }, { transform: `translateX(${-TRAVEL}%)` }], {
      duration: GLIDE,
      delay: DELAY,
      easing: EASE,
      direction: "alternate",
      iterations: Infinity,
    });
    let frame = 0;
    const follow = () => {
      const t = Math.max(0, Number(glide.currentTime ?? 0) - DELAY) / GLIDE;
      const leg = t % 2;
      const progress = eased(leg <= 1 ? leg : 2 - leg);
      setPage(Math.round(progress * LAST));
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => {
      cancelAnimationFrame(frame);
      glide.cancel();
    };
  }, [loaded]);

  if (!run) return null;

  return (
    <div className={styles.coverFit} role="img" aria-label={alt}>
      <div className={styles.coverFrame} data-on={loaded ? "" : undefined}>
        <div className={styles.row} style={box(ROW)}>
          <div className={styles.fade}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the six step cards, rendered from the site */}
            <img
              ref={imgRef}
              src={`${A}/hero-steps.webp`}
              alt=""
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={styles.strip}
              style={{ width: pct(STRIP_W, ROW.w) }}
            />
          </div>
        </div>
        <div className={styles.pages} style={box(PAGES)}>
          {Array.from({ length: LAST + 1 }, (_, i) => (
            <span
              key={i}
              className={styles.page}
              data-on={i === page ? "" : undefined}
              style={{ backgroundImage: `url(${A}/hero-pages.webp)`, backgroundPositionY: `${i * 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
