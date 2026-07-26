"use client";

import { motion } from "framer-motion";
import FillPill from "@/components/FillPill";
import { useDirectionalFill } from "@/components/useDirectionalFill";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

const socials = [
  { href: "https://www.linkedin.com/in/jesse-peters-599219173", label: "Linkedin" },
  { href: "https://www.awwwards.com/Jesse_peters/", label: "Awwwards" },
  { href: "https://www.instagram.com/pesse.jeters", label: "Instagram" },
];

const MAIL = "mailto:hi@jessepeters.nl";

/**
 * "Say, hi!" + arrow circle act as ONE button: a single hover drives the
 * reverse directional fill on both halves at once, in the same direction.
 */
function SayHiButton() {
  const { controls, isHovering, onMouseEnter, onMouseLeave } = useDirectionalFill(true);
  const textColor = isHovering ? "var(--white)" : "var(--bg)";

  const fill = (
    <motion.span
      initial={{ x: "0%", y: "0%" }}
      animate={controls}
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundColor: "var(--white)", borderRadius: "inherit" }}
    />
  );

  return (
    <div
      className="group inline-flex flex-wrap items-center"
      style={{ gap: "clamp(8px, 0.7vw, 14px)" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <a href={MAIL} className="pill pill-ghost pill-lg relative overflow-hidden">
        {fill}
        <span className="relative z-10" style={{ color: textColor, transition: "color 0.15s ease-in-out" }}>
          Say, hi!
        </span>
      </a>
      <a href={MAIL} aria-label="Send an email" className="icon-button relative overflow-hidden">
        {fill}
        <span className="relative z-10" style={{ color: textColor, transition: "color 0.15s ease-in-out" }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="arrow-icon"
            style={{
              width: "clamp(30px, 3.4vw, 52px)",
              height: "clamp(30px, 3.4vw, 52px)",
              transform: isHovering ? "rotate(-15deg)" : "rotate(0deg)",
            }}
          >
            <path
              d="M7 17L17 7M17 7H8M17 7V16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </div>
  );
}

export default function SayHiCluster({
  topClass = "pt-20 md:pt-28",
}: {
  /** Override the top spacing per page (about wants a tighter gap). */
  topClass?: string;
} = {}) {
  return (
    // pb-28 on mobile so the floating menu never covers the socials
    <section className={`page-padding pb-28 md:pb-16 ${topClass}`}>
      <motion.div {...fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <SayHiButton />
      </motion.div>

      <motion.nav
        className="flex flex-nowrap"
        style={{ marginTop: "clamp(20px, 2vw, 40px)", gap: "clamp(8px, 1.2vw, 20px)" }}
        aria-label="Social"
        {...fadeUp}
        transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {socials.map(({ href, label }) => (
          <FillPill key={label} href={href} external className="pill-social">
            {label}
          </FillPill>
        ))}
      </motion.nav>
    </section>
  );
}
