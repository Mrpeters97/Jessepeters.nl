"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { usePageReady } from "@/hooks/usePageReady";
import { useHeroScroll } from "@/hooks/useHeroScroll";
import { useIdleScrollHint } from "@/hooks/useIdleScrollHint";
import { useTheme } from "@/components/ThemeProvider";
import SayHiCluster from "@/components/SayHiCluster";
import FillPill from "@/components/FillPill";
import { HomeGrid } from "@/components/WorkGrid";
import RevealText from "@/components/RevealText";
import { portraits, projects } from "@/lib/data";
import { shuffled } from "@/lib/shuffle";

export default function HomePage() {
  const ready = usePageReady();
  const { theme } = useTheme();
  /* Light mode: blend the hero text against the photo strip with mix-blend-mode
     so it inverts (light over dark photos, dark over light gaps). The source is
     white; the section carries `isolation: isolate` so the blend group never
     switches when the section's scroll opacity drops below 1 (that switch was
     the "suddenly white" flicker). Dark mode keeps plain light text. */
  const isLight = theme === "light";
  const heroColor = isLight ? "#ffffff" : "#f9f9f9";
  const heroBlend = isLight ? ({ mixBlendMode: "difference" } as const) : undefined;
  const { scrollY, heroClip, heroOpacity, heroTextScale } = useHeroScroll();

  /* Scroll indicator: fades in after the hero text has animated, fades out on scroll — same mechanic as the project detail page */
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const indicatorScrollOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setIndicatorVisible(true), 200);
    return () => clearTimeout(t);
  }, [ready]);

  useIdleScrollHint(ready);

  return (
    <>
      {/* Fixed hero — stays behind while content scrolls over */}
      <motion.section
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          zIndex: 1,
          overflow: "hidden",
          backgroundColor: "var(--bg)",
          clipPath: heroClip,
          opacity: heroOpacity,
        }}
      >
        <motion.div style={{ position: "absolute", inset: 0, scale: heroTextScale }}>
          <HeroCarousel ready={ready} />
        </motion.div>
      </motion.section>

      {/* Hero text — its OWN fixed layer, not inside the opacity-animated section.
          The scroll fade (opacity) and the mix-blend-mode live on the SAME element,
          so the blend always targets the photos behind it and never switches groups
          as it fades (that ancestor-opacity switch was the "suddenly white" bug). */}
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
          opacity: heroOpacity,
          scale: heroTextScale,
          ...heroBlend,
        }}
      >
        <RevealText
          as="h1"
          className="type-hero"
          style={{ fontSize: "clamp(52px, 9.5vw, 138px)", lineHeight: 1.05, color: heroColor }}
          delay={0.8}
        >
          Jesse Peters
        </RevealText>
        <RevealText
          as="p"
          className="-mt-1 md:-mt-4 type-sub"
          style={{ color: heroColor, fontSize: "clamp(17px, 2.5vw, 43px)" }}
          delay={1.18}
        >
          A Visual & Digital Designer
        </RevealText>
      </motion.div>

      {/* Spacer — smaller than 100vh so content appears sooner on scroll */}
      <div style={{ height: "100vh" }} aria-hidden />

      {/* Scroll indicator — fades in after hero, fades out on scroll, stays above floating nav.
          Same mix-blend-mode treatment as the hero text: color + blend live on the SAME
          element as the opacity fade, so it inverts correctly against the photo strip in
          light mode instead of staying hardcoded white. */}
      <motion.div
        aria-hidden
        animate={{ opacity: indicatorVisible ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          bottom: "calc(1rem + env(safe-area-inset-bottom) + 76px)",
          left: "50%",
          x: "-50%",
          zIndex: 10,
          pointerEvents: "none",
          color: heroColor,
          ...heroBlend,
        }}
      >
        <motion.div style={{ opacity: indicatorScrollOpacity }}>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.2 }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeOpacity="0.7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content that scrolls over the fixed hero */}
      <div
        className="relative"
        style={{ zIndex: 2, backgroundColor: "var(--bg)" }}
      >
        {/* Asymmetric featured grid */}
        <section className="pt-4 md:pt-8" style={{ paddingInline: "clamp(16px, 4vw, 30px)" }}>
          <HomeGrid />
        </section>

        {/* See all my work CTA */}
        <section className="page-padding pt-6 md:pt-10">
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative inline-block w-full md:w-auto">
              <FillPill
                href="/work"
                className="pill pill-ghost pill-lg w-full md:w-auto md:min-w-[50vw]"
                style={{
                  fontSize: "clamp(28px, 5.5vw, 120px)",
                  height: "clamp(64px, 10vw, 160px)",
                  paddingInline: "clamp(20px, 2.5vw, 48px)",
                }}
                gap="clamp(12px, 1.6vw, 32px)"
                cursorBlend
                badge={(isHovering, colorTransitionCss) => (
                  <span
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: "clamp(32px, 3.4vw, 64px)",
                      height: "clamp(32px, 3.4vw, 64px)",
                      border: `1.5px solid ${isHovering ? "var(--bg)" : "var(--white)"}`,
                      color: isHovering ? "var(--bg)" : "var(--white)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(13px, 1.3vw, 24px)",
                      fontWeight: 500,
                      /* .pill-lg sets letter-spacing:-0.02em, which this
                         badge otherwise inherits — cramping "12" together. */
                      letterSpacing: "normal",
                      /* Same delayed transition as the label text (not its
                         own separate/faster one) — otherwise the badge and
                         "See all my work" visibly change color at different
                         moments. */
                      transition: `${colorTransitionCss}, border-color ${colorTransitionCss.replace("color ", "")}`,
                    }}
                  >
                    {projects.length}
                  </span>
                )}
              >
                See all my work
              </FillPill>
            </div>
          </motion.div>
        </section>

        <SayHiCluster />
      </div>
    </>
  );
}

function HeroSlide({ src, index, ready }: { src: string; index: number; ready: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const enter = ready && loaded;
  return (
    <motion.div
      initial={{ borderRadius: 0 }}
      whileHover={{ borderRadius: 20, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      style={{
        flexShrink: 0,
        width: "clamp(220px, 26vw, 500px)",
        aspectRatio: "4 / 5",
        backgroundColor: "var(--bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: "50%" }}
        animate={
          enter
            ? {
                opacity: 1,
                y: "0%",
                transition: { duration: 0.85, delay: (index % 6) * 0.08, ease: [0.22, 1, 0.36, 1] },
              }
            : { opacity: 0, y: "50%" }
        }
        whileHover={{ scale: 1.02, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        style={{ position: "absolute", inset: -1 }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 220px, 500px"
          className="object-cover"
          aria-hidden
          onLoad={() => setLoaded(true)}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.42) 100%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroCarousel({ ready }: { ready: boolean }) {
  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => { setOrder(shuffled(portraits)); }, []);
  const base = order.length > 0 ? order : portraits;
  const doubled = [...base, ...base];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(10px, 2.604vw, 50px)",
          paddingRight: "clamp(10px, 2.604vw, 50px)",
          animationName: "marquee",
          animationDuration: "90s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          willChange: "transform",
        }}
      >
        {doubled.map((src, i) => (
          <HeroSlide key={i} src={src} index={i} ready={ready} />
        ))}
      </div>
    </div>
  );
}

