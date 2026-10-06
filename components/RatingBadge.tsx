"use client";

import { getRatingColor } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

/** Score in mono numerals on a faint tint of its rating color. */
export default function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  const color = getRatingColor(rating);
  const sizeClasses = {
    sm: "text-[11px] px-1.5 h-5 min-w-[34px]",
    md: "text-[13px] px-2 h-6 min-w-[40px]",
    lg: "text-base px-2.5 h-8 min-w-[52px]",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded font-mono font-semibold leading-none ${sizeClasses[size]}`}
      style={{ color, backgroundColor: `${color}1A`, boxShadow: `inset 0 0 0 1px ${color}40` }}
    >
      {rating.toFixed(1)}
    </span>
  );
}
