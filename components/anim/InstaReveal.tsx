"use client";

import { useEffect, useRef } from "react";
import AnimatedSvg from "./AnimatedSvg";
import styles from "./instaReveal.module.css";

/**
 * The Instagram-frame reveal shared by every case (Pulse20, Golfclub, Tynaarlo):
 * each card fades up as one piece — outline, avatar, icons together — one after
 * the other, then its post settles in. Timing lives in instaReveal.module.css.
 *
 * `cards` are the Figma names of the card outlines; every loose layer whose
 * centre sits inside a card joins that card. `posts` are the post layers in
 * card order, each revealed as a whole after its card.
 */
export default function InstaReveal({ svg, cards, posts, className }: { svg: string; cards: string[]; posts: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current?.firstElementChild;
    if (!host) return;
    const prepare = () => {
      const root = host.querySelector("svg");
      if (!root || root.querySelector("[data-reveal]")) return;
      const byName = (name: string) => root.querySelector(`[data-n="${CSS.escape(name)}"]`);
      const boxes = cards.map((name) => byName(name)?.getBoundingClientRect());
      const cardOf = (el: Element) => {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        return boxes.findIndex((b) => b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom);
      };
      const tag = (el: Element, kind: "card" | "post", i: number) => {
        el.setAttribute("data-reveal", kind);
        (el as SVGElement).style.setProperty("--i", String(i));
      };

      const postEls = posts.map(byName).filter((el): el is Element => !!el);
      postEls.forEach((el, i) => tag(el, "post", i));

      const layers = [...root.querySelectorAll("[data-n]")].filter((el) => !el.closest("defs, clipPath, mask, pattern, filter"));
      layers.forEach((el) => {
        if (layers.some((other) => other !== el && el.contains(other))) return;
        if (postEls.some((post) => post.contains(el))) return;
        const i = cardOf(el);
        if (i >= 0) tag(el, "card", i);
      });
    };
    prepare();
    /* React may swap the injected markup after hydration; tag the new copy too. */
    const observer = new MutationObserver(prepare);
    observer.observe(host, { childList: true });
    return () => observer.disconnect();
  }, [cards, posts]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      <AnimatedSvg svg={svg} className={`${styles.reveal} ${className ?? ""}`} />
    </div>
  );
}
