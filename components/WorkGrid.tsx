"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";
import { projects, featuredProjects, archivePhotos, type Project } from "@/lib/data";
import PhotoSheet from "@/components/PhotoSheet";
import ArchiveOverlay from "@/components/ArchiveOverlay";
import CoverImage from "@/components/CoverImage";
import { useReveal } from "@/hooks/useReveal";
import { useIsMobile } from "@/hooks/useIsMobile";

const G = "20px";

/**
 * Picks `count` distinct random archive photos. Re-rolls on every mount, so a
 * page refresh — or each fresh infinite-scroll round — shows a new set.
 * Returns null until mounted to avoid an SSR/client hydration mismatch.
 */
function useRandomArchive(count: number) {
  const [picks, setPicks] = useState<string[] | null>(null);
  useEffect(() => {
    const pool = [...archivePhotos];
    const out: string[] = [];
    for (let i = 0; i < count && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    setPicks(out);
  }, [count]);
  return picks;
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div style={{ minWidth: 0, height: "100%" }}>{children}</div>;
}

function ArchiveTile({
  src,
  index = 0,
}: {
  src: string | null;
  index?: number;
}) {
  const [open, setOpen] = useState(false);
  const { shown, onViewportEnter, viewport } = useReveal();

  return (
    <>
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
          <button
            onClick={() => src && setOpen(true)}
            className="group relative block h-full w-full overflow-hidden"
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: 0,
              border: "none",
            }}
            aria-label="Foto vergroten"
          >
            {src && (
              <>
                <CoverImage src={src} sizes="(max-width: 768px) 100vw, 33vw" loading="eager" />
                <ArchiveOverlay src={src} />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>

      {src && <PhotoSheet src={src} open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Mobile: single column, projects ~4:3, archive ~3:4 portrait. */
function MobileStack({ project, archive }: { project: Project[]; archive: (string | null)[] }) {
  const items: { kind: "p" | "a"; project?: Project; src?: string | null }[] = [];
  let pi = 0;
  let ai = 0;
  const order: ("p" | "a")[] = [
    "p", "a", "p", "p", "p", "a", "p", "a", "p", "p", "p", "p", "p", "p",
  ];
  for (const k of order) {
    if (k === "p") {
      if (pi < project.length) items.push({ kind: "p", project: project[pi++] });
    } else if (ai < archive.length) {
      items.push({ kind: "a", src: archive[ai++] });
    }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: G }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            width: "100%",
            aspectRatio: it.kind === "a" ? "1 / 1" : "4 / 3",
            contentVisibility: "auto",
          }}
        >
          {it.kind === "p" ? (
            <ProjectCard project={it.project!} index={i % 5} />
          ) : (
            <ArchiveTile src={it.src ?? null} index={i % 5} />
          )}
        </div>
      ))}
    </div>
  );
}

/** G1 — 35/65 split: project (TL) over a taller archive (BL) | large feature (R). */
function SplitRow({
  topProject,
  bottomArchive,
  feature,
}: {
  topProject: Project;
  bottomArchive: string | null;
  feature: Project;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "35fr 65fr",
        gridTemplateRows: "32fr 68fr",
        gap: G,
        height: "108vh",
        contentVisibility: "auto",
      }}
    >
      <div style={{ gridColumn: 1, gridRow: 1, minWidth: 0 }}>
        <ProjectCard project={topProject} index={0} />
      </div>
      <div style={{ gridColumn: 1, gridRow: 2, minWidth: 0 }}>
        <ArchiveTile src={bottomArchive} index={2} />
      </div>
      <div style={{ gridColumn: 2, gridRow: "1 / 3", minWidth: 0 }}>
        <ProjectCard project={feature} index={1} />
      </div>
    </div>
  );
}

/** Row with a project + a portrait archive photo. `reverse` mirrors it —
 *  archive on the left (30%), project on the right (70%) — instead of the
 *  default project-left / archive-right. */
function ProjectPortraitRow({
  project,
  archive,
  reverse = false,
}: {
  project: Project;
  archive: string | null;
  reverse?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: reverse ? "30fr 70fr" : "70fr 30fr",
        gap: G,
        height: "85vh",
        contentVisibility: "auto",
      }}
    >
      {reverse ? (
        <>
          <Cell><ArchiveTile src={archive} index={0} /></Cell>
          <Cell><ProjectCard project={project} index={1} /></Cell>
        </>
      ) : (
        <>
          <Cell><ProjectCard project={project} index={0} /></Cell>
          <Cell><ArchiveTile src={archive} index={1} /></Cell>
        </>
      )}
    </div>
  );
}

function PairRow({ left, right }: { left: Project; right: Project }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: G, height: "80vh", contentVisibility: "auto" }}>
      <Cell><ProjectCard project={left} index={0} /></Cell>
      <Cell><ProjectCard project={right} index={1} /></Cell>
    </div>
  );
}

function FullRow({ project }: { project: Project }) {
  return <div style={{ height: "90vh", contentVisibility: "auto" }}><ProjectCard project={project} /></div>;
}

/** Looks a project up by slug — row placement below is explicit/named rather
 *  than positional, so adding, removing or re-featuring a project can never
 *  silently reshuffle everyone else's card shape on Home or Work. */
const bySlug = (list: Project[], slug: string) => list.find((p) => p.slug === slug)!;

/** Home: curated featured set (6) + 2 woven archive photos. */
export function HomeGrid() {
  const isMobile = useIsMobile();
  const archive = useRandomArchive(2);
  const a = (i: number) => archive?.[i] ?? null;
  const feature = bySlug(featuredProjects, "gemeente-tynaarlo");

  if (isMobile) return <MobileStack project={featuredProjects} archive={[a(0), a(1)]} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: G }}>
      <SplitRow topProject={bySlug(featuredProjects, "pc-franeker")} bottomArchive={a(0)} feature={feature} />
      <PairRow left={bySlug(featuredProjects, "dna-projecten")} right={bySlug(featuredProjects, "leeuwarder-golfclub")} />
      <FullRow project={bySlug(featuredProjects, "cafe-del-mar")} />
      <ProjectPortraitRow project={bySlug(featuredProjects, "vanhulley")} archive={a(1)} />
    </div>
  );
}

/** Work page round: all 12 projects + 4 woven archive photos. */
export default function WorkGrid() {
  const isMobile = useIsMobile();
  const archive = useRandomArchive(4);
  const a = (i: number) => archive?.[i] ?? null;
  const feature = bySlug(projects, "gemeente-tynaarlo");

  if (isMobile) return <MobileStack project={projects} archive={[a(0), a(1), a(2), a(3)]} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: G }}>
      <SplitRow topProject={bySlug(projects, "pulse20")} bottomArchive={a(0)} feature={feature} />
      <FullRow project={bySlug(projects, "pc-franeker")} />
      <PairRow left={bySlug(projects, "dna-projecten")} right={bySlug(projects, "wdw")} />
      <ProjectPortraitRow project={bySlug(projects, "vanhulley")} archive={a(1)} reverse />
      <FullRow project={bySlug(projects, "leeuwarder-golfclub")} />
      <ProjectPortraitRow project={bySlug(projects, "cafe-del-mar")} archive={a(2)} />
      <PairRow left={bySlug(projects, "de-boer-rvs")} right={bySlug(projects, "civ-water")} />
      <FullRow project={bySlug(projects, "open-agency-night")} />
      <ProjectPortraitRow project={bySlug(projects, "spieren-voor-spieren")} archive={a(3)} />
    </div>
  );
}
