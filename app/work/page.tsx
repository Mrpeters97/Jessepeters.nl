"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import WorkGrid from "@/components/WorkGrid";
import RevealText from "@/components/RevealText";
import { getLenis } from "@/components/SmoothScroll";

const G = "20px";

export default function WorkPage() {
  const [topRounds, setTopRounds] = useState(1);
  const [bottomRounds, setBottomRounds] = useState(2);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const didScroll = useRef(false);

  // Before first paint: jump to the split point so the 1 top round is hidden above.
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

  // Top sentinel → prepend a round, compensate scroll so viewport doesn't jump
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

  return (
    <div style={{ paddingTop: G }}>
      <div ref={topSentinelRef} className="h-px" />

      {Array.from({ length: topRounds }, (_, r) => (
        <WorkRound key={`top-${r}`} />
      ))}
      <div ref={splitRef} />
      {Array.from({ length: bottomRounds }, (_, r) => (
        <WorkRound key={`bot-${r}`} />
      ))}

      <div ref={bottomSentinelRef} className="h-px" />

      {/* Fixed "Work" title — bottom-right, always visible */}
      <div
        className="pointer-events-none fixed hidden md:block"
        style={{ bottom: 0, right: "30px", zIndex: 30, mixBlendMode: "difference" }}
      >
        <RevealText
          as="span"
          className="overlay-title"
          style={{ fontSize: "clamp(48px, 9vw, 150px)", display: "inline-block" }}
        >
          Work
        </RevealText>
      </div>
    </div>
  );
}

function WorkRound() {
  return (
    <div style={{ paddingLeft: G, paddingRight: G, paddingBottom: G }}>
      <WorkGrid />
    </div>
  );
}
