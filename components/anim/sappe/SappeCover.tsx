"use client";

import { useRef } from "react";
import { Phone, screen, useStage, type Step } from "./SappePhone";
import styles from "./sappe.module.css";

/* The dashboard, where the current module's progress fills; then it settles back and goes again. */
const COVER: Step[] = [
  { src: screen("dashboard"), hold: 1400, to: "swap", progress: 35, bar: "dashboard" },
  { src: screen("dashboard"), hold: 5200, progress: 65, bar: "dashboard" },
];

/** Card cover: one calm phone on the dashboard, its module progress filling. */
export function SappeCover() {
  const ref = useRef<HTMLDivElement>(null);
  const { play, load } = useStage(ref);
  return (
    <div ref={ref} aria-hidden className={styles.cover}>
      <Phone steps={COVER} play={play} load={load} gestures={false} />
    </div>
  );
}

