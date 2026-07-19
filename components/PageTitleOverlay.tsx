import RevealText from "@/components/RevealText";

/** Fixed page title ("Work" / "Archive") — bottom-right, difference-blended
 *  so it inverts against the grid content scrolling behind it. */
export default function PageTitleOverlay({ title }: { title: string }) {
  return (
    <div
      className="pointer-events-none fixed hidden md:block"
      style={{ bottom: 0, right: "30px", zIndex: 30, mixBlendMode: "difference" }}
    >
      <RevealText
        as="span"
        className="overlay-title"
        style={{ fontSize: "clamp(48px, 9vw, 150px)", display: "inline-block" }}
      >
        {title}
      </RevealText>
    </div>
  );
}
