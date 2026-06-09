"use client";

import Image from "next/image";

const photos = [
  "/images/portrait/jesse-1.jpg",
  "/images/portrait/jesse-2.jpg",
  "/images/portrait/jesse-3.jpg",
  "/images/portrait/jesse-4.jpg",
  "/images/portrait/jesse-5.jpg",
  "/images/portrait/jesse-6.jpg",
];

export default function InfinitePhotoBackdrop() {
  const sequence = [...photos, ...photos];

  return (
    <div
      className="absolute top-0 left-0 right-0 h-screen overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 flex items-end pb-20 md:pb-32">
        <div className="marquee-track flex gap-4 md:gap-6 w-max">
          {sequence.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative shrink-0 w-[200px] md:w-[280px] xl:w-[340px] aspect-[3/4] overflow-hidden rounded-md"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 200px, (max-width: 1280px) 280px, 340px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(14,14,13,0) 0%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}
