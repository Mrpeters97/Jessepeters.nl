"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { getDir, type Dir } from "@/components/useDirectionalFill";

/* clip that hides the magenta layer when coming/going from a given edge */
const hiddenClip: Record<Dir, string> = {
  right:  "inset(0 0 0 100%)",   // hide from right → reveal left→right
  left:   "inset(0 100% 0 0)",   // hide from left  → reveal right→left
  bottom: "inset(100% 0 0 0)",   // hide from bottom → reveal top→bottom
  top:    "inset(0 0 100% 0)",   // hide from top   → reveal bottom→top
};

const logoFont: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(14px, 1.5625vw, 30px)",
};

function HeaderLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  /* Touch devices can fire a synthetic mouseenter on tap without a matching
     mouseleave (a well-known mobile quirk) — since HeaderBar lives in the
     root layout and never remounts across route changes, that stray reveal
     stays clipped open forever, leaving the logo permanently magenta after
     navigating. The reveal is a desktop hover affordance, so it's skipped
     entirely wherever there's no fine pointer. */
  const canHoverRef = useRef(false);
  useEffect(() => {
    canHoverRef.current = window.matchMedia("(pointer: fine)").matches;
  }, []);

  const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!canHoverRef.current) return;
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
    if (!canHoverRef.current) return;
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = "clip-path 0.3s cubic-bezier(0.4, 0, 1, 1)";
    el.style.clipPath = hiddenClip[getDir(e)];
  };

  const inner = (
    <span className="relative inline-block">
      {/* Invisible spacer carrying the real accessible text and sizing the
          hit area. The always-visible base text lives one layer down, in
          DecorativeHeader — see the note on the header itself for why. */}
      <span style={{ opacity: 0 }}>{children}</span>
      {/* magenta hover reveal — the only visible content in this (unblended) layer */}
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
    style: logoFont,
    onMouseEnter,
    onMouseLeave,
  };

  if (external) {
    return <a href={href} {...sharedProps}>{inner}</a>;
  }
  return <Link href={href} {...sharedProps}>{inner}</Link>;
}

/**
 * Purely decorative, non-interactive copy rendered UNDERNEATH the real
 * header. It alone carries the difference blend, so the base logo/email
 * text stays readable against any backdrop (dark hero photos, light gaps,
 * colored project cards) without ever touching the magenta hover color.
 *
 * mix-blend-mode blends an element's ENTIRE rendered output (itself + all
 * descendants) against whatever is behind it — there's no way to exempt one
 * descendant (the magenta reveal span) from a blend set on an ancestor.
 * Difference of magenta against a light backdrop happens to compute to a
 * bright green, which is why the hover color used to flip to green in light
 * mode. Splitting into two layers keeps the blend on the always-inverting
 * base text only; the real magenta never enters a blended element at all.
 */
function DecorativeHeader({ isLight }: { isLight: boolean }) {
  const color = isLight ? "#ffffff" : "var(--white)";
  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between page-padding py-6 pointer-events-none"
      style={isLight ? { mixBlendMode: "difference" } : undefined}
    >
      <span className="font-medium tracking-tight" style={{ ...logoFont, color }}>Jesse Peters</span>
      <span className="font-medium tracking-tight" style={{ ...logoFont, color }}>hi@jessepeters.nl</span>
    </div>
  );
}

export default function HeaderBar() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <>
      <DecorativeHeader isLight={isLight} />
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between page-padding py-6">
        <HeaderLink href="/">Jesse Peters</HeaderLink>
        <HeaderLink href="mailto:hi@jessepeters.nl" external>
          hi@jessepeters.nl
        </HeaderLink>
      </header>
    </>
  );
}
