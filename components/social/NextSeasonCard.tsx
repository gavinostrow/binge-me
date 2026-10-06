"use client";
import { nextSeasonLabel, type NextSeason } from "@/lib/showExtras";

export default function NextSeasonCard({ next }: { next: NextSeason | undefined }) {
  const label = nextSeasonLabel(next);
  const dot = label.tone === "good" ? "bg-rating-green" : label.tone === "neutral" ? "bg-accent-gold" : "bg-text-muted";
  return (
    <div className="border-t border-text-primary pt-3">
      <p className="text-text-primary text-xs font-body uppercase font-bold tracking-[0.08em] mb-2">Next season</p>
      <div className="flex items-start gap-2.5">
        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dot} ${next?.kind === "airing" ? "animate-pulse" : ""}`} />
        <div className="min-w-0">
          <p className="text-text-primary text-sm font-display font-semibold leading-snug">{label.title}</p>
          {label.detail && <p className="text-text-secondary text-xs font-body mt-0.5">{label.detail}</p>}
        </div>
      </div>
    </div>
  );
}
