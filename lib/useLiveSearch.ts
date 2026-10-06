"use client";
import { useEffect, useState } from "react";
import type { Movie, Show } from "./types";
import { searchTitles } from "./tmdb";

/** Live TMDB search (debounced). Returns empty lists when TMDB isn't configured. */
export function useLiveSearch(query: string): { movies: Movie[]; shows: Show[]; loading: boolean } {
  const [result, setResult] = useState<{ movies: Movie[]; shows: Show[] }>({ movies: [], shows: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResult({ movies: [], shows: [] });
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const live = await searchTitles(q);
      if (!cancelled) {
        setResult(live ?? { movies: [], shows: [] });
        setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  return { ...result, loading };
}

/** Sample matches first, then live results that aren't already listed. */
export function mergeById<T extends { id: string }>(local: T[], live: T[]): T[] {
  const seen = new Set(local.map((x) => x.id));
  return [...local, ...live.filter((x) => !seen.has(x.id))];
}
