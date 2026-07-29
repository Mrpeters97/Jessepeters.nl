"use client";

import { motion } from "framer-motion";
import RevealText from "@/components/RevealText";
import { glassStyle } from "@/components/glassStyle";
import { usePageReady } from "@/hooks/usePageReady";

/** Fixed page title ("Work" / "Moments") — bottom-right, difference-blended
 *  as ONE group (title + badge together) so it inverts against the grid
 *  content scrolling behind it, exactly as before. An optional `count`
 *  renders as a glass circle badge next to the title, fading/sliding in on
 *  the same load-gated timing RevealText uses for the title itself. */
export default function PageTitleOverlay({
  title,
  count,
  fontSize = "clamp(48px, 9vw, 150px)",
}: {
  title: string;
  count?: number;
  fontSize?: string;
}) {
  const ready = usePageReady();

  return (
    <div
      className="pointer-events-none fixed hidden md:block"
      style={{ bottom: 0, right: "30px", zIndex: 30, mixBlendMode: "difference" }}
    >
      <div className="relative inline-flex items-center" style={{ gap: "clamp(8px, 1.1vw, 22px)" }}>
        <RevealText
          as="span"
          className="overlay-title"
          style={{ fontSize, display: "inline-block" }}
        >
          {title}
        </RevealText>
        {count !== undefined && (
          /* Same masked wipe-up reveal as RevealText's title lines (same
             duration/ease, zero delay) — a fade read as a separate effect
             happening nearby; this reads as literally part of the title's
             own reveal. */
          <span
            className="relative overflow-hidden rounded-full flex-shrink-0"
            style={{
              width: "clamp(32px, 3.4vw, 64px)",
              height: "clamp(32px, 3.4vw, 64px)",
            }}
          >
            <motion.span
              className="absolute inset-0 flex items-center justify-center rounded-full"
              initial={{ y: "110%" }}
              animate={ready ? { y: 0 } : { y: "110%" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...glassStyle(true, true),
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1.5px solid #ffffff",
                color: "#ffffff",
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(13px, 1.3vw, 24px)",
                fontWeight: 500,
                letterSpacing: "normal",
              }}
            >
              {count}
            </motion.span>
          </span>
        )}
      </div>
    </div>
  );
}
