"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function useOverHero() {
  const pathname = usePathname();
  const hasHero =
    pathname === "/" ||
    (pathname.startsWith("/work/") && pathname !== "/work");

  const [overHero, setOverHero] = useState(hasHero);

  useEffect(() => {
    if (!hasHero) {
      setOverHero(false);
      return;
    }
    const check = () =>
      setOverHero(window.scrollY < window.innerHeight * 0.9);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [hasHero]);

  return overHero;
}
