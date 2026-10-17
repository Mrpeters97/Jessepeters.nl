import type { CSSProperties } from "react";
import styles from "./DeBoerCube.module.css";

const FACES = ["logo", "logo-invert", "logo", "logo-invert"];

/**
 * De Boer RVS's spinning page-loader cube, live in CSS — as the grid card cover
 * and as a detail-grid tile. `size` (cube edge, any CSS length — container units
 * of the stage work) and `background` default to the loader's proportions.
 */
export default function DeBoerCube({ alt, size, background }: { alt: string; size?: string; background?: string }) {
  return (
    <div
      className={styles.stage}
      role="img"
      aria-label={alt}
      style={{ "--cube-size": size, "--cube-bg": background } as CSSProperties}
    >
      <div className={styles.cube}>
        <div className={styles.spin}>
          {FACES.map((face, i) => (
            <div key={i} className={styles.face}>
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG, no optimisation needed */}
              <img src={`/projects/De_Boer_RVS/${face}.svg`} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
