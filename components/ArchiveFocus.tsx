"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate as fmAnimate,
  type PanInfo,
} from "framer-motion";
import { getLenis } from "@/components/SmoothScroll";
import { archiveCaptions } from "@/lib/archiveCaptions";
import { useIsMobile } from "@/hooks/useIsMobile";

export type ArchiveOrderItem = { id: string; src: string; alt: string };

const REVEAL_MS = 720; // sheet-open mask/slide in (mirrors PhotoSheet)
const CLOSE_MS = 1050; // sheet-close slide out (mirrors PhotoSheet)
const SETTLE_MS = 460; // wait for the sheet to finish sliding up before the entrance reveal (mirrors PhotoSheet)
const STEP_MS = 300; // main-image crossfade while browsing — the rail carries the "scrolling" feel
const MAX_QUEUED_STEPS = 6; // caps how far a fast/sustained scroll can queue up before it stops accepting more

/**
 * Full-viewport archive photo browser: the same centered image + caption
 * treatment as PhotoSheet (same size caps, same caption styling), plus a
 * left filmstrip rail (desktop) or a peek-carousel (mobile) so the whole
 * archive set can be browsed without leaving the view. Replaces PhotoSheet
 * for the Archive page only — WorkGrid's archive-photo fillers keep using
 * the plain PhotoSheet.
 */
export default function ArchiveFocus({
  order,
  index,
  onIndexChange,
  onClose,
}: {
  order: ArchiveOrderItem[];
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [settled, setSettled] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const closingRef = useRef(false);
  const wheelAccumRef = useRef(0);
  /* Queued-step navigation: a fast/sustained wheel or key gesture queues up
     several steps instead of the old approach (a hard timed lock that just
     silently dropped input while active), so a quick flick advances through
     several photos in smooth succession — closer to a native feel — rather
     than eating most of the gesture and only moving once. */
  const pendingStepsRef = useRef(0);
  const processingRef = useRef(false);
  const currentIndexRef = useRef(index);
  useEffect(() => { currentIndexRef.current = index; }, [index]);

  const current = open ? order[index!] : null;
  const caption = current ? archiveCaptions[current.src] : undefined;
  /* Gates the entrance mask-reveal (same mechanic as PhotoSheet): only for
     the first photo shown right after opening, not for photos reached by
     browsing — those use the lighter crossfade instead (see `browsing`). */
  const reveal = open && loaded && settled && !closing;

  useEffect(() => { setMounted(true); }, []);

  /* notify CustomCursor — same contract PhotoSheet already established */
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

  /* reset entrance-reveal state each time the sheet opens */
  useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    setClosing(false);
    setLoaded(false);
    setSettled(false);
    setBrowsing(false);
    const t = setTimeout(() => setSettled(true), SETTLE_MS);
    return () => clearTimeout(t);
  }, [open]);

  function handleClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(onClose, CLOSE_MS - 120);
  }

  /* Drains one queued step, then waits STEP_MS before draining the next —
     re-arms itself, so it keeps going until the queue is empty rather than
     needing a fresh call per step. */
  function drainQueue() {
    if (processingRef.current || pendingStepsRef.current === 0 || order.length < 2) return;
    processingRef.current = true;
    const dir = pendingStepsRef.current > 0 ? 1 : -1;
    pendingStepsRef.current -= dir;
    setBrowsing(true);
    const next = ((currentIndexRef.current! + dir) % order.length + order.length) % order.length;
    currentIndexRef.current = next;
    onIndexChange(next);
    setTimeout(() => {
      processingRef.current = false;
      drainQueue();
    }, STEP_MS);
  }

  function step(dir: 1 | -1) {
    if (!open || order.length < 2) return;
    const next = pendingStepsRef.current + dir;
    pendingStepsRef.current = Math.max(-MAX_QUEUED_STEPS, Math.min(MAX_QUEUED_STEPS, next));
    drainQueue();
  }

  function jump(i: number) {
    if (!open || i === currentIndexRef.current) return;
    pendingStepsRef.current = 0; // a direct jump overrides any queued relative steps
    setBrowsing(true);
    currentIndexRef.current = i;
    onIndexChange(i);
  }

  /* wheel + keyboard navigation (desktop) */
  useEffect(() => {
    if (!open || isMobile) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      /* A standard (non-precision) mouse wheel reports one large, discrete
         delta per notch — commonly ~100px in Chrome/Safari — with no
         accumulation needed. A trackpad's momentum instead arrives as many
         much smaller per-event deltas that need to build up before it counts
         as a deliberate scroll. Magnitude alone reliably tells them apart;
         a timing/gap-based check was tried first but had to be dropped —
         once this handler calls preventDefault(), the browser can serialize
         wheel dispatch with irregular gaps under load, which made "time
         since last event" an unreliable signal for device type. */
      if (Math.abs(e.deltaY) >= 70) {
        wheelAccumRef.current = 0;
        step(e.deltaY > 0 ? 1 : -1);
        return;
      }

      /* Clamp each event's contribution — trackpad momentum can otherwise
         fire a burst of events with a large deltaY spike that alone jumps
         several photos. THRESH is tuned well above a single gentle trackpad
         flick's total accumulated delta, so a soft scroll reads as one step,
         not several. */
      const delta = Math.max(-80, Math.min(80, e.deltaY));
      wheelAccumRef.current += delta;
      const THRESH = 350;
      while (wheelAccumRef.current > THRESH) { step(1); wheelAccumRef.current -= THRESH; }
      while (wheelAccumRef.current < -THRESH) { step(-1); wheelAccumRef.current += THRESH; }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile, order.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") step(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order.length]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <>
          <motion.div
            className="fixed inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 30 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          <motion.div
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 31,
              backgroundColor: "color-mix(in srgb, var(--bg) 20%, transparent)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "max(20px, env(safe-area-inset-top))",
              paddingBottom: "max(20px, env(safe-area-inset-bottom))",
              paddingInline: "20px",
              cursor: "none",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: REVEAL_MS / 1000, ease: [0.32, 0.72, 0, 1] }}
          >
            {!isMobile && (
              <FilmstripRail order={order} currentIndex={index!} onJump={jump} />
            )}

            {/* Centers the photo + caption + (mobile) close link as one group
                within the space above the reserved nav-clearance spacer below
                — decoupled from that reserved space so the group is centered
                on its own, not skewed upward by asymmetric padding. */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isMobile ? (
                <MobilePeekRow
                  order={order}
                  currentIndex={index!}
                  onStep={step}
                  closing={closing}
                  browsing={browsing}
                  reveal={reveal}
                  onLoad={() => setLoaded(true)}
                />
              ) : (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    flex: 1,
                    minHeight: 0,
                    maxWidth: "min(90vw, 640px)",
                    /* 78vh alone looks great on tall displays, but on a
                       shorter laptop screen the floating nav pill (~fixed,
                       ~90px incl. margin) and caption below eat a much
                       bigger share of that same vh — so also cap against a
                       fixed px budget that reserves room for both, which
                       binds first on short viewports. */
                    maxHeight: "min(78vh, calc(100vh - 260px))",
                  }}
                >
                  {!browsing ? (
                    /* First photo shown after opening — same gated bottom-up mask
                       reveal as PhotoSheet, timed to the sheet settling + the
                       image actually finishing loading. */
                    <motion.div
                      className="absolute inset-0"
                      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                      animate={{ clipPath: reveal ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
                      transition={{ duration: (closing ? CLOSE_MS : REVEAL_MS) / 1000, ease: [0.65, 0, 0.35, 1] }}
                    >
                      <Image
                        src={current.src}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-contain"
                        onLoad={() => setLoaded(true)}
                        priority
                      />
                    </motion.div>
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={current.src}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          clipPath: closing ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 0% 0%)",
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          opacity: { duration: STEP_MS / 1000, ease: [0.22, 1, 0.36, 1] },
                          clipPath: { duration: closing ? CLOSE_MS / 1000 : 0.01, ease: [0.65, 0, 0.35, 1] },
                        }}
                      >
                        <Image src={current.src} alt="" fill sizes="100vw" className="object-contain" priority />
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )}

              {/* caption — name + location/year, same styling as PhotoSheet */}
              {caption && (
                <div
                  style={{ flexShrink: 0, marginTop: "18px", textAlign: "center", color: "#ffffff" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.src}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "clamp(15px, 1.4vw, 20px)",
                          fontWeight: 500,
                        }}
                      >
                        {caption.name}
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
                        {caption.location}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* mobile-only close link — desktop relies purely on the
                  cursor's close-ring (no touch/cursor there means no other
                  way to see that state) */}
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                aria-label="Sluiten"
                className="md:hidden"
                style={{
                  flexShrink: 0,
                  marginTop: "16px",
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            {/* Reserves the floating nav pill's footprint (fixed, z-50, above
                this sheet) so the centered group above never lands under it. */}
            {isMobile && (
              <div aria-hidden style={{ flexShrink: 0, width: "100%", height: "calc(72px + env(safe-area-inset-bottom))" }} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

const RAIL_ITEM_W = 64; // portrait thumb, same 3:4 ratio as the archive grid tiles
const RAIL_ITEM_H = Math.round((RAIL_ITEM_W * 4) / 3);
const RAIL_GAP = 10; // unchanged — smaller items fit more in view without crowding them
const RAIL_STEP = RAIL_ITEM_H + RAIL_GAP;
const RAIL_BULGE = 36; // how far the active thumb (and its close neighbours) push out sideways

/* Distance-based horizontal "bulge" — the active thumbnail and its immediate
   neighbours sit further from the rail's edge than the rest, curving outward
   like the reference filmstrip, so the offset itself reads as "you're
   scrolling through" rather than a flat, static list. */
function railBulge(distance: number) {
  const abs = Math.abs(distance);
  if (abs === 0) return RAIL_BULGE;
  if (abs === 1) return RAIL_BULGE * 0.7;
  return 0;
}

/* Left filmstrip rail (desktop): one continuous vertical track with every
   photo in the set, portrait-cropped like the grid tiles. It doesn't remount
   between steps — a single motion value springs to keep the current photo
   centered, so scrolling reads as moving *through the rail*, with the main
   image just following along.
   Rendered three times back-to-back (prev/current/next lap) and always
   centered on the *middle* lap: opening photo 0 (or any photo) then still
   has real thumbnails above it from the "previous lap", instead of running
   out at the top — the rail wraps the same way stepping through photos
   already does. */
function FilmstripRail({
  order,
  currentIndex,
  onJump,
}: {
  order: ArchiveOrderItem[];
  currentIndex: number;
  onJump: (i: number) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const y = useMotionValue(0);
  const [viewportH, setViewportH] = useState(0);
  const n = order.length;
  const tripled = [...order, ...order, ...order];
  const middleIndex = n + currentIndex;

  useLayoutEffect(() => {
    const el = railRef.current;
    if (!el) return;
    setViewportH(el.clientHeight);
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!viewportH) return;
    const target = viewportH / 2 - (middleIndex * RAIL_STEP + RAIL_ITEM_H / 2);
    const controls = fmAnimate(y, target, { type: "spring", stiffness: 260, damping: 34, mass: 0.8 });
    return () => controls.stop();
  }, [middleIndex, viewportH, y]);

  return (
    <div
      ref={railRef}
      className="hidden md:block"
      style={{
        position: "absolute",
        left: "clamp(20px, 3vw, 48px)",
        top: 0,
        bottom: 0,
        width: RAIL_ITEM_W + RAIL_BULGE + 6,
        overflow: "hidden",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div style={{ y, display: "flex", flexDirection: "column", gap: RAIL_GAP }}>
        {tripled.map((photo, idx) => {
          const isCurrent = idx === middleIndex;
          const distance = idx - middleIndex;
          return (
            <motion.button
              key={`${idx}-${photo.id}`}
              onClick={() => onJump(idx % n)}
              aria-label={photo.alt}
              aria-current={isCurrent}
              animate={{ x: railBulge(distance) }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{
                position: "relative",
                width: RAIL_ITEM_W,
                height: RAIL_ITEM_H,
                overflow: "hidden",
                flexShrink: 0,
                border: "none",
                padding: 0,
                opacity: isCurrent ? 1 : Math.max(0.28, 1 - Math.abs(distance) * 0.1),
                cursor: "pointer",
                transition: "opacity 0.25s ease",
              }}
            >
              <Image src={photo.src} alt="" fill sizes="64px" className="object-cover" loading="lazy" />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

const PEEK_CURRENT_W = "78vw";
const PEEK_GAP = 14;
const PEEK_THRESH = 60;
const PEEK_STEP_PX_FALLBACK = 300; // used only until the real slot width is measured
/* A 3:4-ish box sized off the slot's own width, capped at 64vh for very
   narrow/tall viewports — keeps the box close to what a portrait photo
   actually needs instead of always stretching to fill the available height,
   which left a visible gap between the image and the caption below it. */
const PEEK_BOX_H = `min(64vh, calc(${PEEK_CURRENT_W} * 4 / 3))`;

/* Mobile peek-carousel: previous/next photos sit partly visible at reduced
   opacity on either side of the current one (same box treatment as the
   desktop image, just narrower to leave room for the peek). The track never
   remounts between steps — on a committed swipe it finishes sliding all the
   way over, and only *then* hands off to the parent (which re-centers the
   now-current slot at x:0 in the same frame), so the motion reads as one
   continuous drag instead of a cut. */
function MobilePeekRow({
  order,
  currentIndex,
  onStep,
  closing,
  browsing,
  reveal,
  onLoad,
}: {
  order: ArchiveOrderItem[];
  currentIndex: number;
  onStep: (dir: 1 | -1) => void;
  closing: boolean;
  browsing: boolean;
  reveal: boolean;
  onLoad: () => void;
}) {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [stepPx, setStepPx] = useState(PEEK_STEP_PX_FALLBACK);
  const draggingRef = useRef(false);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setStepPx(el.clientWidth + PEEK_GAP);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = order.length;
  const prevIdx = (currentIndex - 1 + n) % n;
  const nextIdx = (currentIndex + 1) % n;
  const slots = [
    { item: order[prevIdx], side: -1 as const },
    { item: order[currentIndex], side: 0 as const },
    { item: order[nextIdx], side: 1 as const },
  ];

  async function handleDragEnd(_: unknown, info: PanInfo) {
    draggingRef.current = false;
    const committedNext = info.offset.x < -PEEK_THRESH || info.velocity.x < -600;
    const committedPrev = info.offset.x > PEEK_THRESH || info.velocity.x > 600;

    if (!committedNext && !committedPrev) {
      fmAnimate(x, 0, { type: "spring", stiffness: 380, damping: 38 });
      return;
    }

    const dir: 1 | -1 = committedNext ? 1 : -1;
    await fmAnimate(x, -dir * stepPx, {
      type: "spring",
      stiffness: 320,
      damping: 34,
      velocity: info.velocity.x,
    }).finished;
    onStep(dir);
    x.set(0);
  }

  return (
    <div style={{ position: "relative", width: "100%", height: PEEK_BOX_H, flexShrink: 0, overflow: "hidden" }}>
      <motion.div
        drag="x"
        style={{ x, position: "absolute", inset: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => { draggingRef.current = true; }}
        onDragEnd={handleDragEnd}
        onClick={(e) => { if (draggingRef.current || x.get() !== 0) e.stopPropagation(); }}
      >
        {slots.map(({ item, side }) => {
          const xOffset =
            side === -1
              ? `calc(-50% - (${PEEK_CURRENT_W} + ${PEEK_GAP}px))`
              : side === 1
              ? `calc(-50% + (${PEEK_CURRENT_W} + ${PEEK_GAP}px))`
              : "-50%";
          const wrapperStyle = {
            position: "absolute" as const,
            left: "50%",
            top: "50%",
            width: PEEK_CURRENT_W,
            height: PEEK_BOX_H,
            transform: `translate(${xOffset}, -50%)`,
            opacity: side === 0 ? 1 : 0.45,
            pointerEvents: side === 0 ? ("auto" as const) : ("none" as const),
          };

          if (side !== 0) {
            return (
              <div key={item.id} style={wrapperStyle}>
                <Image src={item.src} alt="" fill sizes="80vw" className="object-contain" />
              </div>
            );
          }

          /* current slot — same gated entrance reveal as the desktop image
             for the first photo shown after opening, plain crossfade + the
             closing wipe once the user has started browsing. */
          return !browsing ? (
            <motion.div
              key={item.id}
              ref={trackRef}
              style={wrapperStyle}
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: reveal ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
              transition={{ duration: (closing ? CLOSE_MS : REVEAL_MS) / 1000, ease: [0.65, 0, 0.35, 1] }}
            >
              <Image src={item.src} alt="" fill sizes="80vw" className="object-contain" onLoad={onLoad} priority />
            </motion.div>
          ) : (
            <motion.div
              key={item.id}
              ref={trackRef}
              style={wrapperStyle}
              animate={{ clipPath: closing ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 0% 0%)" }}
              transition={{ duration: closing ? CLOSE_MS / 1000 : 0.01, ease: [0.65, 0, 0.35, 1] }}
            >
              <Image src={item.src} alt="" fill sizes="80vw" className="object-contain" priority />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
