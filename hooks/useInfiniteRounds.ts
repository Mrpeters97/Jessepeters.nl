"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { getLenis } from "@/components/SmoothScroll";

/**
 * Bidirectional infinite scroll (work + archive): rounds of identical content
 * are appended at the bottom and prepended at the top (with scroll
 * compensation), and the page starts jumped to the split point so the first
 * top round is hidden above the viewport.
 */
export function useInfiniteRounds() {
  const [topRounds, setTopRounds] = useState(1);
  const [bottomRounds, setBottomRounds] = useState(2);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const didScroll = useRef(false);

  // Before first paint: jump to the split point so the top round is hidden above.
  // Use Lenis' own scrollTo so its RAF loop doesn't override the jump on re-navigation.
  useLayoutEffect(() => {
    if (didScroll.current || !splitRef.current) return;
    didScroll.current = true;
    const top = splitRef.current.getBoundingClientRect().top + window.scrollY;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo(0, top);
  }, []);

  // Bottom sentinel → append a round
  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setBottomRounds((r) => r + 1); },
      { rootMargin: "800px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // Top sentinel → prepend a round, compensate scroll so the viewport doesn't jump
  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const scrollBefore = window.scrollY;
        const heightBefore = document.body.scrollHeight;
        flushSync(() => setTopRounds((r) => r + 1));
        window.scrollTo(0, scrollBefore + (document.body.scrollHeight - heightBefore));
      },
      { rootMargin: "800px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return { topRounds, bottomRounds, splitRef, topSentinelRef, bottomSentinelRef };
}
