"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ArchiveFocus, { type ArchiveOrderItem } from "@/components/ArchiveFocus";
import PhotoSheet from "@/components/PhotoSheet";
import PageTitleOverlay from "@/components/PageTitleOverlay";
import ArchiveOverlay from "@/components/ArchiveOverlay";
import { useReveal } from "@/hooks/useReveal";
import { usePageReady } from "@/hooks/usePageReady";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useInfiniteRounds } from "@/hooks/useInfiniteRounds";
import { archivePhotos } from "@/lib/data";
import { archiveCaptions } from "@/lib/archiveCaptions";
import { shuffled } from "@/lib/shuffle";

/* Filenames are already slug-like ("bali-nusa-penida-2022"), so the URL
   just reuses the basename — no separate slug map to keep in sync. */
function slugFromSrc(src: string) {
  return src.split("/").pop()!.replace(/\.[a-zA-Z0-9]+$/, "");
}

const BASE = archivePhotos.map((src, i) => ({
  id: `archive-${i + 1}`,
  src,
  alt: archiveCaptions[src]
    ? `${archiveCaptions[src].name}, ${archiveCaptions[src].location}`
    : `Archive ${i + 1}`,
}));

/* Split a flat list into three round-robin columns. */
function toColumns(list: typeof BASE) {
  return [
    list.filter((_, i) => i % 3 === 0),
    list.filter((_, i) => i % 3 === 1),
    list.filter((_, i) => i % 3 === 2),
  ];
}

/* Per-column responsive visibility: keep 0 & 1 always, reveal 2 at md. */
const COL_VISIBILITY = ["", "", "hidden md:flex"];

export default function ArchivePage() {
  const { topRounds, bottomRounds, splitRef, topSentinelRef, bottomSentinelRef } =
    useInfiniteRounds();
  const router = useRouter();
  // One canonical shuffled order, shared by the grid (split into columns
  // below) and the focus view — "next/previous photo" only means something
  // if both read from the same flat list. Deterministic on the server/first
  // paint to avoid a hydration mismatch, reshuffled once on mount.
  const [order, setOrder] = useState<ArchiveOrderItem[]>(BASE);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  /* The scroll-through focus view (rail + peek-navigation) is a desktop-only
     affordance — on mobile it's replaced by the same plain photo modal used
     for the archive filler photos on Work/Home, which reads better there. */
  const [mobilePhoto, setMobilePhoto] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    setOrder(shuffled(BASE));
  }, []);

  const cols = useMemo(() => toColumns(order), [order]);

  const openFocus = useCallback(
    (src: string) => {
      if (isMobile) {
        setMobilePhoto(src);
        return;
      }
      const i = order.findIndex((o) => o.src === src);
      if (i < 0) return;
      setFocusIndex(i);
      router.push(`/archive?photo=${slugFromSrc(src)}`, { scroll: false });
    },
    [order, router, isMobile]
  );

  const changeFocus = useCallback(
    (i: number) => {
      setFocusIndex(i);
      router.replace(`/archive?photo=${slugFromSrc(order[i].src)}`, { scroll: false });
    },
    [order, router]
  );

  const closeFocus = useCallback(() => {
    setFocusIndex(null);
    router.replace("/archive", { scroll: false });
  }, [router]);

  return (
    <>
      {!isMobile && (
        <Suspense fallback={null}>
          <DeepLinkSync order={order} onOpen={setFocusIndex} onClose={() => setFocusIndex(null)} />
        </Suspense>
      )}

      <div style={{ marginTop: "-50px" }}>
        <div ref={topSentinelRef} className="h-px" />

        <div className="flex gap-3 md:gap-4 px-3 md:px-4">
          {cols.map((base, ci) => (
            <ArchiveColumn
              key={ci}
              colIndex={ci}
              baseImages={base}
              topRounds={topRounds}
              bottomRounds={bottomRounds}
              offsetPx={ci === 1 ? (isMobile ? 70 : -150) : 0}
              parallaxFactor={!isMobile && ci === 1 ? -0.07 : 0}
              hideClass={COL_VISIBILITY[ci]}
              splitRef={ci === 0 ? splitRef : undefined}
              onSelect={openFocus}
            />
          ))}
        </div>

        <div ref={bottomSentinelRef} className="h-px" />
      </div>

      <ArchiveFocus
        order={order}
        index={focusIndex}
        onIndexChange={changeFocus}
        onClose={closeFocus}
      />
      {mobilePhoto && (
        <PhotoSheet
          src={mobilePhoto}
          open={!!mobilePhoto}
          onClose={() => setMobilePhoto(null)}
        />
      )}

      <PageTitleOverlay title="Archive" />
    </>
  );
}

/* Isolated in its own component (wrapped in Suspense above) because
   useSearchParams otherwise forces the whole page to de-opt from static
   rendering. Keeps focus-view state in sync with ?photo=<slug> in both
   directions: resolves it to an index on mount/change (deep link opens
   straight into that photo), and closes the view when the param disappears
   — which is what makes the browser back button close it, since going back
   only changes the URL, not React state. */
function DeepLinkSync({
  order,
  onOpen,
  onClose,
}: {
  order: ArchiveOrderItem[];
  onOpen: (i: number) => void;
  onClose: () => void;
}) {
  const searchParams = useSearchParams();
  const photo = searchParams.get("photo");

  useEffect(() => {
    if (!photo) { onClose(); return; }
    const i = order.findIndex((o) => slugFromSrc(o.src) === photo);
    if (i >= 0) onOpen(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, order]);

  return null;
}

function ArchiveColumn({
  colIndex,
  baseImages,
  topRounds,
  bottomRounds,
  offsetPx,
  parallaxFactor = 0,
  hideClass = "",
  splitRef,
  onSelect,
}: {
  colIndex: number;
  baseImages: { id: string; src: string; alt: string }[];
  topRounds: number;
  bottomRounds: number;
  offsetPx: number;
  parallaxFactor?: number;
  hideClass?: string;
  splitRef?: RefObject<HTMLDivElement | null>;
  onSelect: (src: string) => void;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => offsetPx + v * parallaxFactor);

  const topImages = Array.from({ length: topRounds }, (_, r) =>
    baseImages.map((img, bi) => ({ ...img, id: `top-r${r}-${img.id}`, bi }))
  ).flat();

  const bottomImages = Array.from({ length: bottomRounds }, (_, r) =>
    baseImages.map((img, bi) => ({ ...img, id: `bot-r${r}-${img.id}`, bi, eager: r === 0 }))
  ).flat();

  /* small, bounded cascade: items in a row drop in left→right, top→bottom; the
     %5 cap keeps the delay tiny for images revealed individually on scroll */
  const delayFor = (bi: number) => (bi % 5) * 0.07 + colIndex * 0.05;

  return (
    <motion.div
      className={`flex flex-col gap-3 md:gap-4 flex-1 pb-24${hideClass ? ` ${hideClass}` : ""}`}
      style={{ y }}
    >
      {topImages.map((img) => (
        <ArchiveImage
          key={img.id}
          img={img}
          fromBelow={false}
          delay={delayFor(img.bi)}
          onSelect={onSelect}
        />
      ))}
      {splitRef !== undefined && <div ref={splitRef} />}
      {bottomImages.map((img) => (
        <ArchiveImage
          key={img.id}
          img={img}
          fromBelow={true}
          delay={delayFor(img.bi)}
          eager={img.eager}
          onSelect={onSelect}
        />
      ))}
    </motion.div>
  );
}

function ArchiveImage({
  img,
  fromBelow,
  delay,
  eager = false,
  onSelect,
}: {
  img: { id: string; src: string; alt: string };
  fromBelow: boolean;
  delay: number;
  eager?: boolean;
  onSelect: (src: string) => void;
}) {
  const { shown, onViewportEnter, viewport } = useReveal("0px 0px -22% 0px");
  const ready = usePageReady();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  /* The -22% viewport margin makes tiles reveal pleasantly on scroll, but on
     first arrival it leaves tiles near the bottom edge of the screen invisible
     (empty corners) until the user scrolls. Measure once the page is `ready`
     (loader/transition fully gone): by then the scroll jump has certainly been
     applied — including Lenis' async jump on client-side navigation, which a
     mount-time measurement runs too early for. Anything already inside the
     viewport reveals immediately. */
  useEffect(() => {
    if (!ready) return;
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) onViewportEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <motion.div
      style={{ overflow: "hidden", borderRadius: 0 }}
      whileHover={{ borderRadius: 10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        ref={btnRef}
        onClick={() => onSelect(img.src)}
        className="group relative w-full overflow-hidden"
        style={{
          aspectRatio: "3 / 4",
          padding: 0,
          border: "none",
          display: "block",
          contentVisibility: "auto",
        }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, y: fromBelow ? 70 : -70 }}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: fromBelow ? 70 : -70 }}
          onViewportEnter={onViewportEnter}
          viewport={viewport}
          transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(max-width: 768px) 33vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading={eager ? "eager" : "lazy"}
          />
          <ArchiveOverlay src={img.src} compact />
        </motion.div>
      </button>
    </motion.div>
  );
}
