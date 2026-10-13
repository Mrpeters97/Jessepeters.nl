"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ProjectVideo as ProjectVideoSpec } from "@/lib/data";
import { useInViewVideo } from "@/hooks/useInViewVideo";
import styles from "./ProjectVideo.module.css";

/**
 * A detail-grid clip inside its CSS composition. The tile reserves its exact
 * aspect ratio up front (no layout shift); the clip is only fetched once the
 * tile nears the viewport, starts from its first frame and fades in over the
 * tile background each time it scrolls into view. With reduced motion the clip
 * is never loaded — the end-state still is shown instead.
 */
export default function ProjectVideo({
  media,
  delay = 0,
  mobile = false,
}: {
  media: ProjectVideoSpec;
  delay?: number;
  mobile?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  // Mobile: only fetch once the tile is about to scroll in, and start it when most of it is on screen
  const { containerRef, videoRef, near, playing } = useInViewVideo<HTMLDivElement>(mobile ? 0.6 : 0.25, false, mobile ? "10% 0px" : "50% 0px");

  const content = !near ? null : reduceMotion ? (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized still inside a fixed-ratio frame
    <img src={`${media.src}-still.webp`} alt="" className={styles.media} decoding="async" />
  ) : (
    <video
      ref={videoRef}
      className={styles.media}
      style={{ opacity: playing ? 1 : 0, transition: "opacity 0.6s ease" }}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    >
      <source src={`${media.src}.webm`} type="video/webm" />
      <source src={`${media.src}.mp4`} type="video/mp4" />
    </video>
  );

  return (
    <motion.div
      ref={containerRef}
      className={`${styles.tile} ${styles[media.tile]} ${media.onLight ? styles.onLight : ""}`}
      style={{ backgroundColor: media.background }}
      initial={{ opacity: 0, y: mobile ? 28 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: mobile ? "-12%" : "-18%" }}
      transition={{ duration: mobile ? 1 : 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {media.frame === "bleed" && content}

      {media.frame === "screen" && (
        <div className={styles.screen} style={{ width: `${media.size ?? 84}%`, aspectRatio: media.aspect, backgroundColor: media.screen }}>
          {content}
        </div>
      )}

      {media.frame === "phone" && (
        <div className={styles.iphone} style={{ "--w": `${media.size ?? 32.5}cqw` } as CSSProperties}>
          <i className={`${styles.button} ${styles.action}`} />
          <i className={`${styles.button} ${styles.volumeUp}`} />
          <i className={`${styles.button} ${styles.volumeDown}`} />
          <i className={`${styles.button} ${styles.power}`} />
          <div className={styles.bezel}>
            <div
              className={styles.phoneScreen}
              style={
                {
                  "--status-bg": media.statusBar?.background,
                  "--status-color": media.statusBar?.color,
                  "--indicator": media.statusBar?.indicator,
                } as CSSProperties
              }
            >
              <div className={styles.statusBar} aria-hidden>
                <span>9:41</span>
                <StatusIcons />
              </div>
              <div className={styles.viewport}>{content}</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatusIcons() {
  return (
    <span className={styles.statusIcons}>
      <svg viewBox="0 0 18 12">
        <rect x="0" y="8" width="3" height="4" rx=".8" />
        <rect x="5" y="5.5" width="3" height="6.5" rx=".8" />
        <rect x="10" y="3" width="3" height="9" rx=".8" />
        <rect x="15" y="0" width="3" height="12" rx=".8" />
      </svg>
      <svg viewBox="0 0 16 12">
        <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.3-1.3C13.4 1.4 10.8.3 8 .3S2.6 1.4.7 3.3L2 4.6c1.6-1.5 3.7-2.4 6-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.3C11.5 4.7 9.8 4 8 4s-3.5.7-4.7 1.8l1.3 1.3c.9-.8 2.1-1.3 3.4-1.3zM8 9.4c-.6 0-1.1.2-1.5.6L8 11.5 9.5 10c-.4-.4-.9-.6-1.5-.6z" />
      </svg>
      <svg viewBox="0 0 27 12">
        <rect x=".6" y=".6" width="22.8" height="10.8" rx="3" fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.2" />
        <rect x="2.3" y="2.3" width="19.4" height="7.4" rx="1.6" />
        <path d="M25 4v4c.8-.3 1.3-1.1 1.3-2S25.8 4.3 25 4z" fillOpacity=".45" />
      </svg>
    </span>
  );
}
