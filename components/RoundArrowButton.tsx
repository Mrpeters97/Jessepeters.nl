/**
 * Solid round CTA affordance shared by project cards and moments tiles.
 * The 1px translucent-white rim keeps the button visible even when its
 * solid near-black fill lands on an equally dark photo/thumbnail.
 */
export default function RoundArrowButton({ size = 44 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-[#0E0E0D] text-white"
      style={{
        width: size,
        height: size,
        border: "1px solid rgba(255,255,255,0.28)",
      }}
    >
      <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
