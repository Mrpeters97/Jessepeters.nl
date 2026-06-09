"use client";

import { useState } from "react";
import { useAnimationControls } from "framer-motion";
import type React from "react";

function getEdge(e: React.MouseEvent<HTMLElement>): { x: string; y: string } {
  const rect = e.currentTarget.getBoundingClientRect();
  // Normalise by half-size so aspect ratio is accounted for (wide pills get natural left/right zones)
  const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
  const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
  const angle = Math.atan2(y, x) * (180 / Math.PI);

  if (angle > -45 && angle <= 45)  return { x: "110%",  y: "0%" };   // right
  if (angle > 45  && angle <= 135) return { x: "0%",    y: "110%" };  // bottom
  if (angle > 135 || angle <= -135) return { x: "-110%", y: "0%" };   // left
  return { x: "0%", y: "-110%" };                                      // top
}

export function useDirectionalFill(reverse = false) {
  const [isHovering, setIsHovering] = useState(false);
  const controls = useAnimationControls();

  function onMouseEnter(e: React.MouseEvent<HTMLElement>) {
    const edge = getEdge(e);
    if (reverse) {
      /* fill is covering by default → slide it out toward the entry edge */
      controls.start({ ...edge, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } });
    } else {
      controls.set(edge);
      controls.start({ x: "0%", y: "0%", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } });
    }
    setIsHovering(true);
  }

  function onMouseLeave(e: React.MouseEvent<HTMLElement>) {
    if (reverse) {
      /* slide the fill back in to cover from wherever it currently sits */
      controls.start({ x: "0%", y: "0%", transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } });
    } else {
      const edge = getEdge(e);
      controls.start({ ...edge, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } });
    }
    setIsHovering(false);
  }

  return { controls, isHovering, onMouseEnter, onMouseLeave };
}
