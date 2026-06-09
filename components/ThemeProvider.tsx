"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

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
    if (doc.startViewTransition) {
      doc.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
