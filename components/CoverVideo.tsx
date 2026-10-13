"use client";

import { useReducedMotion } from "framer-motion";
import CoverImage from "@/components/CoverImage";
import { useInViewVideo } from "@/hooks/useInViewVideo";

/**
 * Card cover that plays a clip once, from its first frame, when the card first
 * scrolls into view, then rests on the clip's last frame. Shares CoverImage's
 * 1px overhang + hover zoom; falls back to the still cover with reduced motion.
 * Must sit inside a `relative overflow-hidden` `.group` ancestor, like
 * CoverImage.
 *
 * With `frame`, the clip is shown whole as a 16:10 screen on a flat background,
 * laid out on the same 2871×1305 canvas (object-cover) as the framed still
 * covers, so it matches their size at any card shape.
 */
export default function CoverVideo({
  src,
  fallback,
  alt,
  sizes,
  frame,
}: {
  /** Path without extension: `${src}.webm`, `${src}.mp4`, `${src}-poster.webp`. */
  src: string;
  fallback: string;
  alt: string;
  sizes: string;
  frame?: { background: string; size: number };
}) {
  const reduceMotion = useReducedMotion();
  const { containerRef, videoRef, near, playing } = useInViewVideo<HTMLDivElement>(0.35, true);

  if (reduceMotion) return <CoverImage src={fallback} alt={alt} sizes={sizes} />;

  const video = near && (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ opacity: playing ? 1 : 0, transition: "opacity 0.6s ease" }}
      muted
      playsInline
      preload="metadata"
      aria-hidden
    >
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );

  if (frame) {
    return (
      <div
        ref={containerRef}
        className="absolute transition-transform duration-700 group-hover:scale-[1.04]"
        style={{ inset: "-1px", backgroundColor: frame.background, containerType: "size" }}
        role="img"
        aria-label={alt}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: "max(100cqw, calc(100cqh * 2871 / 1305))", aspectRatio: "2871 / 1305", transform: "translate(-50%, -50%)" }}
        >
          <div
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{
              width: `${frame.size}%`,
              aspectRatio: "16 / 10",
              transform: "translate(-50%, -50%)",
              borderRadius: "1.43% / 2.29%",
              backgroundColor: "#061426",
              boxShadow: "0 1.4vw 3.6vw -0.8vw rgba(6, 20, 38, 0.28), 0 0.2vw 0.5vw rgba(6, 20, 38, 0.1)",
            }}
          >
            {video}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute transition-transform duration-700 group-hover:scale-[1.04]"
      style={{ inset: "-1px", backgroundImage: `url(${src}-poster.webp)`, backgroundSize: "cover", backgroundPosition: "center" }}
      role="img"
      aria-label={alt}
    >
      {video}
    </div>
  );
}
