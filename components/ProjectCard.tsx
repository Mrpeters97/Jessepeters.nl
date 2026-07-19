"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/data";
import { useReveal } from "@/hooks/useReveal";
import RoundArrowButton from "@/components/RoundArrowButton";

type Props = {
  project: Project;
  /** Column position within a row — drives the staggered drop-in delay. */
  index?: number;
};

export default function ProjectCard({ project, index = 0 }: Props) {
  const { shown, onViewportEnter, viewport } = useReveal();

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
          style={{ backgroundColor: "var(--bg)" }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <CardOverlay project={project} />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/**
 * Shared card chrome over a project image: dim gradient, bottom-left
 * title + role, bottom-right CTA. Always visible on mobile (no hover),
 * hover-revealed on desktop. `compact` uses the slightly smaller type of the
 * next-project cards.
 */
export function CardOverlay({ project, compact = false }: { project: Project; compact?: boolean }) {
  const role = project.responsibilities ?? project.categories.join(", ");

  return (
    <>
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

      {/* Bottom-left — project name + what I did. On mobile the text is capped
          so it truncates before reaching the round CTA. */}
      <div className="pointer-events-none absolute bottom-0 left-0 flex flex-col gap-1 p-5 md:p-7 max-w-[calc(100%-76px)] md:max-w-none opacity-100 translate-y-0 transition-all duration-500 ease-out md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0">
        {/* always white — over image */}
        <span
          className="block truncate md:overflow-visible md:whitespace-normal"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: compact ? "clamp(18px, 1.6vw, 36px)" : "clamp(22px, 2vw, 40px)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "#ffffff",
          }}
        >
          {project.title}
        </span>
        <span
          className="block truncate md:overflow-visible md:whitespace-normal"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: compact ? "clamp(12px, 0.85vw, 16px)" : "clamp(13px, 0.95vw, 18px)",
            fontWeight: 400,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {role}
        </span>
      </div>

      {/* Bottom-right CTA — mobile: round arrow-only; desktop: full pill,
          solid by default, on hover → transparent with a white outline. */}
      <div className="absolute bottom-0 right-0 p-5 md:p-7 opacity-100 translate-y-0 transition-all duration-500 ease-out md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0">
        <span className="md:hidden">
          <RoundArrowButton />
        </span>
        <span
          className="hidden md:inline-flex items-center gap-2 rounded-full border-[1.5px] border-transparent bg-[#0E0E0D] text-white transition-colors duration-300 hover:border-white hover:bg-transparent"
          style={{
            padding: "12px 22px",
            fontFamily: "var(--font-sans)",
            fontSize: compact ? "clamp(12px, 0.85vw, 15px)" : "clamp(13px, 0.95vw, 16px)",
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
    </>
  );
}
