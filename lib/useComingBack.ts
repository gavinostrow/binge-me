"use client";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "./AppContext";
import { useSocial } from "./SocialContext";
import { getShow } from "./catalog";
import { comingBackRank, type NextSeason } from "./showExtras";
import { knownExtras } from "./useTitleExtras";
import { fetchShowExtras } from "./tmdb";
import type { Show } from "./types";

export interface ComingBackItem {
  show: Show;
  next: NextSeason;
  why: "watching" | "rated" | "watchlist";
}

/** Your shows (rated, watching, or on your watchlist) that are airing or coming back, soonest first. */
export function useComingBack(): ComingBackItem[] {
  const { showRatings, watchlist } = useApp();
  const { myWatching } = useSocial();
  const [liveNext, setLiveNext] = useState<Record<string, NextSeason>>({});

  const candidates = useMemo(() => {
    const map = new Map<string, { show: Show; why: ComingBackItem["why"] }>();
    showRatings.forEach((r) => map.set(r.show.id, { show: r.show, why: "rated" }));
    watchlist.forEach((w) => w.show && !map.has(w.show.id) && map.set(w.show.id, { show: w.show, why: "watchlist" }));
    myWatching.forEach((w) => {
      const show = getShow(w.showId);
      if (show) map.set(show.id, { show, why: "watching" });
    });
    return Array.from(map.values());
  }, [showRatings, watchlist, myWatching]);

  // Refresh with live TMDB dates when available.
  useEffect(() => {
    let cancelled = false;
    candidates.forEach(({ show }) => {
      if (!show.tmdbId || show.status === "ended") return;
      fetchShowExtras(show.tmdbId).then((live) => {
        if (!cancelled && live?.next) setLiveNext((prev) => ({ ...prev, [show.id]: live.next! }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  return useMemo(
    () =>
      candidates
        .map(({ show, why }) => ({ show, why, next: liveNext[show.id] ?? knownExtras("show", show).next }))
        .filter((x): x is ComingBackItem => comingBackRank(x.next) !== null)
        .sort((a, b) => comingBackRank(a.next)! - comingBackRank(b.next)!),
    [candidates, liveNext],
  );
}
