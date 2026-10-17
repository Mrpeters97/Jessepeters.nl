"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import styles from "./sappe.module.css";

export const screen = (name: string) => `/projects/Sappe_App/screens/${name}.webp`;

/**
 * One screen of a walkthrough. `tap` / `drag` are touch points in Figma screen
 * coordinates (390×844); the gesture plays after `hold`, then the app moves on
 * to the next screen with `to` (push = forward, pop = back, swap = state change).
 * `progress` draws the screen's progress bar live (the learning bar, or the
 * dashboard's module card with `bar: "dashboard"`); it fills from the previous
 * step's value, so a right answer visibly moves it on.
 */
export type Step = {
  src: string;
  hold?: number;
  tap?: [number, number];
  drag?: [number, number, number, number];
  to?: "push" | "pop" | "swap";
  progress?: number;
  bar?: "learning" | "dashboard";
};

type Kind = "push" | "pop" | "swap" | "fade";

/** Steps through the screens like someone using the app, while `play` is on. Restarts at the top after the last one. */
function useWalkthrough(steps: Step[], play: boolean, gestures: boolean) {
  const [state, setState] = useState<{ i: number; prev: number | null; kind: Kind }>({ i: 0, prev: null, kind: "fade" });
  const [touch, setTouch] = useState(0);

  useEffect(() => {
    if (!play) return;
    const step = steps[state.i];
    const hold = step.hold ?? 1700;
    const gesture = gestures && (step.tap || step.drag) ? (step.drag ? 1150 : 520) : 0;
    const timers = [
      gesture ? setTimeout(() => setTouch(state.i + 1), hold) : undefined,
      setTimeout(() => {
        setTouch(0);
        const next = (state.i + 1) % steps.length;
        setState({ i: next, prev: state.i, kind: next === 0 ? "fade" : step.to ?? "push" });
      }, hold + gesture),
    ];
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [state.i, play, steps, gestures]);

  return { ...state, touch: touch ? steps[touch - 1] : null, touchKey: touch };
}

/** An iPhone playing a walkthrough of the app. Screens load once the phone is near the viewport. */
export function Phone({
  steps,
  width,
  play,
  load,
  gestures = true,
  style,
}: {
  steps: Step[];
  width?: string;
  play: boolean;
  load: boolean;
  gestures?: boolean;
  style?: CSSProperties;
}) {
  const reduceMotion = useReducedMotion();
  const { i, prev, kind, touch, touchKey } = useWalkthrough(steps, play && !reduceMotion, gestures);

  return (
    <div className={styles.phone} style={{ ...(width ? { "--w": width } : {}), ...style } as CSSProperties}>
      <i className={`${styles.button} ${styles.action}`} />
      <i className={`${styles.button} ${styles.volumeUp}`} />
      <i className={`${styles.button} ${styles.volumeDown}`} />
      <i className={`${styles.button} ${styles.power}`} />
      <div className={styles.bezel}>
        <div className={styles.screen}>
          {load &&
            steps.map((s, k) => (
              <div key={k} className={styles.shot} data-state={k === i ? "in" : k === prev ? "out" : undefined} data-kind={kind}>
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized screens inside a fixed-ratio phone */}
                <img src={s.src} alt="" decoding="async" />
                {s.progress !== undefined && (
                  <Bar kind={s.bar ?? "learning"} from={k > 0 ? (steps[k - 1].progress ?? s.progress) : s.progress} to={s.progress} active={k === i && !reduceMotion} />
                )}
              </div>
            ))}
          {touch && <Touch key={touchKey} step={touch} />}
        </div>
      </div>
    </div>
  );
}

const FILL_DELAY = 380;
const FILL_DURATION = 1100;

/** The app's progress bar, redrawn over the screenshot so it can fill; the percentage counts along. */
function Bar({ kind, from, to, active }: { kind: "learning" | "dashboard"; from: number; to: number; active: boolean }) {
  const moves = active && from !== to;
  const [n, setN] = useState(to);

  useEffect(() => {
    if (!moves) {
      setN(to);
      return;
    }
    const start = performance.now() + FILL_DELAY;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - start) / FILL_DURATION));
      setN(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    setN(from);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [moves, from, to]);

  return (
    <span
      aria-hidden
      className={`${styles.bar} ${kind === "dashboard" ? styles.barDashboard : ""}`}
      style={{ "--from": from, "--to": to } as CSSProperties}
      data-moves={moves ? "" : undefined}
    >
      <i className={styles.barFill} />
      <b className={styles.barLabel}>
        {n}%
      </b>
    </span>
  );
}

function Touch({ step }: { step: Step }) {
  const [x, y, x2 = x, y2 = y] = step.drag ?? step.tap!;
  /* 390-wide Figma screens shown on a 393pt screen */
  const pt = (n: number) => `calc(var(--u) * ${(n * 393) / 390})`;
  return (
    <span
      aria-hidden
      className={styles.touch}
      data-gesture={step.drag ? "drag" : "tap"}
      style={{ "--x": x, "--y": y, "--dx": pt(x2 - x), "--dy": pt(y2 - y) } as CSSProperties}
    />
  );
}

/** Plays while a good part of the tile is on screen; screens load a little before that. */
export function useStage(ref: RefObject<HTMLDivElement | null>) {
  const play = useInView(ref, { amount: 0.35 });
  const load = useInView(ref, { once: true, margin: "40% 0px" });
  return { play, load };
}

