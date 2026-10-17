"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import AnimTile from "../AnimTile";
import StripBoard from "../StripBoard";
import melangesSvg from "../svg/cdmMelanges";
import styles from "./cafedelmar.module.css";
import { CoverFit, PAGE, TILE5, Ticker } from "./CafeDelMarCover";

const A = "/projects/Cafe_Del_Mar/anim";

/** Detail-page hero (1.jpg): the same running rows, over the static hero image. */
export function CafeDelMarPageHero({ alt }: { alt: string }) {
  return (
    <CoverFit alt={alt}>
      <Ticker frameW={2871} geo={PAGE} overlay={`${A}/1-frame.webp?v=4`} />
    </CoverFit>
  );
}

/** 5 (Figma "1/2 frame", orange): the same running hero. */
export function CafeDelMarHero({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#ED682B" delay={delay} mobile={mobile}>
      <Ticker frameW={1512} geo={TILE5} overlay={`${A}/5-frame.webp?v=4`} />
    </AnimTile>
  );
}

/** 2 (Figma "1/2 frame", melanges & brandingen): the row of bags slides sideways as you scroll. */
export function CafeDelMarMelanges({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [170, -170]);
  const apply = (v: number) => {
    const row = ref.current?.querySelector<SVGGElement>('[data-n="Group 75"]');
    if (row) row.style.transform = `translateX(${v}px)`;
  };
  useMotionValueEvent(x, "change", apply);
  useEffect(() => apply(x.get()), [x]);

  return (
    <AnimTile size="half" background="#FAF3E6" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.svg} aria-hidden dangerouslySetInnerHTML={{ __html: melangesSvg }} />
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the tilted site columns drift up and down on scroll. */
export function CafeDelMarBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background="#FAF3E6" delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background="#FAF3E6"
        angle={-15.3}
        pivot={[1556, 1292]}
        cuts={[-798.75, 614.5, 1421.25]}
        tighten={40}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/** The logo's text ring turning slowly around the (static) seahorse. */
function RingSpin({ base, ring, frame, box }: { base: string; ring: string; frame: [number, number]; box: [number, number, number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [w, h] = frame;
  const [x, y, size] = box;
  return (
    <div ref={ref} className={styles.ringSpin} data-run={inView ? "" : undefined}>
      <Image src={base} alt="" fill sizes={w > 2000 ? "100vw" : "(max-width: 768px) 100vw, 50vw"} />
      {/* eslint-disable-next-line @next/next/no-img-element -- transparent ring, pre-sized */}
      <img
        src={ring}
        alt=""
        loading="lazy"
        className={styles.ring}
        decoding="async"
        style={{ left: `${(x / w) * 100}%`, top: `${(y / h) * 100}%`, width: `${(size / w) * 100}%` }}
      />
    </div>
  );
}

/** 7 (Figma "1/2 frame", full width): the footer, its logo ring turning. */
export function CafeDelMarFooter({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full2" background="#5DC4E1" delay={delay} mobile={mobile}>
      <RingSpin base={`${A}/7-frame.webp`} ring={`${A}/7-ring.webp`} frame={[3140, 2584]} box={[1311.6, 1362.55, 516.79]} />
    </AnimTile>
  );
}

/** 8 (Figma "1/2 frame", logo): only the text ring turns. */
export function CafeDelMarLogo({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#B73B02" delay={delay} mobile={mobile}>
      <RingSpin base={`${A}/8-frame.webp`} ring={`${A}/8-ring.webp`} frame={[1512, 1292]} box={[445, 335, 622]} />
    </AnimTile>
  );
}
