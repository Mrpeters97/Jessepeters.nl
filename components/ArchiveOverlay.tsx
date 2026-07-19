import { archiveCaptions } from "@/lib/archiveCaptions";

/**
 * Hover chrome for archive photo tiles: dim gradient + bottom-left name and
 * location/year (same text sizing as ProjectCard's CardOverlay, so archive
 * tiles and work-item cards read as one system). Always visible on mobile
 * (no hover), hover-revealed on desktop. Renders nothing for a photo with no
 * known caption.
 *
 * `compact` — the Archive page always shows 2 (mobile) or 3 (desktop) narrow
 * columns side by side, so its always-visible mobile text needs to be
 * smaller than on the wider single/half-width archive fillers in the work
 * grids.
 */
export default function ArchiveOverlay({ src, compact = false }: { src: string; compact?: boolean }) {
  const caption = archiveCaptions[src];
  if (!caption) return null;

  return (
    <>
      {/* Dim layer — fades in on hover so the text stays readable.
          On mobile (no hover) it's always on so the caption is legible. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0.66) 100%)",
        }}
      />

      <div className={`pointer-events-none absolute bottom-0 left-0 flex flex-col gap-1 text-left opacity-100 translate-y-0 transition-all duration-500 ease-out md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0 ${compact ? "p-3 md:p-6" : "p-5 md:p-7"}`}>
        {/* always white — over image; wraps (never truncates) so long captions
            stay fully readable instead of ending in an ellipsis */}
        <span
          className="block"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: compact ? "clamp(14px, 4vw, 22px)" : "clamp(22px, 2vw, 40px)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "#ffffff",
          }}
        >
          {caption.name}
        </span>
        <span
          className="block"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: compact ? "clamp(11px, 2.6vw, 14px)" : "clamp(13px, 0.95vw, 18px)",
            fontWeight: 400,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {caption.location}
        </span>
      </div>
    </>
  );
}
