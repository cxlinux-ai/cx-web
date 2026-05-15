import type { ComponentType } from "react";

interface PostImageProps {
  slug: string;
  SvgComponent?: ComponentType<{ className?: string }>;
  src?: string;
  alt: string;
}

export function PostImage({ slug, SvgComponent, src, alt }: PostImageProps) {
  if (SvgComponent) {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-white/8 mb-10 aspect-[1200/630]">
        <SvgComponent className="w-full h-full" />
      </div>
    );
  }

  if (src) {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-white/8 mb-10">
        <img
          src={src}
          alt={alt}
          width={1200}
          height={630}
          loading="lazy"
          decoding="async"
          className="w-full aspect-[1200/630] object-cover"
        />
      </div>
    );
  }

  return null;
}
