"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useDirectionalFill } from "@/components/useDirectionalFill";

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
   *  positioned, so it can never overlap the text regardless of pill width. */
  badge?: (isHovering: boolean) => React.ReactNode;
  /** Gap between the label and `badge`. No-op without a badge. */
  gap?: string;
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
}: FillPillProps) {
  const { controls, isHovering, onMouseEnter, onMouseLeave } = useDirectionalFill(reverse);

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
        style={{ color: isHovering ? hoverTextColor : textColor, transition: "color 0.15s ease-in-out", gap }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{children}</span>
        {badge?.(isHovering)}
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {inner}
    </Link>
  );
}
