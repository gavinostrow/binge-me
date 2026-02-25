"use client";

import { getRatingColor } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export default function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  const color = getRatingColor(rating);
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 min-w-[32px]",
    md: "text-sm px-2 py-1 min-w-[40px]",
    lg: "text-lg px-3 py-1.5 min-w-[52px] font-bold",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-display font-bold ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
    >
      <span className="text-white">{rating.toFixed(1)}</span>
    </span>
  );
}
