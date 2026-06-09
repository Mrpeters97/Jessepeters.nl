"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useOverHero } from "@/components/useOverHero";

const items = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/archive", label: "Archive" },
];

/*
 * Module-level flag so the slide-in entrance only plays once per browser session,
 * even if FloatingMenu remounts (HMR, React Strict Mode, etc.).
 * Set in useEffect so it's true before any user interaction is possible.
 */
let hasAnimatedIn = false;

export default function FloatingMenu() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);
  const overHero = useOverHero();

  /* Capture the animation state at mount time, then mark as done immediately */
  const shouldAnimate = useRef(!hasAnimatedIn);
  useEffect(() => {
    hasAnimatedIn = true;
  }, []);

  const isDark = theme === "dark";
  const useDarkStyle = isDark || overHero;

  const pillColor = useDarkStyle ? "#ffffff" : "#1a1a18";
  const inactiveText = useDarkStyle ? "#ffffff" : "#1a1a18";
  const activeText = useDarkStyle ? "#121212" : "#ffffff";

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
        /* Semi-opaque light fill (not a dark tint): keeps the pill consistently
           light even when it floats over a dark card — backdrop blur alone let
           dark content bleed through. */
        background: "rgba(255, 255, 255, 0.72)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.60)",
      };

  const activeHref = items.find(({ href }) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)
  )?.href;

  const pillTarget = hovered ?? activeHref;

  /*
   * Single, persistent pill. It never mounts/unmounts — it only translates
   * (left/width) to the active item. top/bottom are fixed, so it can never
   * jump vertically. This replaces the layoutId + AnimatePresence approach,
   * which measured ghost positions across mount/unmount and caused the pill
   * to fly in from above/below on navigation.
   */
  const ulRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const el = pillTarget ? itemRefs.current[pillTarget] : null;
    if (!el) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [pillTarget]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  /* Re-measure when the bar resizes (font load, viewport resize, etc.) */
  useEffect(() => {
    const ul = ulRef.current;
    if (!ul) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(ul);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <motion.nav
      initial={shouldAnimate.current ? { y: 80, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Primary"
    >
      <div
        className="relative rounded-full px-1.5"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          ...glassStyle,
        }}
      >
        <ul
          ref={ulRef}
          className="relative flex items-center h-10 gap-0.5"
          onMouseLeave={() => setHovered(null)}
        >
          {indicator && (
            <motion.span
              className="absolute rounded-full pointer-events-none"
              style={{ top: "20%", bottom: "20%", backgroundColor: pillColor }}
              initial={false}
              animate={{ left: indicator.left, width: indicator.width }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
          )}
          {items.map(({ href, label }) => {
            const isActive = href === pillTarget;
            return (
              <li
                key={href}
                ref={(el) => {
                  itemRefs.current[href] = el;
                }}
                className="relative flex items-center h-full"
                onMouseEnter={() => setHovered(href)}
              >
                <Link
                  href={href}
                  className="relative z-10 flex items-center h-full px-3"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: 1.5,
                    color: isActive ? activeText : inactiveText,
                    transition: "color 0.3s ease-in-out",
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
}
