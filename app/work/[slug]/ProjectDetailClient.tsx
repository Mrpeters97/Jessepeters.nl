"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import type { Project } from "@/lib/data";
import SayHiCluster from "@/components/SayHiCluster";
import RevealText from "@/components/RevealText";

const G = "20px";

type Props = {
  project: Project;
  nextProject: Project;
};

export default function ProjectDetailClient({ project, nextProject }: Props) {
  const heroImage = project.images?.[0] ?? project.thumbnail;
  const gridImages = project.images?.slice(1) ?? [];
  const gridRows = buildGridRows(gridImages);

  const { scrollY } = useScroll();
  const [vh, setVh] = useState(1000);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
          sizes="100vw"
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
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "clamp(24px, 4vw, 60px)",
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
        </motion.div>
      </motion.section>

      {/* Spacer — content starts right below the 100vh hero */}
      <div style={{ height: "100vh" }} aria-hidden />

      {/* Scrolling content layer */}
      <div
        className="relative"
        style={{
          zIndex: 2,
          backgroundColor: "var(--bg)",
          borderRadius: "50px 50px 0 0",
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
              gap: "32px",
            }}
          >
            {(() => {
              const items = [
                { label: "Date", value: project.date ?? String(project.year) },
                { label: "Client", value: project.client },
                project.employer ? { label: "Employer", value: project.employer } : null,
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
          </dl>
        </section>

        {/* Image grid — alternating 2-up / full-width rows, filled 1..N in order.
            A row left with a single image spans full width; empty rows are omitted. */}
        {gridImages.length > 0 && (
          <section
            style={{
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
                    <div key={ri} style={{ height: row.tall ? "130vh" : "90vh" }}>
                      <ProjectImage src={row.images[0]} />
                    </div>
                  ) : (
                    <div
                      key={ri}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: G,
                        height: "90vh",
                      }}
                    >
                      <ProjectImage src={row.images[0]} delay={0} />
                      <ProjectImage src={row.images[1]} delay={0.15} />
                    </div>
                  )
                )}
          </section>
        )}

        {/* Next project */}
        <section style={{ paddingInline: G, paddingBottom: G, paddingTop: "clamp(32px, 4vw, 64px)" }}>
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
            Next project
          </p>

          {/* Full-width card, same hover behaviour as work-grid cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              style={{ overflow: "hidden", borderRadius: 0 }}
              whileHover={{ borderRadius: 10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/work/${nextProject.slug}`}
                className="group relative block overflow-hidden"
                style={{
                  height: "85vh",
                  backgroundColor: "var(--bg)",
                }}
              >
                <Image
                  src={nextProject.thumbnail}
                  alt={nextProject.title}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* dim layer — always on for mobile legibility, hover on desktop */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0.66) 100%)",
                  }}
                />

                {/* bottom-left: title + role */}
                <div className="pointer-events-none absolute bottom-0 left-0 flex flex-col gap-1 p-5 md:p-7 opacity-100 translate-y-0 transition-all duration-500 ease-out md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(22px, 2vw, 40px)",
                      fontWeight: 500,
                      lineHeight: 1.05,
                      letterSpacing: "-0.01em",
                      color: "#ffffff", /* always white — over image */
                    }}
                  >
                    {nextProject.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(13px, 0.95vw, 18px)",
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.82)",
                    }}
                  >
                    {nextProject.responsibilities ?? nextProject.categories.join(", ")}
                  </span>
                </div>

                {/* bottom-right: view project pill */}
                <div className="absolute bottom-0 right-0 p-5 md:p-7 opacity-100 translate-y-0 transition-all duration-500 ease-out md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-transparent bg-[#0E0E0D] text-white transition-colors duration-300 hover:border-white hover:bg-transparent"
                    style={{
                      padding: "12px 22px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(13px, 0.95vw, 16px)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    View project
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <SayHiCluster />
      </div>
    </>
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

function ProjectImage({ src, delay = 0 }: { src: string; delay?: number }) {
  const isGif = src.toLowerCase().endsWith(".gif");
  return (
    <motion.div
      className="relative h-full w-full overflow-hidden"
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
        gap: "19px",
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
              fontSize: "19.2px",
              fontWeight: 400,
              lineHeight: "20px",
            }}
          >
            {label}
          </dt>
          <dd
            style={{
              color: "var(--white)",
              fontFamily: "var(--font-sans)",
              fontSize: "20px",
              fontWeight: 500,
              lineHeight: "28.8px",
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
