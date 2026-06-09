"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useDirectionalFill } from "@/components/useDirectionalFill";
import { useOverHero } from "@/components/useOverHero";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { controls, isHovering, onMouseEnter, onMouseLeave } = useDirectionalFill();
  const overHero = useOverHero();

  const isDark = theme === "dark";
  const useDarkStyle = isDark || overHero;

  const fillColor = useDarkStyle ? "#ffffff" : "#1a1a18";
  const restIconColor = useDarkStyle ? "#ffffff" : "#1a1a18";
  const hoverIconColor = useDarkStyle ? "#1a1a18" : "#ffffff";

  const glassStyle = overHero
    ? {
        background: "rgba(14, 14, 13, 0.58)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      }
    : isDark
    ? {
        background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.13)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
      }
    : {
        /* Match FloatingMenu: light fill so the toggle stays light over dark
           content instead of picking up the background via backdrop blur. */
        background: "rgba(255, 255, 255, 0.72)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.60)",
      };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ flexShrink: 0 }}
    >
      <motion.button
        onClick={toggle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="relative flex items-center justify-center rounded-full overflow-hidden"
        style={{
          width: "40px",
          height: "40px",
          WebkitAppearance: "none",
          appearance: "none",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          ...glassStyle,
        }}
      >
        <motion.span
          initial={{ x: "0%", y: "110%" }}
          animate={controls}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ backgroundColor: fillColor }}
        />
        <motion.span
          animate={{ color: isHovering ? hoverIconColor : restIconColor }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      </motion.button>
    </motion.div>
  );
}
