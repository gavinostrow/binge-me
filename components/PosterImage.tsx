"use client";
import Image from "next/image";
import { useState } from "react";

// TMDB image base — works without an API key
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// Deterministic gradient from title string
function getPosterGradient(title: string): [string, string] {
  const gradients: [string, string][] = [
    ["#7C5CF6", "#4338CA"],
    ["#EC4899", "#9D174D"],
    ["#F59E0B", "#B45309"],
    ["#14B8A6", "#0E7490"],
    ["#22C55E", "#15803D"],
    ["#3B82F6", "#1D4ED8"],
    ["#EF4444", "#991B1B"],
    ["#F97316", "#C2410C"],
    ["#8B5CF6", "#6D28D9"],
    ["#06B6D4", "#0369A1"],
    ["#10B981", "#065F46"],
    ["#6366F1", "#3730A3"],
  ];
  const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

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
  const [color1, color2] = getPosterGradient(title);
  const showReal = posterPath && !imgError;
  const sizeClass = SIZE_CLASSES[size];

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`${sizeClass} ${className} relative rounded-xl overflow-hidden flex-shrink-0 ${
        onClick ? "active:scale-95 transition-transform" : ""
      }`}
      style={{ background: `linear-gradient(160deg, ${color1}, ${color2})` }}
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
            className="font-display font-black text-white leading-tight"
            style={{ fontSize: size === "sm" ? "8px" : size === "md" ? "9px" : "13px" }}
          >
            {title}
          </p>
          {year && size !== "sm" && (
            <p className="text-white/60 font-body mt-0.5" style={{ fontSize: "8px" }}>
              {year}
            </p>
          )}
        </div>
      )}

      {/* Subtle gloss overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
        }}
      />
    </Wrapper>
  );
}
