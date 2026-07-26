"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { Project } from "@/lib/data";
import SayHiCluster from "@/components/SayHiCluster";
import RevealText from "@/components/RevealText";
import FillPill from "@/components/FillPill";
import { CardOverlay } from "@/components/ProjectCard";
import CoverImage from "@/components/CoverImage";
import { glassStyle } from "@/components/glassStyle";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePageReady } from "@/hooks/usePageReady";
import { useHeroScroll } from "@/hooks/useHeroScroll";
import { useIdleScrollHint } from "@/hooks/useIdleScrollHint";

const G = "20px";

type Props = {
  project: Project;
  nextProject: Project;
  nextNextProject: Project;
};

export default function ProjectDetailClient({ project, nextProject, nextNextProject }: Props) {
  const heroImage = project.images?.[0] ?? project.thumbnail;
  const gridImages = project.images?.slice(1) ?? [];
  const gridRows = buildGridRows(gridImages);
  const responsibilityChips = project.responsibilities
    ? project.responsibilities.split(",").map((s) => s.trim())
    : project.categories;

  const { scrollY, vh, heroClip, heroOpacity, heroTextScale } = useHeroScroll();
  const isMobile = useIsMobile();
  const ready = usePageReady();

  /* Scroll indicator: fades in after the hero text has animated, fades out on scroll */
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const indicatorScrollOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setIndicatorVisible(true), 200);
    return () => clearTimeout(t);
  }, [ready]);

  useIdleScrollHint(ready);

  /* The footer slides up and over the (unchanged) image grid, which fades out
     beneath it — same "content over a fading layer" mechanic as the hero, done
     with a scroll-linked transform (sticky on a taller-than-viewport grid is
     unreliable). As the footer rises one viewport, the grid translates down by
     the same amount so its last screen appears held in place while it fades.
     Progress: 0 = footer top at viewport bottom (grid fully visible);
               1 = footer top at viewport top   (footer fully covers grid). */
  const footerContentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: footerProgress } = useScroll({
    target: footerContentRef,
    offset: ["start end", "start start"],
  });
  const gridHold = useTransform(footerProgress, [0, 1], [0, vh]);
  const gridFade = useTransform(footerProgress, [0, 1], [1, 0]);


  return (
    <>
      {/* Fixed hero — shrinks and fades on scroll, identical to homepage */}
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
        <Image
          src={heroImage}
          alt={project.title}
          fill
          priority
          /* This hero is pinned to 100vh; on a portrait phone that's much
             taller (relative to width) than the landscape project photos,
             so object-cover has to scale the source well beyond 100vw to
             fully cover the height. Hinting only "100vw" under-requests
             resolution for that — visibly pixelated. max(100vw, 100vh)
             covers both orientations (portrait: height-driven, landscape
             desktop: width-driven). */
          sizes="max(100vw, 100vh)"
          className="object-cover"
          unoptimized={heroImage.endsWith(".gif")}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14, 14, 13, 0.5)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "clamp(24px, 4vw, 60px)",
            gap: "clamp(8px, 1.2vw, 16px)",
            scale: heroTextScale,
          }}
        >
          {/* always white — over image */}
          <RevealText
            as="h1"
            className="type-hero"
            style={{ color: "#ffffff", fontSize: "clamp(40px, 7vw, 120px)", lineHeight: 1.05 }}
            delay={0.15}
          >
            {project.title}
          </RevealText>

          {/* always white — over image */}
          <motion.div
            className="flex flex-wrap justify-center"
            style={{ gap: "clamp(8px, 1vw, 12px)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{
              /* Opacity settles fast so the glass fill/blur is fully
                 rendered almost immediately once the reveal starts, instead
                 of sitting at a barely-visible low opacity for most of a
                 slower transition — the slide keeps its own longer duration
                 for the motion. */
              opacity: { duration: 0.15, delay: 1 },
              y: { duration: 0.6, delay: 1, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            {responsibilityChips.map((item) => (
              <span
                key={item}
                className="rounded-full"
                style={{
                  ...glassStyle(true, true),
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  /* Without its own layer, the blur sits under the parent's
                     opacity/y transform and some browsers only (re)composite
                     it once that transition settles, instead of live during
                     the fade — it "pops in" after the animation finishes.
                     Forcing a dedicated layer up front keeps it live throughout. */
                  transform: "translateZ(0)",
                  willChange: "backdrop-filter",
                  color: "#ffffff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(13px, 1vw, 15px)",
                  fontWeight: 400,
                  padding: "clamp(8px, 1vw, 10px) clamp(14px, 1.6vw, 20px)",
                }}
              >
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Spacer — content starts right below the 100vh hero */}
      <div style={{ height: "100vh" }} aria-hidden />

      {/* Scroll indicator — fades in after hero, fades out on scroll, stays above floating nav */}
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
                stroke="rgba(255,255,255,0.70)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scrolling content layer */}
      <div
        className="relative"
        style={{
          zIndex: 2,
          backgroundColor: "var(--bg)",
        }}
      >
        {/* Project info */}
        <section
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{
            padding: isMobile ? "40px 24px 24px" : `clamp(48px, 6vw, 96px) 30px`,
            gap: isMobile ? "22px" : "clamp(32px, 5vw, 80px)",
            minHeight: isMobile ? undefined : "70vh",
          }}
        >
          <RevealText as="p" className="type-intro" stagger={0.06} duration={0.75}>
            {project.description}
          </RevealText>

          <dl
            style={{
              display: "flex",
              width: "100%",
              maxWidth: "745px",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "clamp(16px, 3vw, 32px)",
            }}
          >
            {(() => {
              const items = [
                { label: "Client", value: project.client },
                project.employer ? { label: "Employer", value: project.employer } : null,
                project.format ? { label: "Format", value: project.format } : null,
                (project.responsibilities || project.categories.length > 0)
                  ? { label: "Responsibilities", value: project.responsibilities ?? project.categories.join(", ") }
                  : null,
                project.results ? { label: "Results", value: project.results } : null,
              ].filter(Boolean) as { label: string; value: string }[];

              return items.map((item, i) => (
                <MetaRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  index={i}
                  isFirst={i === 0}
                  isLast={i === items.length - 1}
                />
              ));
            })()}

            {project.liveUrl && (
              <FillPill
                href={project.liveUrl}
                external
                reverse
                fillColor="var(--white)"
                textColor="var(--bg)"
                hoverTextColor="var(--white)"
                className="pill pill-ghost"
                style={{
                  height: "clamp(56px, 6vw, 74px)",
                  paddingInline: "clamp(28px, 3vw, 48px)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(18px, 1.8vw, 26px)",
                  fontWeight: 600,
                }}
              >
                Visit live site
              </FillPill>
            )}
          </dl>
        </section>

        {/* Image grid — alternating 2-up / full-width rows, filled 1..N in order.
            A row left with a single image spans full width; empty rows are omitted.
            Held in place + faded by gridHold/gridFade while the footer slides over it
            (desktop only — on mobile that continuous scroll-linked transform on a
            section full of images was too heavy to stay smooth, showing up as
            jitter, so the grid just scrolls away normally there instead). */}
        {gridImages.length > 0 && (
          <motion.section
            style={{
              position: "relative",
              zIndex: 1,
              y: isMobile ? 0 : gridHold,
              opacity: isMobile ? 1 : gridFade,
              paddingInline: G,
              paddingBottom: G,
              display: "flex",
              flexDirection: "column",
              gap: G,
            }}
          >
            {isMobile
              ? /* Mobile: every image full-width in its natural ratio, stacked */
                gridImages.map((src, i) => <StackImage key={i} src={src} />)
              : gridRows.map((row, ri) =>
                  row.full ? (
                    <ProjectImage key={ri} src={row.images[0]} />
                  ) : (
                    <div
                      key={ri}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: G,
                        alignItems: "start",
                      }}
                    >
                      <ProjectImage src={row.images[0]} delay={0} />
                      <ProjectImage src={row.images[1]} delay={0.15} />
                    </div>
                  )
                )}
          </motion.section>
        )}

        {/* Footer — slides up over the pinned, fading grid */}
        <div
          ref={footerContentRef}
          style={{ position: "relative", zIndex: 2, backgroundColor: "var(--bg)" }}
        >
          <section style={{ paddingInline: G, paddingBottom: G, paddingTop: "clamp(64px, 8vw, 120px)" }}>
            <p
              style={{
                color: "var(--white)",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 3.5vw, 56px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                marginBottom: "16px",
              }}
            >
              Next projects
            </p>

            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: G }}>
                <NextProjectCard project={nextProject} delay={0} mobile />
                <NextProjectCard project={nextNextProject} delay={0.1} mobile />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: G }}>
                <NextProjectCard project={nextProject} delay={0} />
                <NextProjectCard project={nextNextProject} delay={0.1} />
              </div>
            )}
          </section>

          <SayHiCluster />
        </div>
      </div>
    </>
  );
}

function NextProjectCard({
  project,
  delay,
  mobile = false,
}: {
  project: Project;
  delay: number;
  mobile?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        style={{ overflow: "hidden", borderRadius: 0 }}
        whileHover={{ borderRadius: 10 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={`/work/${project.slug}`}
          className="group relative block overflow-hidden"
          style={
            mobile
              ? { aspectRatio: "4 / 3", width: "100%", backgroundColor: "var(--bg)" }
              : { height: "clamp(320px, 55vh, 700px)", backgroundColor: "var(--bg)" }
          }
        >
          <CoverImage
            src={project.thumbnail}
            alt={project.title}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <CardOverlay project={project} compact />
        </Link>
      </motion.div>
    </motion.div>
  );
}

type GridRow = { images: string[]; full: boolean; tall: boolean };

/** Fill images 1..N into an alternating 2-up / full-width row pattern (up to 11). */
function buildGridRows(images: string[]): GridRow[] {
  const pattern = [2, 1, 2, 1, 2, 1, 2];
  const rows: GridRow[] = [];
  let i = 0;
  for (const cols of pattern) {
    if (i >= images.length) break;
    const slice = images.slice(i, i + cols);
    i += slice.length;
    if (slice.length === 2) rows.push({ images: slice, full: false, tall: false });
    else rows.push({ images: slice, full: true, tall: cols === 1 });
  }

  /* If the last two rows are each a lone full-width image, merge them into a
     50/50 pair so e.g. images 10 + 11 land on one row instead of two singles. */
  const n = rows.length;
  if (
    n >= 2 &&
    rows[n - 1].full && rows[n - 1].images.length === 1 &&
    rows[n - 2].full && rows[n - 2].images.length === 1
  ) {
    const b = rows.pop()!;
    const a = rows.pop()!;
    rows.push({ images: [a.images[0], b.images[0]], full: false, tall: false });
  }

  return rows;
}

/** Grid image (full-width or 2-up row): sized to the image's own aspect
 *  ratio, so it's never cropped — the row grows to fit it instead. */
function ProjectImage({ src, delay = 0 }: { src: string; delay?: number }) {
  const isGif = src.toLowerCase().endsWith(".gif");
  const [ratio, setRatio] = useState(1.4); // sensible reservation until it loads

  return (
    <motion.div
      className="relative w-full self-start overflow-hidden"
      style={{ aspectRatio: String(ratio) }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-18%" }}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        unoptimized={isGif}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth) setRatio(img.naturalWidth / img.naturalHeight);
        }}
      />
    </motion.div>
  );
}

/** Mobile grid image: full-width, kept in its natural aspect ratio (no crop). */
function StackImage({ src }: { src: string }) {
  const isGif = src.toLowerCase().endsWith(".gif");
  const [ratio, setRatio] = useState(1.4); // sensible reservation until it loads

  return (
    <motion.div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: String(ratio) }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        unoptimized={isGif}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth) setRatio(img.naturalWidth / img.naturalHeight);
        }}
      />
    </motion.div>
  );
}

function MetaRow({
  label,
  value,
  index = 0,
  isFirst,
  isLast,
}: {
  label: string;
  value: string;
  index?: number;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  /* Each row (stroke + label + value) reveals as one masked unit; rows cascade
     top-to-bottom via the index delay — same line-reveal as the body text.
     The viewport observer lives on the OUTER row (never clipped); the variant
     state propagates to the children. Observing the masked text directly fails:
     at y:110% the tall text block is fully clipped, so it reports 0 intersection
     and never triggers. */
  const transition = { duration: 0.7, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] as const };

  const stroke = (
    <motion.div
      aria-hidden
      style={{ height: 1, background: "var(--border)", alignSelf: "stretch", transformOrigin: "left" }}
      variants={{ hidden: { opacity: 0, scaleX: 0 }, shown: { opacity: 1, scaleX: 1 } }}
      transition={transition}
    />
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-80px" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "clamp(10px, 2vw, 19px)",
        alignSelf: "stretch",
      }}
    >
      {!isFirst && stroke}

      <div
        style={{
          overflow: "hidden",
          alignSelf: "stretch",
          paddingBottom: "0.14em",
          marginBottom: "-0.14em",
        }}
      >
        <motion.div
          variants={{ hidden: { y: "110%" }, shown: { y: 0 } }}
          transition={transition}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "9px",
            alignSelf: "stretch",
            willChange: "transform",
          }}
        >
          <dt
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(12px, 3.2vw, 19.2px)",
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            {label}
          </dt>
          <dd
            style={{
              color: "var(--white)",
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(13px, 3.6vw, 20px)",
              fontWeight: 500,
              lineHeight: 1.45,
            }}
          >
            {value}
          </dd>
        </motion.div>
      </div>

      {isLast && stroke}
    </motion.div>
  );
}
