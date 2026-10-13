"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lazy, view-driven playback for decorative clips: the source is only attached
 * once the container nears the viewport, and every time it scrolls into view
 * the clip restarts from its first frame and fades in from opacity 0 (so an
 * animation is always seen from the beginning, never halfway). Leaving the
 * viewport pauses it and hides it again for the next entry.
 *
 * With `once`, the clip plays a single time: leaving the viewport only pauses
 * it, coming back resumes, and once it has ended it rests on its last frame.
 * `nearMargin` sets how far ahead of the viewport the source starts loading.
 */
export function useInViewVideo<T extends HTMLElement>(threshold = 0.35, once = false, nearMargin = "50% 0px") {
  const containerRef = useRef<T>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: nearMargin }
    );
    const viewObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    nearObserver.observe(el);
    viewObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, [threshold, nearMargin]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!inView) {
      video.pause();
      if (!once) setPlaying(false);
      return;
    }
    if (once && video.ended) return;
    let cancelled = false;
    if (!once) video.currentTime = 0;
    video
      .play()
      .then(() => !cancelled && setPlaying(true))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [inView, near, once]);

  return { containerRef, videoRef, near, playing };
}
