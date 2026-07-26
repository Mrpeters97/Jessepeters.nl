"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

/* Page backgrounds per theme — mirror --bg in globals.css. The sweep panel is
   created before the switch, so it can't read the *next* theme's variable. */
const THEME_BG: Record<Theme, string> = { dark: "#0e0e0d", light: "#f7f6f2" };

/* Guards against double-toggles while a sweep is mid-flight (a second panel
   over the first would flip the theme twice and look glitchy). */
let sweepActive = false;

/**
 * The one theme-switch animation, used on every page: a full-viewport panel
 * in the NEW theme's background color sweeps right → left; `apply` (the
 * actual theme flip) runs at the midpoint, hidden behind the panel.
 *
 * Deliberately NOT the View Transitions API: that snapshots the whole
 * document, which goes blank past the GPU texture cap on the very tall
 * infinite-scroll pages (archive/work) and isn't supported in Safari at all.
 * A transform-only sweep is smooth at any page height, identical in every
 * browser, and needs no scroll- or snapshot-workarounds.
 */
async function sweepTheme(next: Theme, apply: () => void) {
  sweepActive = true;
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    width: "100%",
    zIndex: "9600",
    backgroundColor: THEME_BG[next],
    pointerEvents: "none",
    transform: "translateX(100%)",
    willChange: "transform",
  } as CSSStyleDeclaration);
  /* `inset: 0` (i.e. bottom:0) doesn't reliably reach the true bottom on
     mobile Safari — position:fixed is sized against the layout viewport,
     which excludes the collapsible toolbar, leaving a gap under the panel.
     An explicit height sidesteps that; 100dvh (the live, chrome-aware
     viewport height) is set after the 100vh fallback so unsupported
     browsers just keep the fallback instead of rejecting the assignment. */
  el.style.height = "100vh";
  el.style.height = "100dvh";
  document.body.appendChild(el);

  const slide = (from: string, to: string) =>
    el.animate([{ transform: from }, { transform: to }], {
      duration: 550,
      easing: "cubic-bezier(0.45, 0, 0.55, 1)",
      fill: "forwards",
    }).finished;

  try {
    await slide("translateX(100%)", "translateX(0%)");
    apply();
    /* two frames: let the new theme paint behind the panel before revealing */
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await slide("translateX(0%)", "translateX(-100%)");
  } finally {
    el.remove();
    sweepActive = false;
  }
}

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  function toggle() {
    if (sweepActive) return;
    const next = theme === "light" ? "dark" : "light";

    const applyTheme = () => {
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyTheme();
      return;
    }

    void sweepTheme(next, applyTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
