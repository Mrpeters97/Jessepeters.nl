"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useViewPlay } from "@/hooks/useViewPlay";
import AnimatedSvg from "../AnimatedSvg";
import InstaReveal from "../InstaReveal";
import AnimTile from "../AnimTile";
import StripBoard from "../StripBoard";
import componentsSvg from "../svg/lgcComponents";
import designSvg from "../svg/lgcDesign";
import instaSvg from "../svg/lgcInsta";
import logoSvg from "../svg/lgcLogo";
import markSvg from "../svg/lgcMark";
import patternSvg from "../svg/lgcPattern";
import siteSvg from "../svg/lgcSite";
import typeSvg from "../svg/lgcType";
import styles from "./lgc.module.css";

const A = "/projects/Leeuwarder_Golfclub/anim";
const DARK = "#262626";
const GREEN = "#06382A";

/* the hero lattice (a = (700, 0), b = (350, 520) in the 1512 × 1292 frame): x, y, turn, entry order, counter-clockwise */
const HERO_STARS: [number, number, number, number, boolean][] = [
  [1050, 520, 23, 0, false], [700, 1040, 0, 1, true], [350, 520, 0, 2, true], [700, 0, 23, 3, false],
  [1400, 1040, 23, 4, false], [0, 1040, 37, 5, false], [1400, 0, 46, 6, true], [1050, 1560, 0, 7, true],
  [0, 0, 0, 8, true], [350, 1560, 37, 9, false], [1750, 520, 46, 10, true], [-350, 520, 37, 11, false],
  [1050, -520, 46, 12, true], [350, -520, 23, 13, false], [1750, 1560, 23, 14, false], [2100, 1040, 46, 15, true],
  [-350, 1560, 14, 16, true], [700, 2080, 37, 17, false], [2100, 0, 9, 18, false], [-700, 1040, 14, 19, true],
  [1750, -520, 9, 20, false], [1400, 2080, 0, 21, true], [-700, 0, 37, 22, false], [-350, -520, 0, 23, true],
  [0, 2080, 14, 24, true], [2100, 2080, 23, 24, false], [-700, 2080, 51, 24, false],
];
const STAR_PATH = "M-5.71283 239.193L-152.368 301.063L-121.238 144.843C-119.76 137.409 -124.739 130.11 -132.126 128.898L-237.961 111.738C-245.21 110.586 -251.769 115.846 -252.389 123.286L-264.887 274.589L-375.719 171.828C-381.275 166.698 -389.729 167.276 -394.238 173.102L-460.071 257.67C-464.63 263.516 -463.313 272.252 -457.22 276.714L-331.637 368.314L-478.855 416.24C-485.839 418.525 -489.335 426.352 -486.556 433.429L-446.156 536.315C-443.358 543.442 -435.352 546.81 -428.718 543.634L-288.808 477.386L-315.315 639.559C-316.497 646.878 -311.516 653.89 -304.316 655.061L-213.589 669.529C-206.508 670.689 -200.039 665.636 -199.193 658.335L-179.992 486.865L-51.8015 600.232C-46.2743 605.144 -37.9768 604.457 -33.5278 598.768L22.9561 526.61C27.4847 520.834 26.2947 512.276 20.3999 507.736L-112.924 405.296L37.9322 350.344C44.6711 347.869 47.9383 340.189 45.2177 333.261L11.2305 246.705C8.51002 239.777 0.840612 236.391 -5.73228 239.144L-5.71283 239.193Z";

/** Detail-page hero: the star pattern of tile 8 on the club green — the stars fade in from the middle outward, then the
    lattice wanders on endlessly while each star turns slowly. Built from one layer per star (not one SVG) so every
    movement runs on the compositor and stays smooth while the page is still loading. */
export function LgcPageHero({ alt }: { alt: string }) {
  return (
    <div className={styles.hero} role="img" aria-label={alt}>
      <div className={styles.heroBox}>
        <div className={styles.heroField}>
          {HERO_STARS.map(([x, y, turn, i, ccw]) => (
            <div
              key={`${x},${y}`}
              className={styles.heroStar}
              style={{ left: `${((x - 266.84) / 1512) * 100}%`, top: `${((y - 279.06) / 1292) * 100}%`, rotate: `${turn}deg`, "--i": i } as CSSProperties}
            >
              <svg viewBox="-266.84 -279.06 533.69 558.12" className={styles.heroSpin} data-ccw={ccw ? "" : undefined} aria-hidden>
                <path d={STAR_PATH} transform="translate(220.67 -390.64)" fill="#FCF6CB" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* the logo frame sits in the third slot, which keeps the club green of the slot (its Figma frame is dark) */
const logoOnGreen = logoSvg.replace('fill="#262626"', 'fill="#014E38"');

/** 3 (Figma "1/2 frame", logo): the construction lines and boxes are drawn, then the logo builds up inside them, like Pulse20. */
export function LgcLogo({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#014E38" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={logoOnGreen} className={`${styles.svg} ${styles.logo} ${styles.build}`} />
    </AnimTile>
  );
}

/** 4 (Figma "Full frame"): the tilted site columns drift up and down on scroll. */
export function LgcBoard({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="full" background={GREEN} delay={delay} mobile={mobile}>
      <StripBoard
        src={`${A}/4-board.webp`}
        srcMobile={`${A}/4-board-sm.webp`}
        width={3112}
        height={2584}
        background={GREEN}
        angle={9.11}
        pivot={[1556, 1292]}
        cuts={[-906.8, 507.5, 1315.5]}
        mobile={mobile}
      />
    </AnimTile>
  );
}

/** 8 (Figma "1/2 frame", Een spel dat verder gaat dan sportambitie): the stars come in from the middle outward and keep turning slowly in place; the line rises in. */
export function LgcPattern({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#FCF6CB" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={patternSvg} className={`${styles.svg} ${styles.pattern}`} />
    </AnimTile>
  );
}

const INSTA_CARDS = ["Rectangle 74", "Rectangle 77", "Rectangle 80"];
const INSTA_POSTS = ["post 1", "post 2", "post 3"];

/** 11 (Figma "1/2 frame", Instagram): the cards fade up one by one, then the posts settle in — like Pulse20's Insta. */
export function LgcInsta({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={GREEN} delay={delay} mobile={mobile}>
      <InstaReveal svg={instaSvg} cards={INSTA_CARDS} posts={INSTA_POSTS} className={styles.svg} />
    </AnimTile>
  );
}

/** 5 (Figma "1/2 frame_1", the site in its frame): the contour lines behind the screen draw themselves in. */
export function LgcSite({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={GREEN} delay={delay} mobile={mobile}>
      <AnimatedSvg svg={siteSvg} className={`${styles.svg} ${styles.site}`} />
    </AnimTile>
  );
}

/* the partner cards of 7.jpg (3140 × 2584): 507 × 508 at a 599 pitch, the first one cut off at x = -224 */
const PARTNERS = [
  "heineken", "11stedenhal", "sligro", "rabobank", "sc-cambuur", "brandsma", "spie", "boomsma", "levo", "olympia",
  "nok-ib", "airpress", "van-der-kooi", "krikke", "de-tijd-wonen", "oreel", "breman", "trip", "vos-golf", "dsgn",
  "omnyacc", "de-alde-stjelp", "speak", "hout-1893", "kiv-noord", "tri", "wifo", "narrowcasting", "kuhlman-repko",
  "expert-tromp", "rekladruk", "fgd-lease", "van-der-veen-kromhout", "de-wassende-cowboys", "junction",
];

/** 7 (the footer with "Onze trotse partners"), with the logos from leeuwardergolfclub.nl: on desktop the partner row
    slides right to left while scrolling down, like the kings of PC Franeker; on mobile it runs on by itself, endlessly. */
export function LgcPartners({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shift = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -38]);
  const x = useTransform(shift, (v) => `${v}cqw`);
  const cards = mobile ? [...PARTNERS, ...PARTNERS] : PARTNERS;
  return (
    <AnimTile size="full2" background="#014F39" delay={delay} mobile={mobile}>
      <div ref={ref} className={styles.fill}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the page without its partner row */}
        <img src={`${A}/7-base${mobile ? "-sm" : ""}.webp`} alt="" loading="lazy" decoding="async" className={styles.fill} />
        <div className={styles.partners} data-run={inView && !reduceMotion ? "" : undefined}>
          <motion.div
            className={styles.track}
            data-scroll={mobile ? undefined : ""}
            style={mobile ? ({ "--n": PARTNERS.length } as CSSProperties) : { x }}
          >
            {cards.map((p, i) => (
              <div key={i} className={styles.partner} aria-hidden={i >= PARTNERS.length || undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element -- small pre-sized logo */}
                <img src={`${A}/partners/${p}.webp`} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </AnimTile>
  );
}

/** Design board (extra, like DVO's): typefaces, headline, colours and interface build up step by step. */
export function LgcDesign({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background={DARK} delay={delay} mobile={mobile}>
      <AnimatedSvg svg={designSvg} className={`${styles.svg} ${styles.board}`} />
    </AnimTile>
  );
}

/* the components board sits on black instead of the club green of its frame */
const componentsOnBlack = componentsSvg.replace('<rect width="1512" height="1292" fill="#014E38"/>', '<rect width="1512" height="1292" fill="#000000"/>');

/** Components board (extra, like DVO's): the rates card, FAQ and event card from the site build up in a cascade. */
export function LgcComponents({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#000000" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={componentsOnBlack} className={`${styles.svg} ${styles.board}`} />
    </AnimTile>
  );
}


/* the outline of the course in the Figma "Concept 2" frame (1920 × 1080), drawn on top of the map */
const COURSE = "M6.66699 856.499C5.65683 856.484 5.21522 856.322 4.97168 856.175C4.73445 856.032 4.40336 855.734 3.95215 854.885C3.51865 854.069 3.07518 852.939 2.5 851.312V816.369C8.83604 810.148 14.8863 803.523 18.793 794.198L18.7949 794.193C21.768 787.053 24.0192 779.7 26.1748 772.449C28.3412 765.162 30.4047 757.998 33.0283 751.043C36.2447 742.541 36.1392 734.265 32.5859 725.888L32.585 725.884C30.4772 720.935 28.4499 715.936 26.4131 710.912C24.3794 705.896 22.3355 700.857 20.208 695.862V695.861C15.5005 684.775 15.031 673.957 19.3086 662.502C22.3708 654.362 25.9343 646.724 29.3008 638.506L29.3018 638.503C37.3192 618.869 45.2773 599.248 53.6689 579.833L55.3535 575.952C58.0367 569.805 60.1972 563.372 59.585 556.198V556.193C58.5523 544.382 58.2116 532.527 57.8369 520.583C57.463 508.666 57.0555 496.667 55.8799 484.693V484.692C55.0249 475.84 53.9307 467.262 56.1123 459.612L56.333 458.875C57.4726 455.268 58.8197 452.219 60.1602 448.449C61.4454 444.835 62.5591 440.953 62.8604 436.511C62.9946 434.575 63.1414 432.842 63.1475 431.465C63.1533 430.127 63.046 428.625 62.3271 427.338C61.5068 425.869 60.1659 425.123 58.7061 424.752C57.3465 424.407 55.6562 424.326 53.7119 424.333H53.7109C46.8941 424.36 40.1071 423.642 33.1533 422.925C26.2464 422.212 19.1795 421.502 12.0342 421.614H12.0332C10.084 421.645 9.13636 421.006 8.62305 420.26C8.02339 419.388 7.64638 417.829 7.97949 415.428C8.29092 413.235 9.42563 411.686 11.1377 410.446L11.4883 410.202L11.498 410.195C21.4191 403.469 26.0023 393.549 27.0928 381.598L27.0938 381.594C27.7816 373.923 28.828 366.462 32.3379 360.76V360.759C42.1589 344.79 50.2184 328.558 62.8135 315.295L62.8145 315.294C73.5532 303.977 85.3421 300.063 99.6172 301.447H99.6182C121.774 303.589 143.136 309.886 164.604 316.831L164.614 316.834L164.625 316.838C165.183 317.013 166.498 317.525 167.586 317.713C168.818 317.926 170.316 317.876 171.763 316.942L172.052 316.743C176.166 313.731 180.641 312.324 185.433 311.576C190.367 310.806 195.219 310.77 200.584 310.323C203.785 310.057 207.749 309.563 210.927 306.736L211.222 306.465C218.666 299.448 227.988 297.447 237.982 294.958C244.391 293.373 250.41 295.26 254.597 300.697C260.532 308.46 267.786 311.058 276.451 311.293H276.454C282.868 311.46 289.27 311.174 295.555 310.935C301.872 310.694 308.091 310.5 314.306 310.823H314.305C319.073 311.079 323.696 311.868 328.718 312.458C333.632 313.035 338.747 313.39 343.951 312.612C350.838 311.589 357.713 311.156 364.659 311.156C389.273 311.156 413.833 311.074 438.399 311.238H438.398C446.041 311.296 453.268 309.948 460.476 307.842L460.478 307.841C497.374 297.027 534.016 288.419 572.205 294.424H572.207C587.739 296.854 603.267 293.705 617.51 288.776L618.884 288.294C623.33 286.712 627.676 284.595 631.915 282.47C636.196 280.323 640.353 278.177 644.601 276.406C659.415 270.225 674.295 267.608 689.838 270.753L689.841 270.754L690.194 270.829C691.919 271.222 693.071 271.846 693.9 272.664C694.793 273.545 695.521 274.857 696.02 276.935V276.937C698.965 289.168 702.232 300.855 703.808 313.203C709.12 354.894 716.462 396.209 724.089 437.426L725.617 445.668C726.141 448.543 727.125 451.047 729.087 452.711C731.105 454.423 733.675 454.845 736.44 454.626C747.484 453.772 758.374 452.737 769.271 452.409L771.446 452.354C799.291 451.804 827.086 451.118 854.854 451.584H854.855C867.704 451.791 880.499 451.217 893.209 450.613C905.148 450.046 917.007 449.452 928.879 449.437L931.253 449.441C960.136 449.606 989.268 447.928 1017.97 447.491C1041.26 447.134 1064.53 447.437 1087.89 447.409C1089.69 447.409 1091.3 447.338 1092.63 447.057C1094 446.769 1095.36 446.204 1096.36 445.012C1097.34 443.842 1097.69 442.414 1097.8 441.031C1097.91 439.655 1097.81 438.02 1097.63 436.179C1094.98 408.821 1091.82 381.48 1087.3 354.348L1086.85 351.723C1086.35 348.74 1086.08 345.742 1085.73 342.576C1085.4 339.65 1085.02 336.624 1084.32 333.606L1084.18 333.004C1077.42 305.425 1071.9 277.551 1066.12 249.638C1065.33 245.815 1065.62 244.098 1066.19 243.234C1066.71 242.446 1067.98 241.626 1071.55 241.199H1071.55C1099.98 237.79 1128.3 232.096 1156.39 227.811L1156.4 227.81C1166.08 226.322 1175.83 224.87 1185.54 223.22L1189.7 222.499C1192.03 222.09 1194.43 221.32 1196.48 219.771C1198.57 218.182 1200.13 215.899 1200.9 212.785L1200.9 212.781C1203.05 204.129 1205.32 195.082 1205.21 185.616V185.614C1205.11 177.333 1205.76 169.124 1207.06 160.93C1209.24 147.225 1211.23 133.465 1213 119.679C1216.99 89.0266 1222.45 58.2365 1225.27 27.2021V27.1992C1225.45 25.1735 1225.64 23.7929 1225.91 22.7979C1226.17 21.8398 1226.45 21.4064 1226.71 21.1475C1226.98 20.8758 1227.43 20.5811 1228.4 20.2607C1229.4 19.931 1230.72 19.6456 1232.61 19.2617C1242.8 17.1926 1253.1 16.1848 1263.52 15.4248C1273.24 14.7158 1283.15 14.2185 1292.98 13.2607L1294.94 13.0625C1309.38 11.5689 1323.85 10.411 1338.36 9.25C1352.85 8.08977 1367.38 6.9264 1381.89 5.42578H1381.89C1387.85 4.80096 1393.82 4.47468 1399.89 4.09863C1405.87 3.72769 1411.92 3.3084 1417.96 2.5H1459.74C1461.97 3.19196 1463.33 4.30051 1464.18 5.67578C1465.09 7.1716 1465.56 9.26663 1465.45 12.1162C1465.35 14.2664 1465.44 16.457 1465.48 18.4482C1465.52 20.4925 1465.52 22.3925 1465.29 24.2197L1465.29 24.2285C1463.42 39.5787 1458.53 52.9299 1446.59 61.1201L1446.59 61.123C1440.01 65.6556 1434.67 70.854 1432.76 79.7705L1432.75 79.7744C1432.19 82.4412 1431.13 84.7496 1430.1 87.7793C1421.15 113.824 1419.35 139.951 1429.23 166.704L1429.23 166.707L1429.58 167.661C1436.79 187.716 1437.16 208.343 1429.9 228.646L1429.9 228.646C1427.92 234.171 1426.77 239.473 1426.94 244.855C1427.11 250.264 1428.61 255.608 1431.72 261.22L1431.72 261.223L1432.52 262.686C1436.46 270.02 1439.5 277.605 1443.35 285.413C1447.37 293.557 1452.1 301.528 1459.19 308.071H1459.19C1460.44 309.231 1460.96 310.595 1460.94 312.039C1460.92 313.538 1460.31 315.265 1459.03 316.95L1459.03 316.952C1451.57 326.787 1444.13 336.577 1436.51 346.225L1436.5 346.23C1434.14 349.24 1431.54 351.138 1428.17 351.351C1403.42 352.891 1378.8 354.673 1354.1 356.074H1354.09C1351 356.254 1348.37 356.505 1346.19 357.034C1343.98 357.572 1342.06 358.435 1340.53 359.951C1339.01 361.461 1338.1 363.401 1337.49 365.685C1336.88 367.944 1336.53 370.716 1336.25 374.045L1336.25 374.046C1336.09 375.87 1336.01 377.74 1336.09 379.638V379.647L1336.09 379.656L1336.2 381.723C1336.76 391.713 1337.74 401.756 1339.88 411.614L1340.11 412.633C1342.09 421.417 1341.77 430.211 1341.82 439.538V439.541L1341.82 439.847C1341.79 441.328 1341.49 442.113 1341.21 442.466C1341.06 442.662 1340.72 443.006 1339.49 442.889V442.888C1335.67 442.511 1332.35 443.205 1330.41 445.975C1328.77 448.307 1328.61 451.502 1328.91 454.773L1328.98 455.429C1330.54 469.714 1330.84 484.033 1331.45 498.581L1331.45 498.585L1331.47 499.136C1331.54 501.845 1331.21 503.896 1330.49 505.517C1329.75 507.187 1328.5 508.598 1326.38 509.828L1326.38 509.829C1324.39 510.972 1322.13 512.176 1320 513.557L1319.09 514.16C1312.59 518.618 1305.48 521.693 1298.14 525.502C1290.91 529.249 1283.68 533.612 1277.71 540.479C1277.36 540.876 1276.8 541.247 1275.89 541.659C1275.45 541.862 1274.98 542.05 1274.44 542.263C1273.92 542.467 1273.34 542.698 1272.78 542.953L1272.77 542.956C1259.39 549.069 1245.63 554.917 1232.26 561.414L1232.26 561.415C1197.85 578.158 1162.7 592.85 1126.98 605.899H1126.98C1066.92 627.863 1004.92 641.595 942.73 655.197C917.471 660.701 891.93 665.695 866.676 671.633H866.675C833.311 679.492 799.955 687.302 766.386 693.028L766.387 693.029C738.082 697.849 710.103 704.294 682.214 710.412C628.793 722.132 575.16 733.353 521.727 745.273V745.274C494.503 751.355 467.208 757.085 439.894 762.838C412.584 768.589 385.256 774.362 357.995 780.52C310.084 791.342 262.021 801.05 213.947 811.502C159.564 823.315 105.196 835.433 50.8516 847.38C37.3404 850.346 24.7096 854.304 11.3945 856.084H11.2461L11.0801 856.106C9.08455 856.375 7.70337 856.514 6.66699 856.499Z";

/* the name from the logo frame, under the mark as in the logo (the mark sits 125.61 lower in its own frame than there) */
const name = logoSvg.slice(logoSvg.indexOf('<g data-n="Group 2">'), logoSvg.indexOf('<g transform="translate(0 -10)" data-n="Group 166">'));
const markWithName = markSvg.replace(/<\/svg>$/, `<g transform="translate(1.99 125.61)"><g data-k="name">${name}</g></g></svg>`);

/** Logo concept (Figma "concept 1–7", extra): the whole map of the area, the course is singled out and outlined, the
    contour lines are drawn over it; the map gives way and the rest of the contour field spreads out from the course;
    then one calm camera move to the spot inside the course where the lines run like the brand mark (the field is bent
    there to follow it) while the field narrows to a soft circle around it, a bright star appears, the mark's lines draw over the field's and the landscape fades away; then the logo settles to the centre as the name rises in under it. Plays once per visit. */
export function LgcConcept({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { play } = useViewPlay(ref, 0.15);
  const reduceMotion = useReducedMotion();
  return (
    <AnimTile size="half" background={DARK} delay={delay} mobile={mobile}>
      <div ref={ref} className={`${styles.fill} ${styles.concept}`} data-play={play || reduceMotion ? "" : undefined}>
        <div className={styles.stage}>
          <div className={styles.world}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the map frame */}
            <img src={`${A}/concept-map.webp`} alt="" loading="lazy" decoding="async" className={styles.layer} data-k="map" />
            {/* eslint-disable-next-line @next/next/no-img-element -- the map with the course singled out */}
            <img src={`${A}/concept-course.webp`} alt="" loading="lazy" decoding="async" className={styles.layer} data-k="course" />
            <div className={styles.spot}>
              <div className={styles.field} data-k="field">
                {/* eslint-disable-next-line @next/next/no-img-element -- the contour field, wider than the frame */}
                <img src={`${A}/concept-lines.webp`} alt="" loading="lazy" decoding="async" />
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- the contour lines inside the course */}
            <img src={`${A}/concept-lines-course.webp`} alt="" loading="lazy" decoding="async" className={styles.layer} data-k="lines-course" />
            <svg viewBox="0 0 1920 1080" className={styles.layer} data-k="outline" aria-hidden>
              <path d={COURSE} transform="translate(350 135)" stroke="#FCF6CB" strokeWidth={5} pathLength={1} fill="none" />
            </svg>
          </div>
          <AnimatedSvg svg={markWithName} replay={false} className={styles.svg} />
        </div>
      </div>
    </AnimTile>
  );
}

/** Typefaces (Figma "state 1–3", extra): the copy rises in, then the guides of PolySans and Albra are drawn in turn, endlessly. */
export function LgcType({ delay, mobile }: { delay?: number; mobile?: boolean }) {
  return (
    <AnimTile size="half" background="#014E38" delay={delay} mobile={mobile}>
      <AnimatedSvg svg={typeSvg} className={`${styles.svg} ${styles.type}`} />
    </AnimTile>
  );
}
