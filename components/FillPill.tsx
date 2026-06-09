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
      <span className="relative z-10" style={{ color: isHovering ? hoverTextColor : textColor, transition: "color 0.15s ease-in-out" }}>
        {children}
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
