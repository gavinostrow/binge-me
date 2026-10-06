"use client";
import Image from "next/image";
import { useState } from "react";

// TMDB image base — works without an API key
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";


interface PosterImageProps {
  title: string;
  year?: number;
  posterPath?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASSES = {
  sm: "w-10 h-14",
  md: "w-14 h-20",
  lg: "w-24 h-36",
  xl: "w-full aspect-[2/3]",
};

export default function PosterImage({
  title,
  year,
  posterPath,
  size = "md",
  className = "",
  onClick,
}: PosterImageProps) {
  const [imgError, setImgError] = useState(false);
  const showReal = posterPath && !imgError;
  const sizeClass = SIZE_CLASSES[size];

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`${sizeClass} ${className} relative rounded-xl overflow-hidden flex-shrink-0 ${
        onClick ? "transition-transform" : ""
      }`}
      style={{ background: "rgb(var(--bg-elevated))" }}
    >
      {showReal ? (
        <Image
          src={`${TMDB_IMG}${posterPath}`}
          alt={title}
          fill
          sizes="(max-width: 430px) 50vw, 200px"
          className="object-cover"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
          <p
            className="font-display font-semibold text-text-secondary leading-tight"
            style={{ fontSize: size === "sm" ? "8px" : size === "md" ? "9px" : "13px" }}
          >
            {title}
          </p>
          {year && size !== "sm" && (
            <p className="text-text-muted font-mono mt-0.5" style={{ fontSize: "8px" }}>
              {year}
            </p>
          )}
        </div>
      )}

      {/* Subtle gloss overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 0 1px rgb(var(--border))",
        }}
      />
    </Wrapper>
  );
}
