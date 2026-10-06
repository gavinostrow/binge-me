"use client";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { getShow } from "@/lib/catalog";
import { knownExtras } from "@/lib/useTitleExtras";
import PosterImage from "@/components/PosterImage";
import { ProviderLogos } from "./ProviderChips";

/** Profile: what you're watching right now — just the show and the season. */
export default function CurrentlyWatchingSection() {
  const { pushScreen, setActiveTab } = useApp();
  const { myWatching, setWatchingSeason, stopWatching, requestRate, showToast } = useSocial();

  const finish = (showId: string, season: number, total: number) => {
    if (season < total) setWatchingSeason(showId, season + 1);
    else stopWatching(showId);
    requestRate(showId, season);
    showToast(`Nice — rate Season ${season}`);
    setActiveTab("add");
  };

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {myWatching.length > 0 && <span className="w-2 h-2 rounded-full bg-rating-green animate-pulse" />}
          <p className="text-text-muted text-xs font-body uppercase tracking-wider">Currently watching</p>
        </div>
        <button onClick={() => pushScreen({ screen: "search" })} className="text-accent-light text-xs font-body font-semibold">
          + Add
        </button>
      </div>

      {myWatching.length === 0 ? (
        <p className="text-text-secondary text-sm font-body py-3">
          Nothing right now. Open any show and tap &ldquo;I&apos;m watching this.&rdquo;
        </p>
      ) : (
        <div className="divide-y divide-border">
          {myWatching.map((w) => {
            const show = getShow(w.showId);
            if (!show) return null;
            return (
              <div key={w.showId} className="flex items-center gap-3 py-2.5">
                <button
                  onClick={() => pushScreen({ screen: "show-detail", showId: show.id })}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <PosterImage title={show.title} year={show.year} posterPath={show.posterPath} size="sm" />
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-display font-semibold truncate">{show.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-text-secondary text-xs font-body">Season {w.season}</span>
                      <ProviderLogos providers={knownExtras(show).providers} max={1} />
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => finish(show.id, w.season, Math.max(1, show.seasons || 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border text-text-secondary text-[11px] font-body font-semibold flex-shrink-0"
                >
                  Finished S{w.season}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
