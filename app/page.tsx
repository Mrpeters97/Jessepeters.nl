"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePageReady } from "@/hooks/usePageReady";
import { useTheme } from "@/components/ThemeProvider";
import SayHiCluster from "@/components/SayHiCluster";
import FillPill from "@/components/FillPill";
import { HomeGrid } from "@/components/WorkGrid";
import RevealText from "@/components/RevealText";
import { portraits } from "@/lib/data";

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
          className="-mt-2 md:-mt-4 type-sub"
          style={{ color: heroColor, fontSize: "clamp(17px, 2.5vw, 43px)" }}
          delay={1.18}
        >
          A Visual & Digital Designer
        </RevealText>
      </motion.div>

      {/* Spacer — smaller than 100vh so content appears sooner on scroll */}
      <div style={{ height: "100vh" }} aria-hidden />

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
            <FillPill
              href="/work"
              className="pill pill-ghost pill-lg w-full md:w-[50vw]"
              style={{
                fontSize: "clamp(28px, 5.5vw, 120px)",
                height: "clamp(64px, 10vw, 160px)",
                paddingInline: "clamp(20px, 2.5vw, 48px)",
              }}
            >
              See all my work
            </FillPill>
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function HeroCarousel({ ready }: { ready: boolean }) {
  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => { setOrder(shuffle(portraits)); }, []);
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

