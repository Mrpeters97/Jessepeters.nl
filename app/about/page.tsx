"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import SayHiCluster from "@/components/SayHiCluster";
import RevealText from "@/components/RevealText";
import { usePageReady } from "@/hooks/usePageReady";
import { useIsMobile } from "@/hooks/useIsMobile";
import { portraits } from "@/lib/data";
import { shuffled } from "@/lib/shuffle";

/**
 * Per-portrait vertical focal point for object-cover crops.
 * Keeps Jesse's face in frame regardless of the container aspect ratio.
 * Values determined by visually inspecting each image.
 */
const PORTRAIT_FOCAL: Record<string, string> = {
  "/images/portrait/Jesse-01.jpg": "50% 10%",  // child on escalator
  "/images/portrait/Jesse-02.jpg": "50% 45%",  // harbour portrait
  "/images/portrait/Jesse-03.jpg": "50% 40%",  // IRONMAN finish, full body
  "/images/portrait/Jesse-04.jpg": "50% 60%",  // hiking close-up
  "/images/portrait/Jesse-05.jpg": "50% 10%",  // beach portrait
  "/images/portrait/Jesse-07.jpg": "50% 50%",  // FRYSMAN finish, full body
  "/images/portrait/Jesse-09.jpg": "50% 42%",  // close-up, mountain backdrop
};

/** Eligible to be the FIRST slide: looking straight at the camera, no
 *  sunglasses on, not a triathlon finish-line shot (02 harbour, 04 hiking
 *  cap, 09 mountain close-up — see PORTRAIT_FOCAL above for what each is). */
const OPENING_ELIGIBLE = new Set([
  "/images/portrait/Jesse-02.jpg",
  "/images/portrait/Jesse-04.jpg",
  "/images/portrait/Jesse-09.jpg",
]);

/** Random order on every visit; always opens on an eligible photo. */
function shufflePortraits() {
  const a = shuffled(portraits);
  if (!OPENING_ELIGIBLE.has(a[0])) {
    const swapIdx = a.findIndex((src) => OPENING_ELIGIBLE.has(src));
    if (swapIdx > 0) [a[0], a[swapIdx]] = [a[swapIdx], a[0]];
  }
  return a;
}

const SLIDE_MS = 5500;

const EXPERTISE = [
  "UX / UI Design",
  "SaaS Development",
  "Design Systems",
  "E-commerce",
  "Mobile First Design",
  "Product Strategy",
  "Brand Strategy",
  "Brand Design",
  "AI Engineering",
];

function PortraitSlideshow({ aspectClass = "aspect-[4/5]" }: { aspectClass?: string }) {
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
      className={`relative overflow-hidden ${aspectClass}`}
      style={{ backgroundColor: "var(--bg-secondary)" }}
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
              style={{ objectPosition: PORTRAIT_FOCAL[order[index]] ?? "50% 20%" }}
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
  const isMobile = useIsMobile();
  /* Reveal order: heading → photo (mobile only) → body paragraph 1 → body
     paragraph 2. Paragraph 1 waits out the photo on mobile (a much longer
     delay than on desktop), so paragraph 2's delay is defined relative to
     it — not as its own fixed value — so it always lands shortly after,
     never ahead of it regardless of breakpoint. */
  const bodyDelay1 = isMobile ? 1.25 : 0.15;
  const bodyDelay2 = bodyDelay1 + 0.27;
  return (
    <>
      <section className="page-padding pt-20 pb-0 md:pt-36 md:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">

          {/* Left column: heading → photo (mobile only) → body */}
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
                Belsimpel
              </a>
              . With over five years of experience, I create scalable user
              experiences &amp; digital SaaS solutions, helping brands grow
              towards their goals and dreams in the digital world.
            </RevealText>

            {/* Photo — visible only on mobile, sits between heading and body text */}
            <motion.div
              className="lg:hidden"
              initial={{ opacity: 0, y: 24 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.75, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <PortraitSlideshow aspectClass="aspect-[4/3]" />
            </motion.div>

            <div className="space-y-5 max-w-[680px]">
              <RevealText
                as="p"
                className="type-body-l"
                style={{ color: "var(--text-muted)" }}
                delay={bodyDelay1}
                stagger={0.045}
                duration={0.7}
              >
                When I&apos;m not designing, I am always looking for new ways to
                challenge myself mentally and physically. You can often find me
                training for Triathlons, chasing a new marathon PB, or exploring
                nature on the bike. Along the way, I always carry a camera, whether
                analog or digital, to document the moments that inspire me.
              </RevealText>
              <RevealText
                as="p"
                className="type-body-l"
                style={{ color: "var(--text-muted)" }}
                delay={bodyDelay2}
                stagger={0.045}
                duration={0.7}
                forceLoad
              >
                On this portfolio, you will find a variety of Brand, UX, and UI
                design projects I&apos;ve worked on, mixed with a collection of
                photography I&apos;ve captured during my travels and everyday life.
                Have a look around, and feel free to ask me anything! 🙂
              </RevealText>
            </div>

            <motion.div
              className="flex flex-col"
              style={{ gap: "clamp(10px, 1.4vw, 16px)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.6, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(12px, 1vw, 14px)",
                  fontWeight: 400,
                }}
              >
                Expertise
              </span>
              <div
                className="flex flex-wrap"
                style={{ gap: "clamp(8px, 1vw, 12px)", maxWidth: "min(100%, 780px)" }}
              >
                {EXPERTISE.map((item) => (
                  <span
                    key={item}
                    className="rounded-full"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(13px, 1vw, 15px)",
                      fontWeight: 400,
                      padding: "clamp(8px, 1vw, 10px) clamp(10px, 1.1vw, 14px)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column — desktop only.
              Outer wrapper: opacity-only (transform on a sticky parent breaks it).
              Inner slideshow container gets the y-reveal instead. */}
          <div className="hidden lg:block lg:col-span-4 self-stretch">
            <div className="lg:sticky" style={{ top: "96px" }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.75, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <PortraitSlideshow />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <SayHiCluster topClass="pt-10 md:pt-24" />
    </>
  );
}
