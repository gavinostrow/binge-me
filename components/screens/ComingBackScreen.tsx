"use client";
import { useApp } from "@/lib/AppContext";
import { useComingBack } from "@/lib/useComingBack";
import { nextSeasonLabel } from "@/lib/showExtras";
import { knownExtras } from "@/lib/useTitleExtras";
import PosterImage from "@/components/PosterImage";
import { ProviderLogos } from "@/components/social/ProviderChips";
import ScreenHeader from "@/components/social/ScreenHeader";

const WHY: Record<string, string> = { watching: "Watching", rated: "You rated it", watchlist: "On your watchlist" };

export default function ComingBackScreen() {
  const { pushScreen } = useApp();
  const items = useComingBack();

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader title="Coming Back" subtitle="Your shows with new seasons on the way" />
      <div className="px-4 pb-28 pt-2 space-y-2">
        {items.length === 0 && (
          <p className="text-text-secondary text-sm text-center py-12">
            Nothing announced yet for your shows. Rate or watchlist shows and they&apos;ll show up here.
          </p>
        )}
        {items.map(({ show, next, why }) => {
          const label = nextSeasonLabel(next);
          return (
            <button
              key={show.id}
              onClick={() => pushScreen({ screen: "show-detail", showId: show.id })}
              className="w-full bg-bg-card border border-border rounded-2xl p-3 flex items-center gap-3 text-left active:bg-bg-elevated transition-colors"
            >
              <PosterImage title={show.title} year={show.year} posterPath={show.posterPath} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-display font-semibold text-sm truncate">{show.title}</p>
                <p className={`text-xs font-body mt-0.5 ${label.tone === "good" ? "text-rating-green" : "text-accent-gold"}`}>
                  {label.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <ProviderLogos providers={knownExtras(show).providers} />
                  <span className="text-text-muted text-[10px] font-body">{WHY[why]}</span>
                </div>
              </div>
              {label.detail && next.kind === "date" && (
                <span className="text-text-secondary text-[11px] font-body font-semibold flex-shrink-0">{label.detail}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
