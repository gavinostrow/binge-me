"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import type { Show } from "@/lib/types";

/** On a show page: mark it Currently Watching (show + season), move to the next season, or finish. */
export default function WatchingControl({ show }: { show: Show }) {
  const { setActiveTab, clearStack, getMyShowRating } = useApp();
  const { myWatching, startWatching, setWatchingSeason, stopWatching, requestRate, showToast } = useSocial();
  const entry = myWatching.find((w) => w.showId === show.id);
  const totalSeasons = Math.max(1, show.seasons || 1);
  const rated = getMyShowRating(show.id)?.seasonRatings.map((s) => s.season) ?? [];
  const firstUnrated = Array.from({ length: totalSeasons }, (_, i) => i + 1).find((s) => !rated.includes(s)) ?? totalSeasons;
  const [picking, setPicking] = useState(false);
  const [season, setSeason] = useState(firstUnrated);

  const finishSeason = () => {
    if (!entry) return;
    const done = entry.season;
    if (done < totalSeasons) {
      setWatchingSeason(show.id, done + 1);
    } else {
      stopWatching(show.id);
    }
    requestRate(show.id, done);
    showToast(`Nice — rate Season ${done}`);
    clearStack();
    setActiveTab("add");
  };

  if (entry && !picking) {
    return (
      <div className="bg-bg-card rounded-2xl p-4 border border-accent/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rating-green animate-pulse" />
          <p className="text-text-primary text-xs font-body uppercase font-bold tracking-[0.08em]">Currently watching</p>
          <button onClick={() => stopWatching(show.id)} className="ml-auto text-text-muted text-xs font-body">
            Remove
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <SeasonStepper
            value={entry.season}
            max={totalSeasons}
            onChange={(s) => setWatchingSeason(show.id, s)}
          />
          <button
            onClick={finishSeason}
            className="flex-1 py-2.5 rounded-xl bg-accent text-bg-primary text-sm font-body font-semibold transition-transform"
          >
            Finished Season {entry.season}
          </button>
        </div>
      </div>
    );
  }

  if (picking) {
    return (
      <div className="border-t border-text-primary pt-3 animate-fadeIn">
        <p className="text-text-primary text-sm font-display font-semibold mb-3">Which season are you on?</p>
        <div className="flex items-center gap-3">
          <SeasonStepper value={season} max={totalSeasons} onChange={setSeason} />
          <button
            onClick={() => {
              startWatching(show.id, season);
              setPicking(false);
              showToast(`Added to Currently Watching`);
            }}
            className="flex-1 py-2.5 rounded-xl bg-accent text-bg-primary text-sm font-body font-semibold transition-transform"
          >
            Save
          </button>
          <button onClick={() => setPicking(false)} className="text-text-muted text-sm font-body px-1">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setPicking(true)}
      className="w-full py-3 rounded-2xl bg-bg-card border border-border text-text-primary text-sm font-body font-semibold flex items-center justify-center gap-2 active:bg-bg-elevated transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-rating-green" />
      I&apos;m watching this
    </button>
  );
}

export function SeasonStepper({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center bg-bg-elevated rounded-xl border border-border">
      <button
        aria-label="Previous season"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="w-9 h-10 text-text-secondary disabled:opacity-30 text-lg"
      >
        −
      </button>
      <span className="font-display font-bold text-text-primary text-sm w-16 text-center">Season {value}</span>
      <button
        aria-label="Next season"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="w-9 h-10 text-text-secondary disabled:opacity-30 text-lg"
      >
        +
      </button>
    </div>
  );
}
