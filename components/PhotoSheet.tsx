"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getLenis } from "@/components/SmoothScroll";
import { archiveCaptions } from "@/lib/archiveCaptions";

export default function PhotoSheet({
  src,
  open,
  onClose,
}: {
  src: string;
  open: boolean;
  onClose: () => void;
}) {
  const REVEAL_MS = 720;       // mask wipe up (open)
  const CLOSE_MS = 1050;       // mask wipe down (close) — slower, more gentle
  const SETTLE_MS = 460;       // wait for the sheet to finish sliding up first
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [settled, setSettled] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  /* The image is revealed (mask wipes bottom → top) only once it has actually
     decoded AND the sheet has settled — so every photo enters identically,
     regardless of how long it took to load (no instant pop for cached ones). */
  const reveal = open && loaded && settled && !closing;

  /* portal target only exists on the client */
  useEffect(() => { setMounted(true); }, []);

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

  /* reset reveal state each time a sheet opens */
  useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    setClosing(false);
    setLoaded(false);
    setSettled(false);
    const t = setTimeout(() => setSettled(true), SETTLE_MS);
    return () => clearTimeout(t);
  }, [open, src]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Reverse on close: mask the image back down first, then slide the sheet away. */
  function handleClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(onClose, CLOSE_MS - 120);
  }

  if (!mounted) return null;

  /* Rendered into <body> via a portal so `position: fixed` is relative to the
     viewport, not a transformed/filtered ancestor (the archive columns animate
     with transforms, which would otherwise clip the sheet and leave it not
     fully covering the screen on mobile). */
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop — below header (z-40) and floating menu (z-50) */}
          <motion.div
            className="fixed inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 30 }}
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
              zIndex: 31,
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
            {/* image — fills available space. Capped on desktop, fills on mobile.
                The mask reveals the photo from the bottom up (clip-path inset top
                100% → 0%) once loaded; on close it runs in reverse (0% → 100%). */}
            <div style={{ position: "relative", width: "100%", flex: 1, minHeight: 0, maxWidth: "min(85vw, 480px)", maxHeight: "64vh" }}>
              <motion.div
                className="absolute inset-0"
                initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                animate={{ clipPath: reveal ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
                transition={{ duration: (closing ? CLOSE_MS : REVEAL_MS) / 1000, ease: [0.65, 0, 0.35, 1] }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-contain"
                  onLoad={() => setLoaded(true)}
                  priority
                />
              </motion.div>
            </div>

            {/* caption — name + location/year, between the image and the close button */}
            {archiveCaptions[src] && (
              <div
                style={{
                  flexShrink: 0,
                  marginTop: "18px",
                  textAlign: "center",
                  color: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(15px, 1.4vw, 20px)",
                    fontWeight: 500,
                  }}
                >
                  {archiveCaptions[src].name}
                </div>
                <div
                  style={{
                    marginTop: "2px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(12px, 1vw, 15px)",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {archiveCaptions[src].location}
                </div>
              </div>
            )}

            {/* mobile close button — in-flow below image, stops propagation to sheet */}
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              aria-label="Sluiten"
              className="md:hidden flex items-center justify-center"
              style={{
                flexShrink: 0,
                marginTop: "16px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1.5px solid var(--accent-magenta)",
                backgroundColor: "transparent",
                color: "#ffffff",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
