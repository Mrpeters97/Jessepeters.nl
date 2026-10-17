"use client";

import { OverviewScene } from "./CivScene";

/** Card cover (Figma "overview"): a wave runs through the headline, like on civwater.nl. */
export function CivCover({ alt }: { alt: string }) {
  return <OverviewScene cover label={alt} />;
}
