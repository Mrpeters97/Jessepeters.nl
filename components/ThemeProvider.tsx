"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

/* Page backgrounds per theme — mirror --bg in globals.css. The sweep panel is
   created before the switch, so it can't read the *next* theme's variable. */
const THEME_BG: Record<Theme, string> = { dark: "#0e0e0d", light: "#f7f6f2" };

/**
 * Right → left full-viewport sweep in the next theme's background color;
 * `apply` (the actual theme flip) runs at the midpoint, hidden behind the
 * panel. Uses the Web Animations API with transform only — no snapshots, no
 * layout work — so it stays smooth regardless of page height.
 */
function sweepTheme(next: Theme, apply: () => void) {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9600",
    backgroundColor: THEME_BG[next],
    pointerEvents: "none",
    transform: "translateX(100%)",
    willChange: "transform",
  } as CSSStyleDeclaration);
  document.body.appendChild(el);

  const cover = el.animate(
    [{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }],
    { duration: 450, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" }
  );
  cover.onfinish = () => {
    apply();
    /* two frames: let the new theme paint behind the panel before revealing */
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const reveal = el.animate(
          [{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }],
          { duration: 450, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" }
        );
        reveal.onfinish = () => el.remove();
      })
    );
  };
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
    const next = theme === "light" ? "dark" : "light";

    const applyTheme = () => {
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };

    const doc = document as Document & { startViewTransition?: (fn: () => void) => void };

    /* Short pages: native View Transition wipe (globals.css theme-wipe).
       Tall pages (archive/work infinite scroll): the VTA snapshot of the
       whole document exceeds the GPU texture cap and renders blank, and
       freezing the page to shrink it janks — so those get a lightweight
       sweep instead: a panel in the NEW theme's background color slides
       right → left across the viewport; the theme flips behind it at the
       midpoint. Transform-only, so it stays smooth on any page height.
       Browsers without VTA (Safari) get the sweep as well. */
    const tall = document.documentElement.scrollHeight > 8000;
    if (doc.startViewTransition && !tall) {
      doc.startViewTransition(applyTheme);
    } else {
      sweepTheme(next, applyTheme);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
