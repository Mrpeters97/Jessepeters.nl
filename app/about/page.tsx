"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import SayHiCluster from "@/components/SayHiCluster";
import RevealText from "@/components/RevealText";
import { usePageReady } from "@/hooks/usePageReady";

const PORTRAITS = [
  "/images/portrait/Jesse-01.jpg",
  "/images/portrait/Jesse-02.jpg",
  "/images/portrait/Jesse-03.jpg",
  "/images/portrait/Jesse-04.jpg",
  "/images/portrait/Jesse-05.jpg",
  "/images/portrait/Jesse-06.jpg",
  "/images/portrait/Jesse-07.jpg",
  "/images/portrait/Jesse-08.jpg",
];

/** Random order on every visit; guaranteed never to open on Jesse-01. */
function shufflePortraits() {
  const a = [...PORTRAITS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a[0] === PORTRAITS[0]) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

const SLIDE_MS = 5500;

function PortraitSlideshow() {
  // Shuffle client-side so the order is random and SSR/client don't mismatch.
  const [order, setOrder] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setOrder(shufflePortraits());
  }, []);

  // Re-armed on every index change → keeps the advance in sync with the ring,
  // which restarts its fill (key={index}) at the same moment.
  useEffect(() => {
    if (order.length === 0) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % order.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, order.length]);

  const nextSrc = order.length > 0 ? order[(index + 1) % order.length] : null;

  return (
    <div
      className="relative overflow-hidden rounded-[10px]"
      style={{ aspectRatio: "4/5", backgroundColor: "var(--bg-secondary)" }}
    >
      <AnimatePresence mode="sync">
        {order.length > 0 && (
          <motion.div
            key={order[index]}
            className="absolute"
            style={{ inset: "-1.5px" }}
            initial={{ opacity: 0, scale: 1.06, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={order[index]}
              alt="Jesse Peters"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next-up preview: a circular thumbnail of the upcoming photo, wrapped by a
          1px progress ring that fills over the slide duration. When it completes,
          the slideshow advances (the thumbnail's image becomes the main one) and
          the preview rolls forward to the next photo — same blur/scale reveal. */}
      {nextSrc && (
        <div
          className="absolute"
          style={{
            bottom: "clamp(12px, 1.6vw, 20px)",
            right: "clamp(12px, 1.6vw, 20px)",
            width: "clamp(40px, 7vw, 50px)",
            height: "clamp(40px, 7vw, 50px)",
            zIndex: 10,
            filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.4))",
          }}
        >
          <div
            className="absolute overflow-hidden"
            style={{ inset: "4.5px", borderRadius: "50%" }}
          >
            <AnimatePresence mode="sync">
              <motion.div
                key={nextSrc}
                className="absolute"
                style={{ inset: 0 }}
                initial={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(5px)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={nextSrc} alt="" fill sizes="50px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>

          <svg
            viewBox="0 0 40 40"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)", overflow: "visible" }}
          >
            <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
            <motion.circle
              key={index}
              cx="20"
              cy="20"
              r="19"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const ready = usePageReady();
  return (
    <>
      <section className="page-padding pt-28 pb-12 md:pt-36 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">

          {/* Left column: big intro + body text stacked closely */}
          <div
            className="lg:col-span-8 flex flex-col"
            style={{ gap: "clamp(16px, 2vw, 28px)" }}
          >
            <RevealText
              as="h1"
              className="type-intro"
              style={{ fontSize: "clamp(25px, 3.05vw, 46px)", maxWidth: "min(100%, 820px)" }}
              delay={0.1}
              duration={0.85}
            >
              I&apos;m Jesse Peters, a Product Designer at{" "}
              <a
                href="https://www.belsimpel.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-[6px] decoration-[2px] hover:opacity-70 transition-opacity"
              >
                Belsimpel.nl
              </a>
              , I create user experiences &amp; digital design solutions, helping
              companies and brands to grow towards their goals and dreams in the
              digital world.
            </RevealText>

            <div className="space-y-5 max-w-[680px]">
              <RevealText
                as="p"
                className="type-body-l"
                style={{ color: "var(--text-muted)" }}
                delay={0.15}
                stagger={0.045}
                duration={0.7}
              >
                With over five years of hands-on experience, I specialise in crafting
                sustainable solutions to tackle complex digital design challenges,
                helping clients achieve their goals and dreams. In my
                spare time, I find joy in capturing everyday life with one of my
                (analog) cameras. I also love to challenge myself both mentally
                and physically by training for Triathlons or Marathon races. These
                activities not only push me to bring out the best in myself but also
                help me maintain my physical and mental well-being.
              </RevealText>
              <RevealText
                as="p"
                className="type-body-l"
                style={{ color: "var(--text-muted)" }}
                delay={0.42}
                stagger={0.045}
                duration={0.7}
              >
                On here you will find a variety of Brand, UX & UI design related
                projects I worked on here, mixed with analog images that I captured
                during one of my trips and in everyday life. All the images that are
                shown are taken on a Canon-A1 or a Yashica T5, together with a
                variety of different film stocks, developed at a lab in Amsterdam,
                and scanned and edited by myself at home with Negative lab pro and
                Lightroom. Feel free to ask me anything about it. 🙂
              </RevealText>
            </div>
          </div>

          {/* Right column: image sticks and travels until the text ends.
              opacity-only entrance — a transform here would break sticky children. */}
          <motion.div
            className="lg:col-span-4 self-stretch"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lg:sticky" style={{ top: "96px" }}>
              <PortraitSlideshow />
            </div>
          </motion.div>
        </div>
      </section>

      <SayHiCluster />
    </>
  );
}
