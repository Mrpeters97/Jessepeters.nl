"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const ASPECT = { half: "1512 / 1292", full: "3112 / 2584", full2: "3140 / 2584", wide: "2871 / 1305" } as const;

/** Detail-grid tile for a live animation: reserves the tile's exact ratio and enters like the image tiles. */
export default function AnimTile({
  size,
  background,
  delay = 0,
  mobile = false,
  children,
}: {
  size: keyof typeof ASPECT;
  background?: string;
  delay?: number;
  mobile?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="relative w-full self-start overflow-hidden"
      style={{ aspectRatio: ASPECT[size], backgroundColor: background, containerType: "inline-size" }}
      initial={{ opacity: 0, y: mobile ? 28 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: mobile ? "-12%" : "-18%" }}
      transition={{ duration: mobile ? 1 : 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
