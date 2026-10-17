"use client";

import { motion } from "framer-motion";
import DeBoerCube from "./DeBoerCube";

/** Detail-grid tile with De Boer RVS's spinning logo cube, in the proportions of the original logo still (cube = ⅓ of the tile width). */
export default function CubeTile({ background, delay = 0, mobile = false }: { background: string; delay?: number; mobile?: boolean }) {
  return (
    <motion.div
      className="relative w-full self-start overflow-hidden"
      style={{ aspectRatio: "1134 / 969" }}
      initial={{ opacity: 0, y: mobile ? 28 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: mobile ? "-12%" : "-18%" }}
      transition={{ duration: mobile ? 1 : 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <DeBoerCube alt="De Boer RVS logo" size="33.333cqw" background={background} />
    </motion.div>
  );
}
