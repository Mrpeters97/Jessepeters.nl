"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useDirectionalFill, FILL_ENTER_DURATION, FILL_LEAVE_DURATION } from "@/components/useDirectionalFill";

interface FillPillProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  external?: boolean;
  fillColor?: string;
  textColor?: string;
  hoverTextColor?: string;
  ariaLabel?: string;
  reverse?: boolean;
  /** Extra content rendered as part of the button (e.g. a count badge) —
   *  a render prop so it can react to the same hover-fill state as the
   *  label text instead of sitting on top as a visually separate layer.
   *  Laid out inline next to the label with `gap`, not absolutely
   *  positioned, so it can never overlap the text regardless of pill width.
   *  `colorTransitionCss` is the exact same delayed transition the label
   *  text uses — apply it to any of the badge's own color-based properties
   *  so both flip in step instead of the badge (on its own, faster timing)
   *  visibly changing before or after the label. */
  badge?: (isHovering: boolean, colorTransitionCss: string) => React.ReactNode;
  /** Gap between the label and `badge`. No-op without a badge. */
  gap?: string;
  /** Opt in to the difference-blended cursor (CustomCursor) instead of the
   *  default magenta dot. Off by default — only specific CTAs want it. */
  cursorBlend?: boolean;
}

export default function FillPill({
  href,
  children,
  className = "",
  style,
  external = false,
  fillColor = "var(--white)",
  textColor = "var(--white)",
  hoverTextColor = "var(--bg)",
  ariaLabel,
  reverse = false,
  badge,
  gap = "0px",
  cursorBlend = false,
}: FillPillProps) {
  const { controls, isHovering, onMouseEnter, onMouseLeave } = useDirectionalFill(reverse);

  /* Delayed roughly to when the fill has visually reached the text (near
     its travel's midpoint) — flipping color the instant the hover starts
     made the text go dark/light before the fill actually caught up,
     reading as briefly invisible against the still-unfilled background. */
  const colorTransitionCss = isHovering
    ? `color 0.15s ease-in-out ${FILL_ENTER_DURATION * 0.5}s`
    : `color 0.15s ease-in-out ${FILL_LEAVE_DURATION * 0.5}s`;

  const inner = (
    <>
      <motion.span
        initial={reverse ? { x: "0%", y: "0%" } : { x: "0%", y: "110%" }}
        animate={controls}
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: fillColor, borderRadius: "inherit" }}
      />
      <span
        className="relative z-10 inline-flex items-center justify-center"
        style={{
          color: isHovering ? hoverTextColor : textColor,
          transition: colorTransitionCss,
          gap,
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{children}</span>
        {badge?.(isHovering, colorTransitionCss)}
      </span>
    </>
  );

  if (external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={`relative overflow-hidden ${className}`}
        style={style}
        data-cursor-blend={cursorBlend ? "true" : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`relative overflow-hidden ${className}`}
      style={style}
      data-cursor-blend={cursorBlend ? "true" : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {inner}
    </Link>
  );
}
