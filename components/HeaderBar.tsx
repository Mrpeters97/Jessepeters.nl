"use client";

import Link from "next/link";
import { useRef } from "react";
import type React from "react";
import { useTheme } from "@/components/ThemeProvider";

type Dir = "right" | "left" | "bottom" | "top";

function getDir(e: React.MouseEvent<HTMLElement>): Dir {
  const rect = e.currentTarget.getBoundingClientRect();
  const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
  const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
  const angle = Math.atan2(ny, nx) * (180 / Math.PI);
  if (angle > -45 && angle <= 45)  return "right";
  if (angle > 45  && angle <= 135) return "bottom";
  if (angle > 135 || angle <= -135) return "left";
  return "top";
}

/* clip that hides the magenta layer when coming/going from a given edge */
const hiddenClip: Record<Dir, string> = {
  right:  "inset(0 0 0 100%)",   // hide from right → reveal left→right
  left:   "inset(0 100% 0 0)",   // hide from left  → reveal right→left
  bottom: "inset(100% 0 0 0)",   // hide from bottom → reveal top→bottom
  top:    "inset(0 0 100% 0)",   // hide from top   → reveal bottom→top
};

function HeaderLink({
  href,
  external = false,
  children,
  isLight = false,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  isLight?: boolean;
}) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const el = overlayRef.current;
    if (!el) return;
    /* 1. snap to the hidden starting clip with no transition */
    el.style.transition = "none";
    el.style.clipPath = hiddenClip[getDir(e)];
    /* 2. force a synchronous layout flush so the browser paints step 1 first */
    void el.getBoundingClientRect();
    /* 3. now animate to fully revealed */
    el.style.transition = "clip-path 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.clipPath = "inset(0 0 0 0)";
  };

  const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = "clip-path 0.3s cubic-bezier(0.4, 0, 1, 1)";
    el.style.clipPath = hiddenClip[getDir(e)];
  };

  const inner = (
    <span className="relative inline-block">
      {/* base — white in light mode so the header's difference blend (set on the
          <header> element itself) inverts it against whatever scrolls behind it. */}
      <span style={{ color: isLight ? "#ffffff" : "var(--white)" }}>{children}</span>
      {/* magenta overlay: same text, same position, revealed by clip-path mask */}
      <span
        ref={overlayRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          color: "var(--accent-magenta)",
          clipPath: "inset(0 100% 0 0)",
        }}
      >
        {children}
      </span>
    </span>
  );

  const sharedProps = {
    /* py-3/-my-3: bigger tap target without changing the visual layout */
    className: "font-medium tracking-tight py-3 -my-3",
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(14px, 1.5625vw, 30px)",
    } as React.CSSProperties,
    onMouseEnter,
    onMouseLeave,
  };

  if (external) {
    return <a href={href} {...sharedProps}>{inner}</a>;
  }
  return <Link href={href} {...sharedProps}>{inner}</Link>;
}

export default function HeaderBar() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between page-padding py-6"
      /* Difference must live on this fixed (stacking-context) element to blend
         against the page; on an inner span it has no backdrop and renders raw. */
      style={isLight ? { mixBlendMode: "difference" } : undefined}
    >
      <HeaderLink href="/" isLight={isLight}>Jesse Peters</HeaderLink>
      <HeaderLink href="mailto:hi@jessepeters.nl" external isLight={isLight}>
        hi@jessepeters.nl
      </HeaderLink>
    </header>
  );
}
