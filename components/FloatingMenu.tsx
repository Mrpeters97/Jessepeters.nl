"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useOverHero } from "@/components/useOverHero";
import { glassStyle } from "@/components/glassStyle";

const items = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/moments", label: "Moments" },
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

  /* Touch devices can fire a synthetic mouseenter on tap (a well-known mobile
     quirk), arriving late relative to the actual navigation — the pill would
     then jump well after the new page is already showing. Hover-driven
     preview is a desktop-only affordance, so it's disabled wherever there's
     no fine pointer; the pill then only ever tracks the real active route. */
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    setCanHover(window.matchMedia("(pointer: fine)").matches);
  }, []);

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

  const activeHref = items.find(({ href }) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)
  )?.href;

  const pillTarget = (canHover ? hovered : null) ?? activeHref;

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
        className="relative rounded-full px-2"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          ...glassStyle(overHero, isDark),
        }}
      >
        <ul
          ref={ulRef}
          className="relative flex items-center h-12 gap-0.5"
          onMouseLeave={() => setHovered(null)}
        >
          {indicator && (
            <motion.span
              className="absolute rounded-full pointer-events-none"
              style={{ top: "18%", bottom: "18%", backgroundColor: pillColor }}
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
                onMouseEnter={canHover ? () => setHovered(href) : undefined}
              >
                <Link
                  href={href}
                  className="relative z-10 flex items-center h-full px-4"
                  style={{
                    fontSize: "13px",
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
