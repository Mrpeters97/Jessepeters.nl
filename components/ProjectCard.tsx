"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/data";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  project: Project;
  /** Column position within a row — drives the staggered drop-in delay. */
  index?: number;
};

export default function ProjectCard({ project, index = 0 }: Props) {
  const { shown, onViewportEnter, viewport } = useReveal();
  const isStatement = project.slug === "leeuw-worden";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      onViewportEnter={onViewportEnter}
      viewport={viewport}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <motion.div
        className="h-full"
        style={{ overflow: "hidden", borderRadius: 0 }}
        whileHover={{ borderRadius: 10 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={`/work/${project.slug}`}
          className="group relative block h-full"
          style={{
            backgroundColor: "var(--bg)",
            color: project.cardTextColor || "var(--white)",
          }}
        >
          {isStatement ? (
            <StatementBlock project={project} />
          ) : (
            <ImageBlock project={project} />
          )}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function ImageBlock({ project }: { project: Project }) {
  const role = project.responsibilities ?? project.categories.join(", ");

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={project.thumbnail}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />

      {/* Dim layer — fades in on hover so the title and button stay readable.
          On mobile (no hover) it's always on so the meta is legible. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0.66) 100%)",
        }}
      />

      {/* Bottom-left — project name + what I did (always shown on mobile, hover on desktop) */}
      <div className="pointer-events-none absolute bottom-0 left-0 flex flex-col gap-1 p-5 md:p-7 opacity-100 translate-y-0 transition-all duration-500 ease-out md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0">
        {/* always white — over image */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(22px, 2vw, 40px)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "#ffffff",
          }}
        >
          {project.title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(13px, 0.95vw, 18px)",
            fontWeight: 400,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {role}
        </span>
      </div>

      {/* Bottom-right — view-project pill (always shown on mobile, hover on desktop) */}
      <div className="absolute bottom-0 right-0 p-5 md:p-7 opacity-100 translate-y-0 transition-all duration-500 ease-out md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0">
        {/* solid by default; on its own hover → transparent with a white outline */}
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
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

function StatementBlock({ project }: { project: Project }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center px-6 py-10 md:px-16 md:py-16">
      <h2
        className="text-center font-medium uppercase leading-[0.92]"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(56px, 11vw, 220px)",
          letterSpacing: "-0.02em",
          color: project.cardTextColor || "var(--accent-yellow)",
          textShadow: "0 4px 0 rgba(0,0,0,0.04)",
        }}
      >
        {project.title}
      </h2>

      {/* Speech bubble tail (yellow drop under the pink) */}
      <div
        className="pointer-events-none absolute -bottom-px left-1/2 h-12 w-32 -translate-x-1/2 md:h-20 md:w-56"
        style={{
          backgroundColor: project.cardTextColor || "var(--accent-yellow)",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        }}
      />
    </div>
  );
}
