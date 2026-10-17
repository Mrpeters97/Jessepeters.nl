"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type TransitionEvent, type WheelEvent } from "react";
import { motion } from "framer-motion";
import CoverImage from "@/components/CoverImage";
import { glassStyle } from "@/components/glassStyle";
import { projects } from "@/lib/data";

const VISIBLE = 3;
const GAP = 8;
const THUMB_RATIO = "1292 / 1512";
const EASE = [0.22, 1, 0.36, 1] as const;
const PINNED = [
  "dvo-coaching",
  "leeuwarder-golfclub",
  "pc-franeker",
  "gemeente-tynaarlo",
  "dna-projecten",
  "cafe-del-mar",
  "pulse20",
];

function orderProjects(exclude: string) {
  const pinned = PINNED.flatMap((slug) => projects.filter((p) => p.slug === slug));
  const rest = projects.filter((p) => !PINNED.includes(p.slug));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...pinned, ...rest].filter((p) => p.slug !== exclude);
}

function Arrow({
  dir,
  disabled,
  color,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous projects" : "Next projects"}
      className="flex items-center justify-center rounded-full w-7 h-7 transition-opacity duration-300"
      style={{
        color,
        opacity: disabled ? 0.2 : 0.7,
        cursor: disabled ? "default" : undefined,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: dir === "prev" ? "scaleX(-1)" : undefined }}
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * Hover preview of the Work menu item: a glass panel above the floating menu
 * with a 3-up strip of project thumbs that pages one project per arrow click
 * (or horizontal trackpad swipe). The strip loops endlessly: the list is
 * rendered three times and, once a slide settles in an outer copy, it snaps
 * without transition to the identical position in the middle copy.
 */
export default function WorkFlyout({
  overHero,
  isDark,
  onNavigate,
}: {
  overHero: boolean;
  isDark: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const [items] = useState(() => orderProjects(pathname.replace(/^\/work\//, "")));
  const n = items.length;
  const loops = n > VISIBLE;
  const strip = loops ? [...items, ...items, ...items] : items;
  const maxIndex = strip.length - VISIBLE;
  const [index, setIndex] = useState(loops ? n : 0);
  const [instant, setInstant] = useState(false);
  const wheelLock = useRef(0);

  useEffect(() => {
    if (!instant) return;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setInstant(false));
    });
    return () => cancelAnimationFrame(raf);
  }, [instant]);

  const onSettle = (e: TransitionEvent) => {
    if (!loops || e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (index >= 2 * n || index < n) {
      setInstant(true);
      setIndex(index >= 2 * n ? index - n : index + n);
    }
  };

  const useDarkStyle = isDark || overHero;
  const text = useDarkStyle ? "#ffffff" : "#1a1a18";
  const muted = useDarkStyle ? "rgba(255,255,255,0.55)" : "rgba(26,26,24,0.55)";
  const thumbBg = useDarkStyle ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  const step = (d: number) => setIndex((i) => Math.min(maxIndex, Math.max(0, i + d)));

  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    const now = performance.now();
    if (now - wheelLock.current < 350) return;
    wheelLock.current = now;
    step(e.deltaX > 0 ? 1 : -1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="rounded-[24px] pt-4 pb-4"
      style={{
        width: "min(560px, calc(100vw - 32px))",
        transformOrigin: "50% 100%",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        ...glassStyle(overHero, isDark),
      }}
      onWheel={onWheel}
    >
      <div className="flex items-center justify-between px-10 mb-3">
        <span style={{ fontSize: "13px", fontWeight: 500, color: muted }}>
          Selected work
        </span>
        <Link
          href="/work"
          onClick={onNavigate}
          className="text-[var(--see-all)] transition-colors duration-300 hover:text-[var(--accent-magenta)]"
          style={{ fontSize: "13px", fontWeight: 500, "--see-all": text } as CSSProperties}
        >
          See all ({projects.length})
        </Link>
      </div>

      <div className="px-10">
        <div className="relative">
          <div className="overflow-hidden">
            <ul
              className="flex"
              style={{
                gap: GAP,
                transform: `translateX(calc(${-index} * (100% + ${GAP}px) / ${VISIBLE}))`,
                transition: instant ? "none" : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onTransitionEnd={onSettle}
            >
              {strip.map((p, i) => (
                <motion.li
                  key={`${p.slug}-${i}`}
                  className="shrink-0"
                  style={{ width: `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})` }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.05 + Math.min(Math.max(i - index, 0), VISIBLE) * 0.04 }}
                >
                  <Link
                    href={`/work/${p.slug}`}
                    onClick={onNavigate}
                    className="group block"
                    tabIndex={i >= index && i < index + VISIBLE ? 0 : -1}
                  >
                    <div
                      className="relative overflow-hidden rounded-none transition-[border-radius] duration-700 group-hover:rounded-[6px] [transform:translateZ(0)]"
                      style={{ aspectRatio: "1512 / 1292", backgroundColor: thumbBg }}
                    >
                      <CoverImage src={p.menuThumbnail ?? p.thumbnail} alt={p.title} sizes="420px" />
                    </div>
                    <span
                      className="block mt-2 truncate"
                      style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.4, color: text }}
                    >
                      {p.title}
                    </span>
                    <span
                      className="block truncate"
                      style={{ fontSize: "11px", lineHeight: 1.4, color: muted }}
                    >
                      {p.format ?? p.categories[0]}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Image-height overlay (padding % resolves against width) so the arrows centre on the thumbs, not on thumbs + captions. */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ paddingTop: `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE} * ${THUMB_RATIO})` }}
          >
            <div className="absolute top-1/2 right-full -translate-y-1/2 flex justify-center w-10 pointer-events-auto">
              <Arrow dir="prev" disabled={!loops && index === 0} color={text} onClick={() => step(-1)} />
            </div>
            <div className="absolute top-1/2 left-full -translate-y-1/2 flex justify-center w-10 pointer-events-auto">
              <Arrow dir="next" disabled={!loops && index === maxIndex} color={text} onClick={() => step(1)} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
