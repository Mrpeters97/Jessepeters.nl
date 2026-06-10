"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { getLenis } from "@/components/SmoothScroll";
import PhotoSheet from "@/components/PhotoSheet";
import RevealText from "@/components/RevealText";
import { useReveal } from "@/hooks/useReveal";
import { useIsMobile } from "@/hooks/useIsMobile";
const BASE = Array.from({ length: 44 }, (_, i) => {
  const num = i + 1;
  return {
    id: `archive-${num}`,
    src: `/images/archive/Archive${num}.${num <= 42 ? "jpeg" : "jpg"}`,
    alt: `Archive ${num}`,
  };
});

const BASE_COLS = [
  BASE.filter((_, i) => i % 3 === 0),
  BASE.filter((_, i) => i % 3 === 1),
  BASE.filter((_, i) => i % 3 === 2),
];

export default function ArchivePage() {
  const [topRounds, setTopRounds] = useState(1);
  const [bottomRounds, setBottomRounds] = useState(2);
  const [photoSheet, setPhotoSheet] = useState<{ src: string; open: boolean }>({ src: "", open: false });
  const splitRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const didScroll = useRef(false);
  const isMobile = useIsMobile();

  // Before first paint: jump past the top round so the bottom rounds are in view.
  useLayoutEffect(() => {
    if (didScroll.current || !splitRef.current) return;
    didScroll.current = true;
    const top = splitRef.current.getBoundingClientRect().top + window.scrollY;
    const lenis = getLenis();
    if (lenis) {
      /* sync Lenis' internal targetScroll so its RAF loop doesn't override our jump */
      lenis.scrollTo(top, { immediate: true });
    } else {
      /* fallback: direct page load before Lenis initialises */
      document.documentElement.scrollTop = top;
    }
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
    <>
      <div style={{ marginTop: "-50px" }}>
        <div ref={topSentinelRef} className="h-px" />

        <div className="flex gap-3 md:gap-4 px-3 md:px-4">
          {BASE_COLS.map((base, ci) => (
            <ArchiveColumn
              key={ci}
              colIndex={ci}
              baseImages={base}
              topRounds={topRounds}
              bottomRounds={bottomRounds}
              offsetPx={ci === 1 && !isMobile ? -150 : 0}
              parallaxFactor={ci === 1 && !isMobile ? -0.07 : 0}
              mobileHidden={ci === 2}
              splitRef={ci === 0 ? splitRef : undefined}
              onSelect={(src) => setPhotoSheet({ src, open: true })}
            />
          ))}
        </div>

        <div ref={bottomSentinelRef} className="h-px" />
      </div>

      <PhotoSheet
        src={photoSheet.src}
        open={photoSheet.open}
        onClose={() => setPhotoSheet((prev) => ({ ...prev, open: false }))}
      />

      {/* Fixed "Archive" title — bottom-right, always visible */}
      <div
        className="pointer-events-none fixed hidden md:block"
        style={{ bottom: 0, right: "30px", zIndex: 30, mixBlendMode: "difference" }}
      >
        <RevealText
          as="span"
          className="overlay-title"
          style={{ fontSize: "clamp(48px, 9vw, 150px)", display: "inline-block" }}
        >
          Archive
        </RevealText>
      </div>
    </>
  );
}

function ArchiveColumn({
  colIndex,
  baseImages,
  topRounds,
  bottomRounds,
  offsetPx,
  parallaxFactor = 0,
  mobileHidden = false,
  splitRef,
  onSelect,
}: {
  colIndex: number;
  baseImages: { id: string; src: string; alt: string }[];
  topRounds: number;
  bottomRounds: number;
  offsetPx: number;
  parallaxFactor?: number;
  mobileHidden?: boolean;
  splitRef?: RefObject<HTMLDivElement | null>;
  onSelect: (src: string) => void;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => offsetPx + v * parallaxFactor);

  const topImages = Array.from({ length: topRounds }, (_, r) =>
    baseImages.map((img, bi) => ({ ...img, id: `top-r${r}-${img.id}`, bi }))
  ).flat();

  const bottomImages = Array.from({ length: bottomRounds }, (_, r) =>
    baseImages.map((img, bi) => ({ ...img, id: `bot-r${r}-${img.id}`, bi, eager: r === 0 }))
  ).flat();

  /* small, bounded cascade: items in a row drop in left→right, top→bottom; the
     %5 cap keeps the delay tiny for images revealed individually on scroll */
  const delayFor = (bi: number) => (bi % 5) * 0.07 + colIndex * 0.05;

  return (
    <motion.div
      className={`flex flex-col gap-3 md:gap-4 flex-1 pb-24${mobileHidden ? " hidden md:flex" : ""}`}
      style={{ y }}
    >
      {topImages.map((img) => (
        <ArchiveImage
          key={img.id}
          img={img}
          fromBelow={false}
          delay={delayFor(img.bi)}
          onSelect={onSelect}
        />
      ))}
      {splitRef !== undefined && <div ref={splitRef} />}
      {bottomImages.map((img) => (
        <ArchiveImage
          key={img.id}
          img={img}
          fromBelow={true}
          delay={delayFor(img.bi)}
          eager={img.eager}
          onSelect={onSelect}
        />
      ))}
    </motion.div>
  );
}

function ArchiveImage({
  img,
  fromBelow,
  delay,
  eager = false,
  onSelect,
}: {
  img: { id: string; src: string; alt: string };
  fromBelow: boolean;
  delay: number;
  eager?: boolean;
  onSelect: (src: string) => void;
}) {
  const { shown, onViewportEnter, viewport } = useReveal("0px 0px -22% 0px");

  return (
    <button
      onClick={() => onSelect(img.src)}
      className="relative w-full overflow-hidden rounded-[4px]"
      style={{ aspectRatio: "3 / 4", padding: 0, border: "none", display: "block" }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, y: fromBelow ? 70 : -70 }}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: fromBelow ? 70 : -70 }}
        onViewportEnter={onViewportEnter}
        viewport={viewport}
        transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(max-width: 768px) 33vw, 33vw"
          className="object-cover"
          loading={eager ? "eager" : "lazy"}
        />
      </motion.div>
    </button>
  );
}
