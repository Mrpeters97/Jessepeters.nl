"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getLenis } from "@/components/SmoothScroll";

export default function PhotoSheet({
  src,
  open,
  onClose,
}: {
  src: string;
  open: boolean;
  onClose: () => void;
}) {
  /* notify CustomCursor so it switches to close-mode */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("photo-sheet-state", { detail: { open } }));
    return () => {
      if (open) window.dispatchEvent(new CustomEvent("photo-sheet-state", { detail: { open: false } }));
    };
  }, [open]);

  /* lock scroll — pause Lenis (it ignores body overflow) */
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => { lenis?.start(); };
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop — below both navbars (header z-40, floating menu z-50) */}
          <motion.div
            className="fixed inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 35 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* sheet — flex column so the close button always sits just below the
              image (never over it) with a consistent gap, instead of an absolute
              bottom offset that lands differently per browser (Safari vs Chrome
              toolbar + safe-area). */}
          <motion.div
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 36,
              backgroundColor: "color-mix(in srgb, var(--bg) 20%, transparent)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              borderRadius: "20px 20px 0 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              /* clear the fixed header (~72px) and the floating menu (~56px) + safe areas */
              paddingTop: "calc(72px + env(safe-area-inset-top))",
              paddingBottom: "calc(76px + env(safe-area-inset-bottom))",
              paddingInline: "24px",
              cursor: "none",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* image — fills the available space, object-contain keeps full photo visible */}
            <div style={{ position: "relative", width: "100%", flex: 1, minHeight: 0 }}>
              <Image src={src} alt="" fill sizes="100vw" className="object-contain" />
            </div>

            {/* mobile-only close button — in-flow below the image (no custom cursor on touch) */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="Sluiten"
              className="flex items-center justify-center md:hidden"
              style={{
                flexShrink: 0,
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "1.5px solid var(--accent-magenta)",
                backgroundColor: "transparent",
                color: "var(--accent-magenta)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
