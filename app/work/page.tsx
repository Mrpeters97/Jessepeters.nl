"use client";

import WorkGrid from "@/components/WorkGrid";
import PageTitleOverlay from "@/components/PageTitleOverlay";
import { useInfiniteRounds } from "@/hooks/useInfiniteRounds";

const G = "20px";

export default function WorkPage() {
  const { topRounds, bottomRounds, splitRef, topSentinelRef, bottomSentinelRef } =
    useInfiniteRounds();

  return (
    <div style={{ paddingTop: G }}>
      <div ref={topSentinelRef} className="h-px" />

      {Array.from({ length: topRounds }, (_, r) => (
        <WorkRound key={`top-${r}`} />
      ))}
      <div ref={splitRef} />
      {Array.from({ length: bottomRounds }, (_, r) => (
        <WorkRound key={`bot-${r}`} />
      ))}

      <div ref={bottomSentinelRef} className="h-px" />

      <PageTitleOverlay title="Work" />
    </div>
  );
}

function WorkRound() {
  return (
    <div style={{ paddingLeft: G, paddingRight: G, paddingBottom: G }}>
      <WorkGrid />
    </div>
  );
}
