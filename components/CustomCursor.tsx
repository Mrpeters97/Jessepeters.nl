"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const isInteractive = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      if (
        tag === "a" ||
        tag === "button" ||
        el.getAttribute("role") === "button" ||
        el.dataset.cursor === "hover"
      )
        return true;
      if (el.parentElement) return isInteractive(el.parentElement);
      return false;
    };

    const over = (e: MouseEvent) => setHovering(isInteractive(e.target));

    const onSheetState = (e: Event) => setSheetOpen((e as CustomEvent<{ open: boolean }>).detail.open);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("photo-sheet-state", onSheetState);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("photo-sheet-state", onSheetState);
    };
  }, [x, y]);

  if (!enabled) return null;

  /* In close-mode (sheet open, not hovering over another interactive element)
     show a larger magenta circle with an X. On hover over links/buttons the
     cursor reverts to the normal expanded-dot state so the user knows those
     elements still do something. */
  const isCloseMode = sheetOpen && !hovering;
  const size = isCloseMode ? 48 : hovering ? 24 : 16;

  return (
    <>
      {/* Ring / dot — magenta, no blend */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
        style={{ x: springX, y: springY, viewTransitionName: "cursor-ring" }}
        animate={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          backgroundColor: isCloseMode ? "transparent" : "var(--accent-magenta)",
          border: isCloseMode ? "1.5px solid var(--accent-magenta)" : "1.5px solid transparent",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.4 }}
      />

      {/* Close-mode X — its own top-level element so mix-blend-mode blends against
          the actual page behind it (a transformed parent would isolate the blend) */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: springX, y: springY, mixBlendMode: "difference", viewTransitionName: "cursor-x" }}
        animate={{ opacity: isCloseMode ? 1 : 0, scale: isCloseMode ? 1 : 0.4 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{ display: "block", transform: "translate(-50%, -50%)" }}
        >
          <path d="M18 6L6 18M6 6l12 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.div>
    </>
  );
}
