"use client";

import { useEffect, useState } from "react";
import { useScroll, useTransform } from "framer-motion";

/**
 * Shared hero scroll choreography (home + project detail): over the first
 * viewport of scrolling the fixed 100vh hero clips inward with rounding,
 * fades out, and its text scales down slightly.
 */
export function useHeroScroll() {
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(1000);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const heroClip = useTransform(
    scrollY,
    [0, vh],
    ["inset(0% round 0px)", "inset(7.5% round 24px)"]
  );
  const heroOpacity = useTransform(scrollY, [0, vh], [1, 0]);
  const heroTextScale = useTransform(scrollY, [0, vh], [1, 0.85]);

  return { scrollY, vh, heroClip, heroOpacity, heroTextScale };
}
