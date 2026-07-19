import type { CSSProperties } from "react";

/**
 * Shared glass chrome for the floating menu + theme toggle.
 * - over the hero: dark tint so the pill reads over the photo strip;
 * - dark theme: subtle light-on-dark gradient;
 * - light theme: semi-opaque light fill (not a tint) so the pill stays
 *   consistently light even when it floats over a dark card — backdrop blur
 *   alone let dark content bleed through.
 */
export function glassStyle(overHero: boolean, isDark: boolean): CSSProperties {
  if (overHero) {
    return {
      background: "rgba(14, 14, 13, 0.58)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
    };
  }
  if (isDark) {
    return {
      background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
      border: "1px solid rgba(255,255,255,0.13)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
    };
  }
  return {
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.60)",
  };
}
