"use client";

import { getRatingColor } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

/** Score set like a newspaper box score: bold tabular numerals, a thin rule in the score's color. */
export default function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  const color = getRatingColor(rating);
  const sizeClasses = {
    sm: "text-[12px] px-1 h-5 min-w-[32px]",
    md: "text-[14px] px-1.5 h-6 min-w-[38px]",
    lg: "text-lg px-2 h-8 min-w-[50px]",
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-bold leading-none ${sizeClasses[size]}`}
      style={{ color, boxShadow: `inset 0 0 0 1px ${color}` }}
    >
      {rating.toFixed(1)}
    </span>
  );
}
