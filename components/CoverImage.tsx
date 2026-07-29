"use client";

import Image from "next/image";

/**
 * A 1px overhang on every side hides the sub-pixel gap that object-cover
 * otherwise leaves at a fractional-width edge, plus the shared hover-zoom
 * treatment used by every project/moments tile image. Must render inside a
 * `position: relative; overflow: hidden` ancestor with a `.group` class for
 * the hover-zoom to trigger correctly.
 */
export default function CoverImage({
  src,
  alt = "",
  sizes,
  loading,
}: {
  src: string;
  alt?: string;
  sizes: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <div className="absolute" style={{ inset: "-1px" }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={loading}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
    </div>
  );
}
