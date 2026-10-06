"use client";
import { useEffect, useState } from "react";
import type { Show } from "./types";
import { searchShows } from "./tmdb";

/** Live TMDB show search (debounced). Returns an empty list when TMDB isn't configured. */
export function useLiveSearch(query: string): { shows: Show[]; loading: boolean } {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setShows([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const live = await searchShows(q);
      if (!cancelled) {
        setShows(live ?? []);
        setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  return { shows, loading };
}

/** Sample matches first, then live results that aren't already listed. */
export function mergeById<T extends { id: string }>(local: T[], live: T[]): T[] {
  const seen = new Set(local.map((x) => x.id));
  return [...local, ...live.filter((x) => !seen.has(x.id))];
}
