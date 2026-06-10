"use client";

import { useEffect, useRef, useState } from "react";
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
  const [imageVisible, setImageVisible] = useState(false);
  const closingRef = useRef(false);

  /* notify CustomCursor */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("photo-sheet-state", { detail: { open } }));
    return () => {
      if (open) window.dispatchEvent(new CustomEvent("photo-sheet-state", { detail: { open: false } }));
    };
  }, [open]);

  /* lock scroll */
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => { lenis?.start(); };
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Show image after sheet has slid up (~500ms), hide immediately on close trigger */
  useEffect(() => {
    if (open) {
      closingRef.current = false;
      const t = setTimeout(() => setImageVisible(true), 500);
      return () => clearTimeout(t);
    } else {
      setImageVisible(false);
    }
  }, [open]);

  /* Two-stage close: image fades first (~420ms), then modal slides down */
  function handleClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setImageVisible(false);
    setTimeout(onClose, 420);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop — above header (z-40) and floating menu (z-50) */}
          <motion.div
            className="fixed inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 200 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* sheet — full 100vh, no rounded corners */}
          <motion.div
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 201,
              backgroundColor: "color-mix(in srgb, var(--bg) 20%, transparent)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "max(20px, env(safe-area-inset-top))",
              paddingBottom: "max(20px, env(safe-area-inset-bottom))",
              paddingInline: "20px",
              cursor: "none",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* image — fills available space, fades in after sheet opens.
                Capped on desktop so it stays a comfortable size; fills on mobile. */}
            <div style={{ position: "relative", width: "100%", flex: 1, minHeight: 0, maxWidth: "min(92vw, 620px)" }}>
              <AnimatePresence>
                {imageVisible && (
                  <motion.div
                    key={src}
                    className="absolute inset-0"
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 1.02 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image src={src} alt="" fill sizes="100vw" className="object-contain" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* mobile close button — in-flow below image, stops propagation to sheet */}
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              aria-label="Sluiten"
              className="md:hidden flex items-center justify-center"
              style={{
                flexShrink: 0,
                marginTop: "16px",
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
